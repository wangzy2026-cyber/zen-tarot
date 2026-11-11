import { getOrCreateUserId } from "@/utils/userId";

const API_BASE = "/api";

export async function saveReadings(records: any[]) {
  const res = await fetch(`${API_BASE}/readings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(records),
  });
  if (!res.ok) throw new Error("保存失败");
  return res.json();
}

export async function getReadings(anonymousId: string, limit = 50) {
  const res = await fetch(
    `${API_BASE}/readings?anonymous_id=${anonymousId}&limit=${limit}`
  );
  if (!res.ok) throw new Error("获取失败");
  return res.json();
}

export async function getTarotReading(payload: {
  question: string;
  cardsText: string;
  spread: string;
}) {
  const res = await fetch(`${API_BASE}/tarot-reading`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // 8.31 加固：服务端按用户 ID 每日配额（防多 IP 轮换白嫖）
      "X-Anonymous-Id": getOrCreateUserId(),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("解读请求失败");
  return res;
}

// 「后来」：占卜若干天后补写的近况（每次占卜保留最新一条）
export interface FollowUpRecord {
  reading_id: string;
  content: string;
  created_at: string;
}

export async function saveFollowUp(readingId: string, content: string): Promise<FollowUpRecord> {
  const res = await fetch(`${API_BASE}/follow-ups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ anonymous_id: getOrCreateUserId(), reading_id: readingId, content }),
  });
  if (!res.ok) throw new Error("保存失败");
  return res.json();
}

export async function getFollowUps(): Promise<FollowUpRecord[]> {
  const res = await fetch(`${API_BASE}/follow-ups?anonymous_id=${getOrCreateUserId()}`);
  if (!res.ok) throw new Error("获取失败");
  return res.json();
}
