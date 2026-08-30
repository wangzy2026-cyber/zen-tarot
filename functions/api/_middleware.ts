// /api/* 统一限流中间件（8.22 盗刷修复）：按 IP 每分钟 6 次、每天 150 次。
// 基线对照：正常用户在塔罗页连续抽牌不会超过 6 次/分钟；8.22 盗刷节奏是
// 44 次/分钟/IP（2,637 次 / 60 分钟），会被直接 429。限流在 DeepSeek 调用之前生效，
// 被限流的请求不会消耗任何 token。
// 计数存 D1（表懒建）；若 DB 绑定不可用则放行 —— 宁可限流失效也不能把站打挂。

type Ctx = {
  request: Request;
  env: any;
  next: () => Promise<Response>;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LIMITS = [
  { windowSec: 60, max: 6 }, // 每分钟 6 次
  { windowSec: 86400, max: 150 }, // 每天 150 次
];

async function bump(db: any, ip: string, windowSec: number, max: number) {
  const bucket = Math.floor(Date.now() / (windowSec * 1000));
  const key = `rl:${ip}:${windowSec}:${bucket}`;

  const row = await db.prepare("SELECT count FROM rate_limit WHERE key = ?").bind(key).first();
  if (!row) {
    // 新桶：顺手清一次 48 小时前的旧行（只在建新桶时做，避免每请求都删）
    await db
      .prepare("DELETE FROM rate_limit WHERE updated_at < ?")
      .bind(Date.now() - 2 * 86400 * 1000)
      .run();
    await db
      .prepare("INSERT INTO rate_limit (key, count, updated_at) VALUES (?, 1, ?)")
      .bind(key, Date.now())
      .run();
    return { ok: true, remaining: max - 1, retryAfter: undefined };
  }
  const count = row.count + 1;
  await db
    .prepare("UPDATE rate_limit SET count = ?, updated_at = ? WHERE key = ?")
    .bind(count, Date.now(), key)
    .run();
  return {
    ok: count <= max,
    remaining: Math.max(0, max - count),
    retryAfter: windowSec - (Date.now() % (windowSec * 1000)),
  };
}

export async function onRequest(context: Ctx): Promise<Response> {
  // OPTIONS 预检不打计数
  if (context.request.method === "OPTIONS") {
    return context.next();
  }

  const db = context.env?.DB;
  if (!db) return context.next();

  const ip =
    context.request.headers.get("CF-Connecting-IP") ||
    context.request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  try {
    await db
      .prepare(
        "CREATE TABLE IF NOT EXISTS rate_limit (key TEXT PRIMARY KEY, count INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL)"
      )
      .run();

    for (const { windowSec, max } of LIMITS) {
      const r = await bump(db, ip, windowSec, max);
      if (!r.ok) {
        return new Response(
          JSON.stringify({
            error: "请求过于频繁，请稍后再试",
            limit: windowSec,
            remaining: 0,
          }),
          {
            status: 429,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
              "Retry-After": String(r.retryAfter ?? 60),
            },
          }
        );
      }
    }
  } catch {
    // DB 异常时放行（可用性优先）
  }

  return context.next();
}
