import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, X } from "lucide-react";

const MigrationModal = () => {
  const [open, setOpen] = useState(true);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md border border-primary/20 bg-background/95 backdrop-blur-md rounded-lg p-8 text-center shadow-[0_0_40px_rgba(120,119,198,0.15)]"
          >
            <h2 className="text-primary text-lg tracking-[0.3em] uppercase mb-4 font-light">
              网站迁移通知
            </h2>
            <p className="text-foreground/70 text-sm leading-relaxed mb-8">
              由于访问量过大，旧链接随时可能失效，请收藏新地址！感谢大家的支持。
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { window.location.href = "https://zen-tarot-bkq.pages.dev"; }}
                className="flex items-center justify-center gap-2 w-full py-3 border border-primary/30 text-primary text-sm tracking-[0.2em] hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 rounded"
              >
                <ExternalLink className="w-4 h-4" />
                立即前往新地址 →
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-full py-2.5 text-muted-foreground text-xs tracking-widest hover:text-foreground transition-colors"
              >
                我知道了
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MigrationModal;
