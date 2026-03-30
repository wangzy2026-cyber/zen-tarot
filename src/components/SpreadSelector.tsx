import { SpreadType, SPREADS } from "@/types/tarot";

interface SpreadSelectorProps {
  value: SpreadType;
  onChange: (spread: SpreadType) => void;
}

const SpreadSelector = ({ value, onChange }: SpreadSelectorProps) => {
  const spreads: SpreadType[] = ["single", "trinity", "celtic"];

  return (
    <div className="flex flex-col items-center gap-4 mb-8">
      <p className="text-muted-foreground text-xs tracking-[0.3em] uppercase">
        选择牌阵
      </p>
      <div className="flex gap-2 md:gap-3">
        {spreads.map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`px-4 py-2 text-xs md:text-sm tracking-wider border transition-all duration-300 rounded-sm ${
              value === s
                ? "border-primary/50 text-primary bg-primary/10"
                : "border-primary/10 text-muted-foreground hover:border-primary/25 hover:text-primary/70"
            }`}
          >
            <span className="block font-semibold">{SPREADS[s].label}</span>
            <span className="block text-[10px] mt-0.5 opacity-60">
              {SPREADS[s].count}牌
            </span>
          </button>
        ))}
      </div>
      <p className="text-muted-foreground/60 text-xs italic">
        {SPREADS[value].description}
      </p>
    </div>
  );
};

export default SpreadSelector;
