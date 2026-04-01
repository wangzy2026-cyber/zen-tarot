import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface CardResonance {
  card_name_cn: string;
  count: number;
}

interface ResonancePoolProps {
  currentCards: { name: string; nameCn: string }[];
}

const ResonancePool = ({ currentCards }: ResonancePoolProps) => {
  const [resonances, setResonances] = useState<CardResonance[]>([]);
  const [todayTotal, setTodayTotal] = useState(0);

  const fetchResonance = async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Get today's card counts for user's drawn cards
    const cardNamesCn = currentCards.map((c) => c.nameCn);

    const { data } = await supabase
      .from("tarot_history")
      .select("card_name_cn")
      .in("card_name_cn", cardNamesCn)
      .gte("created_at", todayStart.toISOString());

    if (data) {
      const countMap: Record<string, number> = {};
      data.forEach((r) => {
        countMap[r.card_name_cn] = (countMap[r.card_name_cn] || 0) + 1;
      });
      const results = Object.entries(countMap).map(([card_name_cn, count]) => ({
        card_name_cn,
        count,
      }));
      setResonances(results);
      setTodayTotal(data.length);
    }
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

  if (resonances.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.8 }}
      className="w-full max-w-lg mt-10 border-t border-primary/10 pt-8"
    >
      <p className="text-center text-muted-foreground/50 text-[10px] tracking-[0.3em] uppercase mb-4">
        今日能量共鸣
      </p>

      <div className="space-y-2">
        {resonances.map((r, i) => (
          <motion.div
            key={r.card_name_cn}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center justify-center gap-2 text-center"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-primary/30 resonance-dot" />
            <p className="text-muted-foreground text-xs tracking-wider">
              已有{" "}
              <span className="text-primary font-semibold resonance-glow">
                {r.count}
              </span>{" "}
              位探路者与你抽中了{" "}
              <span className="text-primary/80">【{r.card_name_cn}】</span>
              ，你们的能量正在此间交汇
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ResonancePool;
