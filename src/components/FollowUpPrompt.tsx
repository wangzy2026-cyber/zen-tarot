import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getReadings, saveFollowUp } from "@/lib/api";
import { getOrCreateUserId } from "@/utils/userId";
import {
  AskedQuestion,
  dismissFollowUp,
  hasSeeded,
  pickFollowUp,
  recordFollowUp,
  relativeDays,
  seedFromHistory,
} from "@/utils/localJournal";

// 「回访追问」：问过的问题过了 7 天，再打开网页时轻轻问一句「后来怎么样了？」。
// 重点是帮用户回顾自己的决定，和占卜准不准无关。写下的「后来」存进 follow_ups 表，在「馆藏」里能回看。

// 预览用：网址后加 ?demo=followup 会显示一条示例回访（不读写任何真实数据）
const DEMO = (() => {
  try {
    return new URLSearchParams(window.location.search).get("demo") === "followup";
  } catch {
    return false;
  }
})();
const DEMO_ITEM: AskedQuestion = {
  readingId: "demo",
  question: "要不要换工作？",
  askedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
};

const FollowUpPrompt = () => {
  const [item, setItem] = useState<AskedQuestion | null>(null);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (DEMO) {
      setItem(DEMO_ITEM);
      return;
    }
    let alive = true;
    const pick = () => alive && setItem(pickFollowUp());
    if (hasSeeded()) {
      pick();
    } else {
      // 老用户第一次见到这个功能：从服务器拉一次自己的历史，补齐本地问题列表
      getReadings(getOrCreateUserId(), 100)
        .then((rows) => Array.isArray(rows) && seedFromHistory(rows))
        .catch(() => {})
        .finally(pick);
    }
    return () => {
      alive = false;
    };
  }, []);

  if (!item) return null;

  const handleSave = async () => {
    if (!text.trim() || saving) return;
    if (!DEMO) {
      setSaving(true);
      setError("");
      try {
        await saveFollowUp(item.readingId, text.trim());
      } catch {
        setSaving(false);
        setError("没存上，稍后再试一次");
        return;
      }
      recordFollowUp(item.readingId, text);
      setSaving(false);
    }
    setDone(true);
    setTimeout(() => setItem(null), 2200);
  };

  const handleSkip = () => {
    if (!DEMO) dismissFollowUp(item.readingId);
    setItem(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="w-full max-w-md border border-primary/15 rounded-lg px-5 py-4 mb-8 bg-background/40 backdrop-blur-sm"
      >
        {done ? (
          <p className="text-muted-foreground text-xs text-center tracking-wider">已记下 · 在「馆藏」里可以回看</p>
        ) : (
          <>
            <p className="text-muted-foreground text-xs tracking-wider mb-1">{relativeDays(item.askedAt)}，你问过：</p>
            <p className="text-primary/90 text-sm mb-3 line-clamp-2">「{item.question}」</p>
            <p className="text-foreground/70 text-xs mb-3">后来怎么样了？</p>
            <textarea
              value={text}
              maxLength={200}
              rows={2}
              onChange={(e) => setText(e.target.value)}
              placeholder="写一句近况就好"
              className="w-full bg-transparent border border-primary/10 rounded text-foreground/80 placeholder:text-muted-foreground/60 text-xs p-2 focus:outline-none focus:border-primary/30 transition-colors resize-none"
            />
            {error && <p className="text-amber-400/80 text-[11px] mt-2">{error}</p>}
            <div className="flex justify-end gap-4 mt-3">
              <button
                onClick={handleSkip}
                className="text-muted-foreground/60 text-xs tracking-wider hover:text-foreground transition-colors"
              >
                不用了
              </button>
              <button
                onClick={handleSave}
                disabled={!text.trim() || saving}
                className="px-4 py-1.5 border border-primary/25 text-primary/80 text-xs tracking-[0.2em] hover:border-primary/40 hover:bg-primary/5 transition-all disabled:opacity-30"
              >
                {saving ? "保存中…" : "记下来"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default FollowUpPrompt;
