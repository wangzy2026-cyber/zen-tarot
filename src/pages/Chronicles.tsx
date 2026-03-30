import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import Starfield from "@/components/Starfield";
import { supabase } from "@/integrations/supabase/client";

interface DayEnergy {
  date: string;
  dateLabel: string;
  card_name: string;
  card_name_cn: string;
  count: number;
}

interface ChartEntry {
  card: string;
  count: number;
}

const Chronicles = () => {
  const navigate = useNavigate();
  const [todayCard, setTodayCard] = useState<DayEnergy | null>(null);
  const [weekData, setWeekData] = useState<ChartEntry[]>([]);
  const [weekHistory, setWeekHistory] = useState<DayEnergy[]>([]);
  const [dailyWhisper, setDailyWhisper] = useState("");
  const [isLoadingWhisper, setIsLoadingWhisper] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Today's dominant card
    const { data: todayData } = await supabase
      .from("tarot_history")
      .select("card_name, card_name_cn")
      .gte("created_at", todayStart);

    if (todayData && todayData.length > 0) {
      const counts: Record<string, { cn: string; count: number }> = {};
      todayData.forEach((r: any) => {
        if (!counts[r.card_name]) counts[r.card_name] = { cn: r.card_name_cn, count: 0 };
        counts[r.card_name].count++;
      });
      const top = Object.entries(counts).sort((a, b) => b[1].count - a[1].count)[0];
      if (top) {
        setTodayCard({
          date: todayStart,
          dateLabel: "今日",
          card_name: top[0],
          card_name_cn: top[1].cn,
          count: top[1].count,
        });
      }
    }

    // 7-day top cards for chart
    const { data: weekRaw } = await supabase
      .from("tarot_history")
      .select("card_name, card_name_cn, created_at")
      .gte("created_at", sevenDaysAgo);

    if (weekRaw && weekRaw.length > 0) {
      // Aggregate by card for chart
      const cardCounts: Record<string, { cn: string; count: number }> = {};
      weekRaw.forEach((r: any) => {
        if (!cardCounts[r.card_name]) cardCounts[r.card_name] = { cn: r.card_name_cn, count: 0 };
        cardCounts[r.card_name].count++;
      });
      const sorted = Object.entries(cardCounts)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 8)
        .map(([, v]) => ({ card: v.cn, count: v.count }));
      setWeekData(sorted);

      // Daily dominant cards for history
      const byDay: Record<string, Record<string, { cn: string; count: number }>> = {};
      weekRaw.forEach((r: any) => {
        const day = r.created_at.slice(0, 10);
        if (!byDay[day]) byDay[day] = {};
        if (!byDay[day][r.card_name]) byDay[day][r.card_name] = { cn: r.card_name_cn, count: 0 };
        byDay[day][r.card_name].count++;
      });
      const history: DayEnergy[] = Object.entries(byDay)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([date, cards]) => {
          const top = Object.entries(cards).sort((a, b) => b[1].count - a[1].count)[0];
          return {
            date,
            dateLabel: date.slice(5),
            card_name: top[0],
            card_name_cn: top[1].cn,
            count: top[1].count,
          };
        });
      setWeekHistory(history);

      // Generate daily whisper
      generateWhisper(weekRaw);
    }
  };

  const generateWhisper = async (draws: any[]) => {
    setIsLoadingWhisper(true);
    try {
      const cardSummary: Record<string, number> = {};
      draws.forEach((d: any) => {
        cardSummary[d.card_name_cn] = (cardSummary[d.card_name_cn] || 0) + 1;
      });
      const summaryText = Object.entries(cardSummary)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => `${name}(${count}次)`)
        .join("、");

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/daily-whisper`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ summaryText }),
      });

      if (resp.ok) {
        const data = await resp.json();
        setDailyWhisper(data.whisper || "今日的星象尚未凝聚...");
      } else {
        setDailyWhisper("星象迷离，暂无密语...");
      }
    } catch {
      setDailyWhisper("星象迷离，暂无密语...");
    } finally {
      setIsLoadingWhisper(false);
    }
  };

  const BAR_COLORS = [
    "hsl(45, 90%, 76%)",
    "hsl(45, 70%, 65%)",
    "hsl(45, 50%, 55%)",
    "hsl(45, 40%, 48%)",
    "hsl(45, 30%, 42%)",
    "hsl(45, 25%, 38%)",
    "hsl(45, 20%, 34%)",
    "hsl(45, 15%, 30%)",
  ];

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
          <div className="flex items-center gap-4 mb-12">
            <button
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-light text-primary tracking-widest">
                赛博馆藏
              </h1>
              <p className="text-muted-foreground/50 text-xs tracking-wider mt-1">
                The Cyber Chronicles
              </p>
            </div>
          </div>

          {/* Today's dominant energy */}
          <section className="mb-12">
            <h2 className="text-primary/60 text-xs tracking-[0.3em] uppercase mb-4">
              今日主导能量
            </h2>
            {todayCard ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border border-primary/15 rounded-xl p-6 bg-secondary/30 backdrop-blur-sm text-center"
              >
                <Sparkles className="w-5 h-5 text-primary/40 mx-auto mb-3" />
                <p className="text-primary text-2xl font-semibold tracking-wider mb-1">
                  {todayCard.card_name_cn}
                </p>
                <p className="text-muted-foreground text-xs italic mb-2">
                  {todayCard.card_name}
                </p>
                <p className="text-muted-foreground/50 text-[10px]">
                  今日已被抽取 {todayCard.count} 次
                </p>
              </motion.div>
            ) : (
              <p className="text-muted-foreground/30 text-sm text-center py-8">
                今日尚无占卜数据，成为第一位寻路者吧
              </p>
            )}
          </section>

          {/* 7-day energy chart */}
          <section className="mb-12">
            <h2 className="text-primary/60 text-xs tracking-[0.3em] uppercase mb-4">
              七日能量波动
            </h2>
            {weekData.length > 0 ? (
              <div className="border border-primary/10 rounded-xl p-4 bg-secondary/20 backdrop-blur-sm">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={weekData} layout="vertical" margin={{ left: 60, right: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="card"
                      tick={{ fill: "hsl(45, 80%, 85%)", fontSize: 11 }}
                      width={56}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(230, 40%, 10%)",
                        border: "1px solid hsl(45, 90%, 76%, 0.2)",
                        borderRadius: 8,
                        color: "hsl(45, 80%, 85%)",
                        fontSize: 12,
                      }}
                      formatter={(value: number) => [`${value} 次`, "抽取次数"]}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {weekData.map((_, i) => (
                        <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-muted-foreground/30 text-sm text-center py-8">
                暂无足够数据绘制能量图
              </p>
            )}
          </section>

          {/* Daily history */}
          <section className="mb-12">
            <h2 className="text-primary/60 text-xs tracking-[0.3em] uppercase mb-4">
              每日编年
            </h2>
            <div className="space-y-2">
              {weekHistory.map((day, i) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 px-4 py-3 rounded-lg bg-secondary/20 border border-primary/5"
                >
                  <span className="text-muted-foreground/50 text-xs w-12">
                    {day.dateLabel}
                  </span>
                  <span className="text-primary text-sm font-medium flex-1">
                    {day.card_name_cn}
                  </span>
                  <span className="text-muted-foreground/30 text-[10px]">
                    {day.count}次
                  </span>
                </motion.div>
              ))}
              {weekHistory.length === 0 && (
                <p className="text-muted-foreground/30 text-sm text-center py-4">
                  暂无历史记录
                </p>
              )}
            </div>
          </section>

          {/* Daily whisper */}
          <section className="mb-12">
            <h2 className="text-primary/60 text-xs tracking-[0.3em] uppercase mb-4">
              今日世界密语
            </h2>
            <div className="border border-primary/10 rounded-xl p-6 bg-secondary/20 backdrop-blur-sm">
              {isLoadingWhisper ? (
                <p className="text-muted-foreground/40 text-sm animate-pulse text-center">
                  密语凝聚中...
                </p>
              ) : (
                <p className="text-foreground/70 text-sm leading-relaxed whitespace-pre-line">
                  {dailyWhisper || "今日的星象尚未凝聚..."}
                </p>
              )}
            </div>
          </section>
        </motion.div>
      </div>
    </>
  );
};

export default Chronicles;
