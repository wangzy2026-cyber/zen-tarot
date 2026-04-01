import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { TAROT_DECK, TarotCardData } from "@/data/tarotDeck";
import { SpreadType, SPREADS, DrawnCard } from "@/types/tarot";
import TarotCard from "./TarotCard";

interface ManualDrawProps {
  spread: SpreadType;
  onComplete: (cards: DrawnCard[]) => void;
}

const ManualDraw = ({ spread, onComplete }: ManualDrawProps) => {
  const needed = SPREADS[spread].count;
  const positions = SPREADS[spread].positions;

  // Shuffle 22 Major Arcana once
  const pool = useMemo(() => {
    const majors = TAROT_DECK.slice(0, 22);
    return [...majors].sort(() => Math.random() - 0.5);
  }, []);

  const [phase, setPhase] = useState<"shuffle" | "pick" | "done">("shuffle");
  const [selected, setSelected] = useState<number[]>([]);

  // Start shuffle animation
  useState(() => {
    const t = setTimeout(() => setPhase("pick"), 1500);
    return () => clearTimeout(t);
  });

  const handlePick = (poolIndex: number) => {
    if (selected.includes(poolIndex) || selected.length >= needed) return;
    const newSelected = [...selected, poolIndex];
    setSelected(newSelected);

    if (newSelected.length >= needed) {
      // Build DrawnCard array
      setTimeout(() => {
        const cards: DrawnCard[] = newSelected.map((pi, i) => ({
          ...pool[pi],
          id: i,
          flipped: true,
          loaded: false,
          reversed: Math.random() < 0.5,
          position: positions[i],
        }));
        onComplete(cards);
      }, 800);
    }
  };

  if (phase === "shuffle") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center gap-6 py-12"
      >
        <div className="relative w-24 h-36">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-xl border border-primary/20 bg-secondary/80 backdrop-blur-sm"
              animate={{
                x: [0, (i - 2) * 30, 0],
                y: [0, Math.sin(i) * 10, 0],
                rotate: [0, (i - 2) * 8, 0],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.1,
                ease: "easeInOut",
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary/30" />
              </div>
            </motion.div>
          ))}
        </div>
        <p className="text-primary/70 text-sm tracking-[0.3em] animate-pulse mt-8">
          洗牌中...
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center w-full"
    >
      <p className="text-muted-foreground text-sm mb-4 tracking-widest">
        请凭直觉选择 {needed} 张牌（已选 {selected.length}/{needed}）
      </p>

      {/* Scrollable card pool */}
      <div className="w-full overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex gap-2 md:flex-wrap md:justify-center min-w-max md:min-w-0">
          {pool.map((card, i) => {
            const isSelected = selected.includes(i);
            const selectionIndex = selected.indexOf(i);

            return (
              <motion.div
                key={`${card.name}-${i}`}
                className="cursor-pointer shrink-0"
                onClick={() => handlePick(i)}
                whileHover={!isSelected ? { scale: 1.1, y: -8 } : {}}
                animate={isSelected ? { scale: 0.95, opacity: 0.6 } : {}}
              >
                <div className="relative perspective-1000">
                  <motion.div
                    className="w-16 h-24 md:w-20 md:h-30 rounded-lg border border-primary/20 bg-secondary/80 backdrop-blur-sm flex items-center justify-center preserve-3d"
                    animate={{
                      rotateY: isSelected ? 180 : 0,
                      boxShadow: isSelected
                        ? "0 0 20px hsl(var(--primary) / 0.3)"
                        : "0 2px 8px hsl(var(--primary) / 0.05)",
                    }}
                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  >
                    {/* Back face */}
                    <div className="absolute inset-0 backface-hidden rounded-lg border border-primary/10 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-primary/30" />
                    </div>
                    {/* Front face (shown when selected) */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-lg overflow-hidden flex flex-col items-center justify-center p-1">
                      {isSelected && (
                        <>
                          <img
                            src={card.image}
                            alt={card.name}
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm py-0.5">
                            <p className="text-primary text-[8px] text-center font-semibold">
                              {positions[selectionIndex]}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {selected.length >= needed && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-primary/60 text-xs mt-4 animate-pulse tracking-widest"
        >
          牌阵完成，正在凝聚...
        </motion.p>
      )}
    </motion.div>
  );
};

export default ManualDraw;
