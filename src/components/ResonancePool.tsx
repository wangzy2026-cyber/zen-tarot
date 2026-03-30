import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface ResonanceEntry {
  id: string;
  card_name_cn: string;
  city_alias: string;
  created_at: string;
}

interface ResonancePoolProps {
  currentCards: { name: string; nameCn: string }[];
}

const ResonancePool = ({ currentCards }: ResonancePoolProps) => {
  const [resonanceCount, setResonanceCount] = useState(0);
  const [recentDraws, setRecentDraws] = useState<ResonanceEntry[]>([]);

  const fetchResonance = async () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const cardNames = currentCards.map((c) => c.name);

    // Count matching cards in last 5 min
    const { count } = await supabase
      .from("tarot_history")
      .select("*", { count: "exact", head: true })
      .in("card_name", cardNames)
      .gte("created_at", fiveMinAgo);

    setResonanceCount(count || 0);

    // Recent draws
    const { data } = await supabase
      .from("tarot_history")
      .select("id, card_name_cn, city_alias, created_at")
      .gte("created_at", fiveMinAgo)
      .order("created_at", { ascending: false })
      .limit(12);

    setRecentDraws((data as ResonanceEntry[]) || []);
  };

  useEffect(() => {
    fetchResonance();

    const channel = supabase
      .channel("resonance-pool")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tarot_history" },
        () => fetchResonance()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const timeAgo = (ts: string) => {
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (diff < 60) return `${diff}秒前`;
    return `${Math.floor(diff / 60)}分钟前`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.8 }}
      className="w-full max-w-lg mt-10 border-t border-primary/10 pt-8"
    >
      {/* Resonance count */}
      {resonanceCount > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-muted-foreground text-xs mb-6 tracking-wider"
        >
          此时此刻，全球还有{" "}
          <span className="text-primary font-semibold resonance-glow">
            {resonanceCount}
          </span>{" "}
          位寻路者和你抽到了同样的牌
        </motion.p>
      )}

      {/* Resonance square */}
      <div className="space-y-1">
        <p className="text-center text-muted-foreground/50 text-[10px] tracking-[0.3em] uppercase mb-3">
          共鸣广场 · 最近 5 分钟
        </p>
        <div className="grid grid-cols-2 gap-2">
          {recentDraws.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/40 border border-primary/5 resonance-item"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary/30 resonance-dot" />
              <div className="flex-1 min-w-0">
                <p className="text-primary/80 text-xs truncate">
                  {entry.card_name_cn}
                </p>
                <p className="text-muted-foreground/40 text-[9px]">
                  {entry.city_alias || "匿名旅者"} · {timeAgo(entry.created_at)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        {recentDraws.length === 0 && (
          <p className="text-center text-muted-foreground/30 text-xs py-4">
            暂无共鸣数据，你是先行者 ✦
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default ResonancePool;
