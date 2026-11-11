// /api/follow-ups —— 「后来」：用户在占卜若干天后补写的近况。
// 单独一张表（不塞进 tarot_readings：那张表一行是一张牌，一次占卜有 1–10 行）。
// 每个用户每次占卜只保留最新一条（主键 anonymous_id + reading_id，重写即覆盖）。
// 表懒建，和 rate_limit 表同样的做法；限流由 _middleware.ts 统一负责。

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const MAX_CONTENT = 200;
const MAX_ID = 64;

async function ensureTable(db: any) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS follow_ups (
        anonymous_id TEXT NOT NULL,
        reading_id   TEXT NOT NULL,
        content      TEXT NOT NULL,
        created_at   TEXT NOT NULL,
        PRIMARY KEY (anonymous_id, reading_id)
      )`
    )
    .run();
}

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

// GET /api/follow-ups?anonymous_id=xxx  —— 只能取自己的
export async function onRequestGet(context: any) {
  try {
    const anonymousId = new URL(context.request.url).searchParams.get("anonymous_id") || "";
    if (!anonymousId || anonymousId.length > MAX_ID) {
      return json({ error: "缺少 anonymous_id 参数" }, 403);
    }
    const db = context.env.DB;
    await ensureTable(db);
    const result = await db
      .prepare(
        "SELECT reading_id, content, created_at FROM follow_ups WHERE anonymous_id = ? ORDER BY created_at DESC LIMIT 500"
      )
      .bind(anonymousId)
      .all();
    return json(result.results || []);
  } catch (e: any) {
    return json({ error: e?.message || "Unknown error" }, 500);
  }
}

// POST /api/follow-ups  { anonymous_id, reading_id, content }
export async function onRequestPost(context: any) {
  try {
    const body = await context.request.json();
    const anonymousId = String(body?.anonymous_id || "").trim();
    const readingId = String(body?.reading_id || "").trim();
    const content = String(body?.content || "").trim();

    if (!anonymousId || !readingId || anonymousId.length > MAX_ID || readingId.length > MAX_ID) {
      return json({ error: "参数不完整" }, 400);
    }
    if (!content) return json({ error: "内容不能为空" }, 400);
    if (content.length > MAX_CONTENT) return json({ error: `最多 ${MAX_CONTENT} 字` }, 400);

    const db = context.env.DB;
    await ensureTable(db);
    const createdAt = new Date().toISOString();
    await db
      .prepare(
        "INSERT OR REPLACE INTO follow_ups (anonymous_id, reading_id, content, created_at) VALUES (?, ?, ?, ?)"
      )
      .bind(anonymousId, readingId, content, createdAt)
      .run();

    return json({ success: true, reading_id: readingId, content, created_at: createdAt });
  } catch (e: any) {
    return json({ error: e?.message || "Unknown error" }, 500);
  }
}
