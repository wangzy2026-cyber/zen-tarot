import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Eye } from "lucide-react";
import Starfield from "@/components/Starfield";
import { getReadings, getFollowUps, saveFollowUp, FollowUpRecord } from "@/lib/api";
import { getOrCreateUserId } from "@/utils/userId";
import { markFollowedLocally } from "@/utils/localJournal";
import { TAROT_DECK } from "@/data/tarotDeck";
import { getDailyReminder } from "@/data/dailyReminders";

interface ReadingSummary {
  reading_id: string;
  question: string;
  spread_type: string;
  created_at: string;
  cards: { card_name_cn: string; is_reversed: boolean; position_label: string }[];
  reading_text: string | null;
}

const SPREAD_LABELS: Record<string, string> = {
  single: "单牌指引",
  trinity: "圣三角",
  celtic: "凯尔特十字",
  daily: "每日一牌",
};

const Chronicles = () => {
  const navigate = useNavigate();
  const [readings, setReadings] = useState<ReadingSummary[]>([]);
  const [selected, setSelected] = useState<ReadingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [followUps, setFollowUps] = useState<Record<string, FollowUpRecord>>({});
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    fetchHistory();
    getFollowUps()
      .then((rows) => {
        const m: Record<string, FollowUpRecord> = {};
        for (const r of rows || []) m[r.reading_id] = r;
        setFollowUps(m);
      })
      .catch(() => {});
  }, []);

  // 切换到另一条记录时清空草稿
  useEffect(() => {
    setDraft("");
    setSaveError("");
  }, [selected?.reading_id]);

  const handleSaveFollowUp = async () => {
    if (!selected || !draft.trim() || saving) return;
    setSaving(true);
    setSaveError("");
    try {
      const rec = await saveFollowUp(selected.reading_id, draft.trim());
      setFollowUps((m) => ({ ...m, [rec.reading_id]: rec }));
      markFollowedLocally(selected.reading_id, draft);
      setDraft("");
    } catch {
      setSaveError("没存上，稍后再试一次");
    } finally {
      setSaving(false);
    }
  };

  const daysAfter = (fromIso: string, toIso: string) =>
    Math.max(0, Math.round((new Date(toIso).getTime() - new Date(fromIso).getTime()) / 86400000));

  const fetchHistory = async () => {
    const userId = getOrCreateUserId();
    let data: any[] | null = null;
    try {
      data = await getReadings(userId, 500);
    } catch {
      setLoading(false);
      return;
    }
    if (!data) {
      setLoading(false);
      return;
    }

    // Group by reading_id
    const grouped: Record<string, ReadingSummary> = {};
    for (const row of data) {
      const rid = row.reading_id || row.created_at;
      if (!grouped[rid]) {
        grouped[rid] = {
          reading_id: rid,
          question: row.question || "未记录问题",
          spread_type: row.spread_type,
          created_at: row.created_at,
          cards: [],
          reading_text: row.reading_text as string | null,
        };
      }
      grouped[rid].cards.push({
        card_name_cn: row.card_name,
        is_reversed: !!row.is_reversed,
        position_label: row.position_label || "",
      });
    }

    setReadings(Object.values(grouped));
    setLoading(false);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <>
      <Starfield />
      <div className="relative z-10 min-h-screen px-4 py-12 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-10">
            <button
              onClick={() => (selected ? setSelected(null) : navigate("/"))}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-light text-primary tracking-widest">
                {selected ? "占卜详情" : "我的馆藏"}
              </h1>
              <p className="text-muted-foreground/50 text-xs tracking-wider mt-1">
                {selected ? "Reading Detail" : "My Chronicles"}
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!selected ? (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {loading ? (
                  <p className="text-muted-foreground/40 text-sm text-center py-16 animate-pulse">
                    加载中...
                  </p>
                ) : readings.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground/40 text-sm mb-4">
                      暂无占卜记录
                    </p>
                    <button
                      onClick={() => navigate("/")}
                      className="text-primary/60 text-xs tracking-wider hover:text-primary transition-colors"
                    >
                      去进行第一次占卜 →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {readings.map((r, i) => (
                      <motion.button
                        key={r.reading_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => setSelected(r)}
                        className="w-full text-left px-5 py-4 rounded-xl bg-secondary/20 border border-primary/8 hover:border-primary/20 hover:bg-secondary/30 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-muted-foreground/50 text-[10px] tracking-wider">
                            {formatDate(r.created_at)} · {SPREAD_LABELS[r.spread_type] || r.spread_type}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                        </div>
                        <p className="text-primary/80 text-sm mb-2 line-clamp-1">
                          {r.question}
                        </p>
                        {followUps[r.reading_id] && (
                          <p className="text-muted-foreground/60 text-[11px] mb-2 line-clamp-1">
                            后来：{followUps[r.reading_id].content}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1.5">
                          {r.cards.map((c, ci) => (
                            <span
                              key={ci}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-primary/8 text-primary/60"
                            >
                              {c.card_name_cn}
                              {c.is_reversed ? " 逆" : ""}
                            </span>
                          ))}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="detail"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {/* Question */}
                <div className="border border-primary/10 rounded-xl p-5 mb-6 bg-secondary/20">
                  <p className="text-muted-foreground/50 text-[10px] tracking-wider mb-2">
                    {formatDate(selected.created_at)} · {SPREAD_LABELS[selected.spread_type] || selected.spread_type}
                  </p>
                  <p className="text-primary/80 text-sm">{selected.question}</p>
                </div>

                {/* Cards */}
                <h2 className="text-primary/50 text-xs tracking-[0.3em] uppercase mb-3">
                  牌组
                </h2>
                <div className="space-y-2 mb-8">
                  {selected.cards.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-secondary/15 border border-primary/5"
                    >
                      <span className="text-muted-foreground/40 text-[10px] w-16 shrink-0">
                        {c.position_label}
                      </span>
                      <span className="text-primary/80 text-sm flex-1">
                        {c.card_name_cn}
                      </span>
                      {c.is_reversed && (
                        <span className="text-[10px] text-amber-400/70 px-1.5 py-0.5 rounded bg-amber-400/10">
                          逆位
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Reading */}
                <h2 className="text-primary/50 text-xs tracking-[0.3em] uppercase mb-3">
                  {selected.spread_type === "daily" ? "提醒" : "解析"}
                </h2>
                {selected.spread_type === "daily" ? (
                  <div className="text-foreground/70 text-sm leading-relaxed border border-primary/10 rounded-xl p-5 bg-secondary/15">
                    {getDailyReminder(
                      TAROT_DECK.find((d) => d.nameCn === selected.cards[0]?.card_name_cn)?.name || ""
                    )}
                  </div>
                ) : selected.reading_text ? (
                  <div className="text-foreground/70 text-sm leading-relaxed whitespace-pre-line border border-primary/10 rounded-xl p-5 bg-secondary/15">
                    {selected.reading_text}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground/40 text-sm py-8 justify-center">
                    <Eye className="w-3.5 h-3.5" />
                    <span>该记录未保存解析文本</span>
                  </div>
                )}

                {/* 后来：占卜若干天后补写的近况 */}
                {selected.spread_type !== "daily" && (
                  <div className="mt-8">
                    <h2 className="text-primary/50 text-xs tracking-[0.3em] uppercase mb-3">后来</h2>
                    {followUps[selected.reading_id] ? (
                      <div className="border border-primary/10 rounded-xl p-5 bg-secondary/15">
                        <p className="text-foreground/70 text-sm leading-relaxed whitespace-pre-line">
                          {followUps[selected.reading_id].content}
                        </p>
                        <p className="text-muted-foreground/50 text-[10px] tracking-wider mt-3">
                          {formatDate(followUps[selected.reading_id].created_at)} ·{" "}
                          {daysAfter(selected.created_at, followUps[selected.reading_id].created_at)} 天后写下
                        </p>
                      </div>
                    ) : (
                      <div className="border border-dashed border-primary/15 rounded-xl p-4">
                        <textarea
                          value={draft}
                          maxLength={200}
                          rows={2}
                          onChange={(e) => setDraft(e.target.value)}
                          placeholder="这件事后来怎么样了？补一句"
                          className="w-full bg-transparent text-foreground/80 placeholder:text-muted-foreground/50 text-sm focus:outline-none resize-none"
                        />
                        {saveError && <p className="text-amber-400/80 text-[11px] mt-1">{saveError}</p>}
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={handleSaveFollowUp}
                            disabled={!draft.trim() || saving}
                            className="px-4 py-1.5 border border-primary/25 text-primary/80 text-xs tracking-[0.2em] hover:border-primary/40 hover:bg-primary/5 transition-all disabled:opacity-30"
                          >
                            {saving ? "保存中…" : "记下来"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};

export default Chronicles;
