import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X } from "lucide-react";
import donateQr from "@/assets/donate-qr.jpg";
import paypalQr from "@/assets/paypal-qr.png";

interface DonateModalProps {
  onClickDonate?: () => void;
}

type PayTab = "wechat" | "paypal";

const DonateModal = ({ onClickDonate }: DonateModalProps) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<PayTab>("wechat");

  const handleOpen = () => {
    setOpen(true);
    onClickDonate?.();
  };

  const tabConfig = {
    wechat: { img: donateQr, label: "微信扫码 · 随喜赞赏", sub: "每一份能量都将化为星光", imgClass: "w-[130%] h-[130%] object-cover object-[center_35%]" },
    paypal: { img: paypalQr, label: "扫码支付 · PayPal", sub: "支持国际信用卡付款", imgClass: "w-[90%] h-[90%] object-contain" },
  };

  const current = tabConfig[tab];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="w-full max-w-lg mt-8 border-t border-primary/5 pt-6"
      >
        <p className="text-muted-foreground/40 text-[11px] leading-relaxed text-center mb-3">
          本站目前由作者完全自费驱动，API
          调用成本较高。若此番指引对你有助，欢迎随喜注入能量（0.1元起），支持小站持续运行。
        </p>
        <button
          onClick={handleOpen}
          className="mx-auto flex items-center gap-1.5 px-5 py-2 rounded-full border border-primary/15 text-primary/50 text-xs tracking-widest hover:border-primary/30 hover:text-primary/70 hover:bg-primary/5 transition-all duration-300"
        >
          <Heart className="w-3 h-3" />
          随喜赞赏
        </button>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <div className="absolute inset-0 bg-background/60 backdrop-blur-md" />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 flex flex-col items-center p-8 rounded-2xl border border-[hsl(45,60%,50%,0.3)] bg-secondary/90 backdrop-blur-xl shadow-[0_0_60px_-15px_hsl(45,60%,50%,0.15)]"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 text-muted-foreground/40 hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Tabs */}
              <div className="flex mb-5 rounded-full border border-[hsl(45,60%,50%,0.2)] overflow-hidden">
                {(["wechat", "paypal"] as PayTab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-4 py-1.5 text-[11px] tracking-widest transition-all duration-300 ${
                      tab === t
                        ? "bg-[hsl(45,60%,50%,0.15)] text-[hsl(45,60%,50%,0.9)]"
                        : "text-muted-foreground/40 hover:text-muted-foreground/60"
                    }`}
                  >
                    {t === "wechat" ? "微信赞赏" : "PayPal"}
                  </button>
                ))}
              </div>

              {/* QR area with crossfade */}
              <div className="relative mb-5">
                <div className="absolute inset-[-8px] rounded-full border border-[hsl(45,60%,50%,0.2)] animate-pulse" />
                <div className="absolute inset-[-16px] rounded-full border border-[hsl(45,60%,50%,0.08)]" />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="w-48 h-48 rounded-full overflow-hidden border-2 border-[hsl(45,60%,50%,0.3)] shadow-[0_0_30px_-5px_hsl(45,60%,50%,0.2)] flex items-center justify-center bg-white"
                  >
                    <img
                      src={current.img}
                      alt="赞赏码"
                      className={current.imgClass}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              <p className="text-primary/70 text-xs tracking-[0.2em] mb-1">
                {current.label}
              </p>
              <p className="text-muted-foreground/40 text-[10px] mb-5">
                {current.sub}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setOpen(false)}
                  className="px-5 py-2 rounded-full border border-[hsl(45,60%,50%,0.25)] text-[hsl(45,60%,50%,0.8)] text-xs tracking-widest hover:bg-[hsl(45,60%,50%,0.08)] transition-all duration-300"
                >
                  注入能量 ✦
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="px-5 py-2 rounded-full border border-primary/10 text-muted-foreground/40 text-xs tracking-widest hover:text-muted-foreground/60 transition-all duration-300"
                >
                  关闭
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DonateModal;
