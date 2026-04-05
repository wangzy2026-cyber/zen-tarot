import { useState, useEffect, useRef } from "react";
import { track } from "@vercel/analytics";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Sparkles, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import Starfield from "@/components/Starfield";
import SpreadSelector from "@/components/SpreadSelector";
import CardSpread from "@/components/CardSpread";
import ResonancePool from "@/components/ResonancePool";
import ManualDraw from "@/components/ManualDraw";
import DonateModal from "@/components/DonateModal";
import MigrationModal from "@/components/MigrationModal";
import { drawCards } from "@/data/tarotDeck";
import { SpreadType, SPREADS, DrawnCard } from "@/types/tarot";
import { supabase } from "@/integrations/supabase/client";
import { getRandomCityAlias } from "@/utils/cityAlias";
import { getOrCreateUserId } from "@/utils/userId";

const Index = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"input" | "manual" | "cards">("input");
  const [manualMode, setManualMode] = useState(false);
  const [question, setQuestion] = useState("");
  const [spread, setSpread] = useState<SpreadType>("trinity");
  const [cards, setCards] = useState<DrawnCard[]>([]);
  const [reading, setReading] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const streamTriggered = useRef(false);
  const savedToDb = useRef(false);
  const readingId = useRef(crypto.randomUUID());

  const allFlipped = cards.length > 0 && cards.every((c) => c.flipped);

  useEffect(() => {
    if (allFlipped && !streamTriggered.current && !isStreaming) {
      streamTriggered.current = true;
      streamReading();
    }
    if (allFlipped && !savedToDb.current) {
      savedToDb.current = true;
      const q = localStorage.getItem("tarot_question") || question || "未填写问题";
      saveToHistory(q);
    }
  }, [allFlipped]);

  const saveToHistory = async (questionText: string) => {
    const alias = getRandomCityAlias();
    const finalQuestion = questionText.trim() || "未填写问题";
    const rid = readingId.current;

    const userId = getOrCreateUserId();
    const rows = cards.map((c) => ({
      card_name: c.nameCn || c.name,
      is_reversed: c.reversed,
      spread_type: spread,
      position_label: c.position,
      city_alias: alias,
      question: finalQuestion,
      reading_id: rid,
      is_manual_mode: manualMode,
      click_donate: false,
      anonymous_id: userId,
    }));

    const { error } = await supabase.from("tarot_history").insert(rows);
    if (error) {
      console.error("数据库同步失败:", error.message);
    } else {
      track("complete_tarot_draw");
      localStorage.removeItem("tarot_question");
    }
  };

  const handleDonateClick = async () => {
    track("click_donate");
    await supabase
      .from("tarot_history")
      .update({ click_donate: true })
      .eq("reading_id", readingId.current);
  };

  const streamReading = async () => {
    setIsStreaming(true);
    setReading("");
    let accumulated = "";
    try {
      const spreadInfo = SPREADS[spread];
      const cardsText = cards
        .map(
          (c, i) =>
            `第${i + 1}张（${spreadInfo.positions[i]}）：${c.nameCn}${
              c.reversed ? "【逆位】" : "【正位】"
            }`
        )
        .join("；");

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tarot-reading`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ question, cards, spread, cardsText }),
      });

      if (!resp.ok) throw new Error("AI 解析失败");
      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                accumulated += content;
                setReading((prev) => prev + content);
              }
            } catch {}
          }
        }
      }
    } catch {
      accumulated = "星象迷离，暂时无法解读。";
      setReading(accumulated);
    } finally {
      setIsStreaming(false);
      if (accumulated) {
        await supabase
          .from("tarot_history")
          .update({ reading_text: accumulated } as any)
          .eq("reading_id", readingId.current);
      }
    }
  };

  const handleBegin = () => {
    if (!question.trim()) return;
    track("start_tarot_draw");
    localStorage.setItem("tarot_question", question);
    readingId.current = crypto.randomUUID();

    if (manualMode) {
      setPhase("manual");
    } else {
      const info = SPREADS[spread];
      const drawn = drawCards(info.count).map((c, i) => ({
        ...c,
        id: i,
        flipped: false,
        loaded: false,
        reversed: Math.random() < 0.5,
        position: info.positions[i],
      }));
      setCards(drawn);
      setPhase("cards");
    }
  };

  const handleManualComplete = (drawnCards: DrawnCard[]) => {
    setCards(drawnCards);
    setPhase("cards");
  };

  const handleFlip = (id: number) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, flipped: true } : c))
    );
  };

  const handleImageLoad = (id: number) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, loaded: true } : c))
    );
  };

  const handleReset = () => {
    setPhase("input");
    setQuestion("");
    setCards([]);
    setReading("");
    setIsStreaming(false);
    streamTriggered.current = false;
    savedToDb.current = false;
    readingId.current = crypto.randomUUID();
    localStorage.removeItem("tarot_question");
  };

  return (
    <>
      <Starfield />
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
        <AnimatePresence mode="wait">
          {phase === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center w-full max-w-md"
            >
              <Sparkles className="w-6 h-6 text-primary/40 mb-6" />
              <h1 className="text-2xl md:text-3xl font-light text-primary mb-8 tracking-widest text-center">
                塔罗启示
              </h1>
              <SpreadSelector value={spread} onChange={setSpread} />
              <div className="flex items-center gap-2.5 mb-6 mt-2">
                <Switch
                  id="manual-mode"
                  checked={manualMode}
                  onCheckedChange={setManualMode}
                />
                <Label
                  htmlFor="manual-mode"
                  className="text-muted-foreground text-xs tracking-wider cursor-pointer"
                >
                  开启手动抽牌模式（增强仪式感）
                </Label>
              </div>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBegin()}
                placeholder="静心，输入你的困惑..."
                className="w-full bg-transparent border-b border-primary/15 text-primary placeholder:text-muted-foreground text-center text-lg py-3 focus:outline-none focus:border-primary/40 transition-colors"
              />
              <div className="flex items-center gap-6 mt-10">
                <button
                  onClick={handleBegin}
                  disabled={!question.trim()}
                  className="px-8 py-3 border border-primary/25 text-primary/80 text-sm tracking-[0.3em] uppercase hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all duration-300 disabled:opacity-30"
                >
                  开启启示
                </button>
                <button
                  onClick={() => navigate("/chronicles")}
                  className="flex items-center gap-1.5 text-muted-foreground/50 text-xs tracking-wider hover:text-primary/60 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  馆藏
                </button>
              </div>
            </motion.div>
          )}

          {phase === "manual" && (
            <motion.div
              key="manual"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center w-full max-w-4xl"
            >
              <ManualDraw spread={spread} onComplete={handleManualComplete} />
              <motion.button
                onClick={handleReset}
                className="mt-8 flex items-center gap-2 text-muted-foreground text-xs tracking-widest hover:text-foreground transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                返回
              </motion.button>
            </motion.div>
          )}

          {phase === "cards" && (
            <motion.div
              key="cards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center w-full max-w-4xl"
            >
              <p className="text-muted-foreground text-sm mb-8 tracking-widest">
                {SPREADS[spread].label} · 逐一点击翻牌
              </p>
              <CardSpread
                cards={cards}
                spread={spread}
                onFlip={handleFlip}
                onImageLoad={handleImageLoad}
              />
              <AnimatePresence>
                {allFlipped && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="w-full max-w-lg border-t border-primary/10 pt-8 mt-10"
                  >
                    <h2 className="text-primary text-center text-sm tracking-[0.4em] uppercase mb-6">
                      深度解析
                    </h2>
                    <div className="text-foreground/70 text-sm leading-relaxed whitespace-pre-line min-h-[3rem]">
                      {reading || (
                        <span className="text-muted-foreground animate-pulse">
                          星象凝聚中...
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {allFlipped && reading && !isStreaming && (
                <DonateModal onClickDonate={handleDonateClick} />
              )}

              {allFlipped && (
                <ResonancePool
                  currentCards={cards.map((c) => ({
                    name: c.name,
                    nameCn: c.nameCn,
                  }))}
                />
              )}
              <motion.button
                onClick={handleReset}
                className="mt-12 flex items-center gap-2 text-muted-foreground text-xs tracking-widest hover:text-foreground transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                清空并重新开始
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Index;
