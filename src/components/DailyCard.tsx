import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, X } from "lucide-react";
import TarotCard from "@/components/TarotCard";
import { TAROT_DECK, drawCards } from "@/data/tarotDeck";
import { getDailyReminder } from "@/data/dailyReminders";
import { DrawnCard } from "@/types/tarot";
import { saveReadings } from "@/lib/api";
import { getOrCreateUserId } from "@/utils/userId";
import { getRandomCityAlias } from "@/utils/cityAlias";
import { getTodayDailyCard, saveTodayDailyCard, localDateKey, DailyCardState } from "@/utils/localJournal";

// 「今日一张」：用户主动点开才抽，一天一张（同一天再点开看到的还是那张），
// 只给一句提醒、不讲吉凶；固定正位，不调用 AI 解读（零 token 成本）。

const toDrawn = (name: string, flipped: boolean): DrawnCard | null => {
  const c = TAROT_DECK.find((x) => x.name === name);
  if (!c) return null;
  return { ...c, id: 0, flipped, loaded: false, reversed: false, position: "今日一张" };
};

const DailyCard = () => {
  const [today, setToday] = useState<DailyCardState | null>(() => getTodayDailyCard());
  const [open, setOpen] = useState(false);
  const [card, setCard] = useState<DrawnCard | null>(null);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  const handleOpen = () => {
    const existing = getTodayDailyCard();
    if (existing) {
      setToday(existing);
      setCard(toDrawn(existing.cardName, true));
      setNote(existing.note || "");
      setSaved(!!existing.note);
    } else {
      // 先发一张背面朝上的牌，等用户自己翻
      const [picked] = drawCards(1);
      setCard({ ...picked, id: 0, flipped: false, loaded: false, reversed: false, position: "今日一张" });
      setNote("");
      setSaved(false);
    }
    setOpen(true);
  };

  const handleFlip = () => {
    if (!card || card.flipped) return;
    const flipped = { ...card, flipped: true };
    setCard(flipped);
    const state: DailyCardState = { date: localDateKey(), cardName: card.name };
    saveTodayDailyCard(state);
    setToday(state);
    // 记一条到 D1，方便日后统计「今日一张」的使用和回访；失败不影响体验
    saveReadings([
      {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        card_name: card.nameCn || card.name,
        is_reversed: false,
        spread_type: "daily",
        position_label: "今日一张",
        city_alias: getRandomCityAlias(),
        question: "今日一张",
        reading_id: crypto.randomUUID(),
        is_manual_mode: false,
        click_donate: false,
        anonymous_id: getOrCreateUserId(),
      },
    ]).catch(() => {});
  };

  const handleImageLoad = () => setCard((c) => (c ? { ...c, loaded: true } : c));

  const handleSaveNote = () => {
    if (!today) return;
    const next = { ...today, note: note.trim() };
    saveTodayDailyCard(next);
    setToday(next);
    setSaved(true);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 text-muted-foreground/60 text-xs tracking-wider hover:text-primary/70 transition-colors mb-8 -mt-4"
      >
        <Sun className="w-3.5 h-3.5" />
        {today ? "今日一张 · 再看看" : "抽一张今天给自己的提醒"}
      </button>

      <AnimatePresence>
        {open && card && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center px-4"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-sm border border-primary/20 bg-background/95 backdrop-blur-md rounded-lg px-6 py-8 text-center shadow-[0_0_40px_rgba(120,119,198,0.15)]"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute right-3 top-3 text-muted-foreground/60 hover:text-foreground transition-colors"
                aria-label="关闭"
              >
                <X className="w-4 h-4" />
              </button>
              <h2 className="text-primary text-sm tracking-[0.4em] mb-6 font-light">今日一张</h2>

              <div className="flex justify-center mb-6">
                <TarotCard card={card} index={0} onFlip={handleFlip} onImageLoad={handleImageLoad} />
              </div>

              {!card.flipped ? (
                <p className="text-muted-foreground text-xs tracking-wider">静一静，点击翻开</p>
              ) : (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                  <p className="text-foreground/80 text-sm leading-relaxed mb-6">{getDailyReminder(card.name)}</p>
                  {saved ? (
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {note ? <>今天我想留意：{note}</> : "已收下这张提醒"}
                    </p>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <input
                        type="text"
                        value={note}
                        maxLength={60}
                        onChange={(e) => setNote(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveNote()}
                        placeholder="今天我想留意……（可不填）"
                        className="w-full bg-transparent border-b border-primary/15 text-primary placeholder:text-muted-foreground text-center text-sm py-2 focus:outline-none focus:border-primary/40 transition-colors"
                      />
                      <button
                        onClick={handleSaveNote}
                        className="px-6 py-2 border border-primary/25 text-primary/80 text-xs tracking-[0.3em] hover:border-primary/40 hover:bg-primary/5 transition-all"
                      >
                        收下
                      </button>
                    </div>
                  )}
                  <p className="text-muted-foreground/40 text-[10px] mt-6">一天一张 · 只是提醒，不是预言</p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DailyCard;
