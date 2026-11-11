// 本机状态：「每日一牌」当天抽到哪张、「回访追问」该问哪条（问过哪些问题、哪些已回访/已关掉）。
// 「后来」的正文以服务器 follow_ups 表为准（见 /api/follow-ups），这里只记一份用于排期和去重。
// 所有读写都包在 try/catch 里：隐私模式或存储被禁用时，功能静默降级，不影响抽牌主流程。

const DAILY_KEY = "zt_daily_card";
const ASKED_KEY = "zt_asked_questions";
const SEEDED_KEY = "zt_asked_seeded";
const LAST_ACTION_KEY = "zt_followup_last_action"; // 最近一次回访 / 关掉的日期

/** 本地日期 YYYY-MM-DD（按用户所在时区，过了本地午夜就是新的一天） */
export function localDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 存储不可用时忽略 */
  }
}

// ---------------- 每日一牌 ----------------

export interface DailyCardState {
  date: string; // localDateKey
  cardName: string; // 英文名，对应 TAROT_DECK.name
}

/** 今天已经抽过的那张（没有则返回 null） */
export function getTodayDailyCard(): DailyCardState | null {
  const s = read<DailyCardState | null>(DAILY_KEY, null);
  return s && s.date === localDateKey() ? s : null;
}

export function saveTodayDailyCard(state: DailyCardState) {
  write(DAILY_KEY, state);
}

// ---------------- 回访追问 ----------------

export interface AskedQuestion {
  readingId: string;
  question: string;
  askedAt: string; // ISO
  spreadLabel?: string;
  cards?: string; // 例如 "愚者 · 星星(逆) · 太阳"
  followUp?: string; // 用户补写的「后来怎么样了」
  followedAt?: string;
  dismissed?: boolean;
}

const MAX_KEEP = 60;
export const FOLLOW_UP_MIN_DAYS = 7; // 至少过 7 天才问
const FOLLOW_UP_MAX_DAYS = 60; // 太久远的就不再打扰

export function listAskedQuestions(): AskedQuestion[] {
  return read<AskedQuestion[]>(ASKED_KEY, []);
}

function saveAll(list: AskedQuestion[]) {
  // 只保留最近 MAX_KEEP 条，避免 localStorage 无限增长
  const sorted = [...list].sort((a, b) => b.askedAt.localeCompare(a.askedAt)).slice(0, MAX_KEEP);
  write(ASKED_KEY, sorted);
}

const isRealQuestion = (q: string) => !!q && q.trim() !== "" && q !== "未填写问题" && q !== "未记录问题";

/** 一次占卜完成后记下问题（同一 readingId 只记一次） */
export function rememberQuestion(q: AskedQuestion) {
  if (!isRealQuestion(q.question)) return;
  const list = listAskedQuestions();
  if (list.some((x) => x.readingId === q.readingId)) return;
  saveAll([q, ...list]);
}

/** 用服务器上的历史记录给老用户补一份本地问题列表（每台设备只做一次） */
export function seedFromHistory(rows: { reading_id?: string; question?: string; created_at?: string; spread_type?: string }[]) {
  const list = listAskedQuestions();
  const known = new Set(list.map((x) => x.readingId));
  for (const r of rows) {
    if (!r.reading_id || !r.created_at || known.has(r.reading_id)) continue;
    if (r.spread_type === "daily") continue; // 「每日一牌」不是提问
    if (!isRealQuestion(r.question || "")) continue;
    known.add(r.reading_id);
    list.push({ readingId: r.reading_id, question: r.question!, askedAt: r.created_at });
  }
  saveAll(list);
  write(SEEDED_KEY, true);
}

export function hasSeeded(): boolean {
  return read<boolean>(SEEDED_KEY, false);
}

/**
 * 找一条该回访的问题：7–60 天前问的、还没回访也没被关掉的里面，**离现在最近**的那条
 * （记忆更新鲜，也更可能还在意）。每天最多处理一条：今天已经写过或关掉一条，就不再追问。
 */
export function pickFollowUp(now: Date = new Date()): AskedQuestion | null {
  if (read<string>(LAST_ACTION_KEY, "") === localDateKey(now)) return null;
  const dayMs = 86400000;
  const due = listAskedQuestions().filter((q) => {
    if (q.followUp || q.dismissed) return false;
    const age = (now.getTime() - new Date(q.askedAt).getTime()) / dayMs;
    return age >= FOLLOW_UP_MIN_DAYS && age <= FOLLOW_UP_MAX_DAYS;
  });
  if (!due.length) return null;
  return due.sort((a, b) => b.askedAt.localeCompare(a.askedAt))[0];
}

// 同一个问题问过好几次的，回访一次就算全部回访过，不重复追问
const sameQuestion = (a: AskedQuestion, target?: AskedQuestion) =>
  !!target && (a.readingId === target.readingId || a.question.trim() === target.question.trim());

export function recordFollowUp(readingId: string, text: string) {
  const all = listAskedQuestions();
  const target = all.find((q) => q.readingId === readingId);
  const now = new Date().toISOString();
  saveAll(
    all.map((q) =>
      q.readingId === readingId
        ? { ...q, followUp: text.trim(), followedAt: now }
        : sameQuestion(q, target) && !q.followUp
          ? { ...q, dismissed: true }
          : q
    )
  );
  write(LAST_ACTION_KEY, localDateKey());
}

export function dismissFollowUp(readingId: string) {
  const all = listAskedQuestions();
  const target = all.find((q) => q.readingId === readingId);
  saveAll(all.map((q) => (sameQuestion(q, target) ? { ...q, dismissed: true } : q)));
  write(LAST_ACTION_KEY, localDateKey());
}

/** 在「馆藏」里补写了「后来」：本地也标记一下，回访卡片就不会再问这一次 */
export function markFollowedLocally(readingId: string, text: string) {
  const all = listAskedQuestions();
  if (!all.some((q) => q.readingId === readingId)) return;
  saveAll(all.map((q) => (q.readingId === readingId ? { ...q, followUp: text.trim(), followedAt: new Date().toISOString() } : q)));
}

/** 「7 天前」「3 周前」这类相对时间 */
export function relativeDays(iso: string, now: Date = new Date()): string {
  const days = Math.floor((now.getTime() - new Date(iso).getTime()) / 86400000);
  if (days < 14) return `${days} 天前`;
  if (days < 60) return `${Math.floor(days / 7)} 周前`;
  return `${Math.floor(days / 30)} 个月前`;
}
