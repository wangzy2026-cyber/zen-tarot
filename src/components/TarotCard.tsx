import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { DrawnCard } from "@/types/tarot";
import { supabase } from "@/integrations/supabase/client"; // 关键导入：连接数据库

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

const CardFront = ({
  card,
  onLoad,
}: {
  card: DrawnCard;
  onLoad: () => void;
}) => (
  <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl border border-primary/30 bg-secondary/80 backdrop-blur-sm flex flex-col items-center justify-center p-2 shadow-[0_0_30px_-5px_hsl(45_90%_76%/0.15)] overflow-hidden">
    <div className="w-full flex-1 rounded-lg overflow-hidden flex items-center justify-center mb-1 relative">
      <img
        src={card.image}
        alt={card.name}
        onLoad={onLoad}
        className={`w-full h-full object-contain transition-opacity duration-700 ${
          card.loaded ? "opacity-100" : "opacity-0"
        } ${card.reversed ? "rotate-180" : ""}`}
      />
      {!card.loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-primary/30 animate-pulse" />
        </div>
      )}
    </div>
    <p className="text-primary text-xs md:text-sm font-semibold tracking-wider">
      {card.nameCn}
    </p>
    <p className="text-muted-foreground text-[10px] italic">{card.name}</p>
    {card.reversed && (
      <span className="text-destructive text-[10px] font-bold mt-0.5 tracking-wider">
        【逆位】
      </span>
    )}
    <span className="text-muted-foreground/50 text-[9px] mt-0.5">
      {card.position}
    </span>
  </div>
);

interface TarotCardProps {
  card: DrawnCard;
  index: number;
  onFlip: (id: number) => void;
  onImageLoad: (id: number) => void;
  compact?: boolean;
}

const TarotCard = ({ card, index, onFlip, onImageLoad, compact }: TarotCardProps) => {
  const sizeClass = compact
    ? "w-20 h-32 md:w-24 md:h-38"
    : "w-28 h-44 md:w-36 md:h-56";

  // 定义翻牌并存入数据库的逻辑
  const handleFlipAndSave = async () => {
    if (card.flipped) return;

    // 1. 先触发前端翻牌动画
    onFlip(card.id);

    // 2. 物理存入 Supabase 数据库
    try {
      console.log("正在同步赛博馆藏...", card.nameCn);
      const { error } = await supabase
        .from('tarot_history')
        .insert([{ 
          card_name: card.nameCn || card.name, 
          is_reversed: card.reversed || false,
          spread_type: card.position || 'single_draw',
          anonymous_id: 'explorer_' + Math.random().toString(36).substr(2, 4) // 生成一个临时的匿名ID
        }]);

      if (error) {
        console.error("数据库写入失败:", error.message);
      } else {
        console.log("数据已存入 Supabase！");
      }
    } catch (err) {
      console.error("网络异常，数据未能存入:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className="perspective-1000 cursor-pointer"
      onClick={handleFlipAndSave}
    >
      <motion.div
        animate={{
          rotateY: card.flipped ? 180 : 0,
          scale: card.flipped ? 1 : 1,
        }}
        whileHover={!card.flipped ? { scale: 1.05, y: -4 } : {}}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        style={{
          boxShadow: card.flipped
            ? "0 8px 32px -8px hsl(45 90% 76% / 0.12)"
            : "0 4px 16px -4px rgba(0,0,0,0.3)",
        }}
        className={`relative ${sizeClass} preserve-3d rounded-xl`}
      >
        <CardBack />
        <CardFront card={card} onLoad={() => onImageLoad(card.id)} />
      </motion.div>
    </motion.div>
  );
};

export default TarotCard;
// 在 TarotCard.tsx 的 handleFlipAndSave 逻辑里修改 insert 部分：
const questionInput = document.querySelector('input') as HTMLInputElement; // 找到那个输入框
const userQuestion = questionInput?.value || ""; // 拿到里面的话

const { error } = await supabase
  .from('tarot_history')
  .insert([{ 
    card_name: card.nameCn || card.name, 
    is_reversed: card.reversed || false,
    spread_type: card.position || 'single_draw',
    question: userQuestion, // 重点：把用户写的话也存进去！
    anonymous_id: 'explorer_' + Math.random().toString(36).substr(2, 4)
  }]);
