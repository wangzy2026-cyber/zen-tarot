import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Eye } from "lucide-react";
import Starfield from "@/components/Starfield";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateUserId } from "@/utils/userId";

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
};

const Chronicles = () => {
  const navigate = useNavigate();
  const [readings, setReadings] = useState<ReadingSummary[]>([]);
  const [selected, setSelected] = useState<ReadingSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const userId = getOrCreateUserId();
    const { data, error } = await supabase
      .from("tarot_history")
      .select("reading_id, question, spread_type, created_at, card_name_cn, is_reversed, position_label, reading_text")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(500);

    if (error || !data) {
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
        card_name_cn: row.card_name_cn,
        is_reversed: row.is_reversed,
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
                  解析
                </h2>
                {selected.reading_text ? (
                  <div className="text-foreground/70 text-sm leading-relaxed whitespace-pre-line border border-primary/10 rounded-xl p-5 bg-secondary/15">
                    {selected.reading_text}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground/40 text-sm py-8 justify-center">
                    <Eye className="w-3.5 h-3.5" />
                    <span>该记录未保存解析文本</span>
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
