import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { DrawnCard } from "@/types/tarot";
import { supabase } from "@/integrations/supabase/client";

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

const CardFront = ({ card, onLoad }: { card: DrawnCard; onLoad: () => void; }) => (
  <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl border border-primary/30 bg-secondary/80 backdrop-blur-sm flex flex-col items-center justify-center p-2 shadow-[0_0_30px_-5px_hsl(45_90%_76%/0.15)] overflow-hidden">
    <div className="w-full flex-1 rounded-lg overflow-hidden flex items-center justify-center mb-1 relative">
      <img
        src={card.image}
        alt={card.name}
        onLoad={onLoad}
        className={`w-full h-full object-contain transition-opacity duration-700 ${card.loaded ? "opacity-100" : "opacity-0"} ${card.reversed ? "rotate-180" : ""}`}
      />
    </div>
    <p className="text-primary text-xs md:text-sm font-semibold tracking-wider">{card.nameCn}</p>
    <p className="text-muted-foreground text-[10px] italic">{card.name}</p>
    {card.reversed && <span className="text-destructive text-[10px] font-bold mt-0.5 tracking-wider">【逆位】</span>}
    <span className="text-muted-foreground/50 text-[9px] mt-0.5">{card.position}</span>
  </div>
);

const TarotCard = ({ card, index, onFlip, onImageLoad, compact }: any) => {
  const sizeClass = compact ? "w-20 h-32 md:w-24 md:h-38" : "w-28 h-44 md:w-36 md:h-56";

  const handleFlipAndSave = async () => {
    if (card.flipped) return;
    onFlip(card.id);

    // 【多重抓取逻辑】
    // 1. 优先从浏览器硬盘 (localStorage) 拿，这是最稳的
    let userQuestion = localStorage.getItem('tarot_question') || "";
    
    // 2. 如果硬盘没有，看内存 (window)
    if (!userQuestion) userQuestion = (window as any).lastQuestion || "";
    
    // 3. 如果还是没有，最后尝试搜一下 DOM
    if (!userQuestion) {
      const el = document.querySelector('input') || document.querySelector('textarea');
      userQuestion = (el as HTMLInputElement)?.value || "";
    }

    try {
      await supabase.from('tarot_history').insert([{ 
        card_name: card.nameCn || card.name, 
        is_reversed: card.reversed || false,
        spread_type: card.position || 'single_draw',
        question: userQuestion.trim() || "（未检测到输入）",
        anonymous_id: 'explorer_' + Math.random().toString(36).substr(2, 4)
      }]);
      console.log("数据同步成功，问题已存入硬盘备份。");
    } catch (err) {
      console.error("同步失败:", err);
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
        animate={{ rotateY: card.flipped ? 180 : 0 }}
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
