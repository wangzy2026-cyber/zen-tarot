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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("解读请求失败");
  return res;
}
