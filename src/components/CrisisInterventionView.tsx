import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { detectChineseVariant } from "@/utils/crisisDetection";

interface CrisisInterventionViewProps {
  inputText: string;
  onClose: () => void;
}

const CrisisInterventionView = ({ inputText, onClose }: CrisisInterventionViewProps) => {
  const variant = detectChineseVariant(inputText);
  const isTraditional = variant === "traditional";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background px-6"
    >
      <div className="max-w-lg w-full text-center">
        {/* Main message */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-primary/90 text-base md:text-lg leading-[2] tracking-wide font-light"
        >
          生命是一场极其漫长且仅有一次的修行。你现在经历的痛苦、绝望和无力感，像是被困在了浓雾里，但请相信，雾气终会散去。你的存在本身，就比任何占卜结果都更有意义。
        </motion.p>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="w-16 h-px bg-primary/20 mx-auto my-8"
        />

        {/* Support Resources */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="space-y-3 text-muted-foreground text-sm leading-relaxed tracking-wider"
        >
          {isTraditional ? (
            <>
              <p className="text-muted-foreground/40 text-xs tracking-[0.2em] uppercase mb-4">
                台灣地區支援資源
              </p>
              <p>安心專線：<span className="text-primary font-normal">1925</span>（依舊愛我）</p>
              <p>生命線專線：<span className="text-primary font-normal">1995</span></p>
              <p>張老師專線：<span className="text-primary font-normal">1980</span></p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground/40 text-xs tracking-[0.2em] uppercase mb-4">
                大陆地区支援资源
              </p>
              <p>心理压力援助热线：<span className="text-primary font-normal">400-161-9995</span></p>
              <p>24小时希望热线：<span className="text-primary font-normal">12320</span></p>
            </>
          )}
        </motion.div>

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          onClick={onClose}
          className="mt-12 flex items-center gap-2 mx-auto px-10 py-3 border border-primary/15 text-muted-foreground text-sm tracking-[0.3em] hover:border-primary/30 hover:text-primary/80 transition-all duration-300"
        >
          <RotateCcw className="w-3 h-3" />
          返回
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CrisisInterventionView;
