import { TarotCardData } from "@/data/tarotDeck";

export type SpreadType = "single" | "trinity" | "celtic";

export interface SpreadInfo {
  label: string;
  description: string;
  count: number;
  positions: string[];
}

export const SPREADS: Record<SpreadType, SpreadInfo> = {
  single: {
    label: "单牌指引",
    description: "快速获取当下的能量建议",
    count: 1,
    positions: ["当下能量"],
  },
  trinity: {
    label: "圣三角",
    description: "过去 / 现在 / 未来",
    count: 3,
    positions: ["过去", "现在", "未来"],
  },
  celtic: {
    label: "凯尔特十字",
    description: "10 张牌深度分析",
    count: 10,
    positions: [
      "现状",
      "挑战",
      "潜意识",
      "过去",
      "可能性",
      "近未来",
      "自我态度",
      "外部影响",
      "希望与恐惧",
      "最终结果",
    ],
  },
};

export interface DrawnCard extends TarotCardData {
  id: number;
  flipped: boolean;
  loaded: boolean;
  reversed: boolean;
  position: string;
}
