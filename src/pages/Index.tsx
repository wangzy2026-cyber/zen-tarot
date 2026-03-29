import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Sparkles } from "lucide-react";
import Starfield from "@/components/Starfield";
import { drawCards, TarotCardData } from "@/data/tarotDeck";

interface DrawnCard extends TarotCardData {
  id: number;
  flipped: boolean;
  loaded: boolean;
}

const MOCK_READING = `你的三张牌揭示了一段深刻的内在旅程。

第一张牌暗示你正处于迷雾之中——直觉与恐惧交织，真相尚未完全显现。不要急于做出判断，允许自己在未知中停留片刻。

第二张牌预示着一次必要的转变。那些你以为坚固的信念或关系，可能需要经历一次重建。这不是终结，而是觉醒的开始。

第三张牌是最终的祝福——在风暴之后，希望与疗愈正在降临。保持信念，宇宙正在为你编织新的可能。

总结：接受当下的混沌，拥抱即将到来的变化，光明就在前方。`;

const CardBack = () => (
  <div className="absolute inset-0 backface-hidden rounded-xl border border-primary/20 bg-secondary/80 backdrop-blur-sm flex items-center justify-center">
    <div className="w-full h-full rounded-xl border border-primary/10 m-2 flex items-center justify-center">
      <div className="text-center">
        <Sparkles className="w-8 h-8 text-primary/40 mx-auto mb-2" />
        <div className="w-12 h-px bg-primary/15 mx-auto" />
      </div>
    </div>
  </div>
);

const CardFront = ({ card, onLoad }: { card: DrawnCard; onLoad: () => void }) => (
  <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl border border-primary/30 bg-secondary/80 backdrop-blur-sm flex flex-col items-center justify-center p-2 shadow-[0_0_30px_-5px_hsl(45_90%_76%/0.15)] overflow-hidden">
    <div className="w-full flex-1 rounded-lg overflow-hidden flex items-center justify-center mb-2 relative">
      <img
        src={card.image}
        alt={card.name}
        onLoad={onLoad}
        className={`w-full h-full object-contain transition-opacity duration-700 ${card.loaded ? "opacity-100" : "opacity-0"}`}
      />
      {!card.loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-primary/30 animate-pulse" />
        </div>
      )}
    </div>
    <p className="text-primary text-sm md:text-base font-semibold tracking-wider">{card.nameCn}</p>
    <p className="text-muted-foreground text-xs italic">{card.name}</p>
  </div>
);

const Index = () => {
  const [phase, setPhase] = useState<"input" | "cards">("input");
  const [question, setQuestion] = useState("");
  const [cards, setCards] = useState<DrawnCard[]>([]);

  const allFlipped = cards.length > 0 && cards.every((c) => c.flipped);

  const handleBegin = () => {
    if (!question.trim()) return;
    const drawn = drawCards(3).map((c, i) => ({ ...c, id: i, flipped: false, loaded: false }));
    setCards(drawn);
    setPhase("cards");
  };

  const handleFlip = (id: number) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, flipped: true } : c)));
  };

  const handleImageLoad = (id: number) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, loaded: true } : c)));
  };

  const handleReset = () => {
    setPhase("input");
    setQuestion("");
    setCards([]);
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
              <h1 className="text-2xl md:text-3xl font-light text-primary mb-10 tracking-widest text-center">
                塔罗启示
              </h1>

              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBegin()}
                placeholder="静心，输入你的困惑..."
                className="w-full bg-transparent border-b border-primary/15 text-primary placeholder:text-muted-foreground text-center text-lg py-3 focus:outline-none focus:border-primary/40 transition-colors"
              />

              <button
                onClick={handleBegin}
                disabled={!question.trim()}
                className="mt-10 px-8 py-3 border border-primary/25 text-primary/80 text-sm tracking-[0.3em] uppercase hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                开启启示
              </button>
            </motion.div>
          )}

          {phase === "cards" && (
            <motion.div
              key="cards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center w-full max-w-3xl"
            >
              <p className="text-muted-foreground text-sm mb-10 tracking-widest">
                选择你的牌
              </p>

              <div className="flex gap-5 md:gap-8 mb-12">
                {cards.map((card, i) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2, duration: 0.5 }}
                    className="perspective-1000 cursor-pointer"
                    onClick={() => !card.flipped && handleFlip(card.id)}
                  >
                    <motion.div
                      animate={{ rotateY: card.flipped ? 180 : 0 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      className="relative w-28 h-44 md:w-36 md:h-56 preserve-3d"
                    >
                      <CardBack />
                      <CardFront card={card} onLoad={() => handleImageLoad(card.id)} />
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              <AnimatePresence>
                {allFlipped && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="w-full max-w-lg border-t border-primary/10 pt-8"
                  >
                    <h2 className="text-primary text-center text-sm tracking-[0.4em] uppercase mb-6">
                      深度解析
                    </h2>
                    <p className="text-foreground/70 text-sm leading-relaxed whitespace-pre-line">
                      {MOCK_READING}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: allFlipped ? 1.2 : 0.8 }}
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
