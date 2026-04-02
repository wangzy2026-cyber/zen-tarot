import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { DrawnCard } from "@/types/tarot";

const CardBack = () => (
  <div className="absolute inset-0 backface-hidden rounded-xl border border-primary/20 bg-secondary/80 backdrop-blur-sm flex items-center justify-center">
    <div className="w-full h-full rounded-xl border border-primary/10 m-2 flex items-center justify-center">
      <Sparkles className="w-8 h-8 text-primary/40" />
    </div>
  </div>
);

const CardFront = ({ card, onLoad }: { card: DrawnCard; onLoad: () => void }) => (
  <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl border border-primary/30 bg-secondary/80 backdrop-blur-sm flex flex-col items-center justify-center p-2 shadow-lg overflow-hidden">
    <div className="w-full flex-1 rounded-lg overflow-hidden flex items-center justify-center mb-1">
      <img
        src={card.image}
        alt={card.name}
        onLoad={onLoad}
        className={`w-full h-full object-contain transition-opacity duration-700 ${card.loaded ? "opacity-100" : "opacity-0"} ${card.reversed ? "rotate-180" : ""}`}
      />
    </div>
    <p className="text-primary text-xs font-semibold">{card.nameCn}</p>
    <p className="text-muted-foreground text-[10px] italic">{card.name}</p>
    {card.reversed && <span className="text-destructive text-[9px] font-bold mt-0.5">【逆位】</span>}
    <span className="text-muted-foreground/50 text-[9px]">{card.position}</span>
  </div>
);

const TarotCard = ({ card, index, onFlip, onImageLoad, compact, mobile }: any) => {
  const sizeClass = compact
    ? "w-20 h-[7.5rem] md:w-24 md:h-38"
    : mobile
      ? "w-[28vw] max-w-28 aspect-[5/8] md:w-36 md:h-56"
      : "w-28 h-44 md:w-36 md:h-56";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="perspective-1000 cursor-pointer"
      onClick={() => !card.flipped && onFlip(card.id)}
      whileHover={!card.flipped ? { scale: 1.08, y: -6 } : {}}
    >
      <motion.div
        animate={{
          rotateY: card.flipped ? 180 : 0,
          boxShadow: card.flipped
            ? "0 8px 30px -8px hsl(var(--primary) / 0.25)"
            : "0 4px 12px -4px hsl(var(--primary) / 0.1)",
        }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className={`relative ${sizeClass} preserve-3d rounded-xl`}
      >
        <CardBack />
        <CardFront card={card} onLoad={() => onImageLoad(card.id)} />
      </motion.div>
    </motion.div>
  );
};

export default TarotCard;
