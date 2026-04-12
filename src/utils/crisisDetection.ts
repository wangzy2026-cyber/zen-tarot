// Crisis keyword detection and language (Simplified vs Traditional Chinese) detection

const CRISIS_KEYWORDS = [
  // Chinese - direct
  "不想活", "想死", "自杀", "自殺", "去死", "活不下去", "不想活了",
  "想自杀", "想自殺", "结束生命", "結束生命", "了结", "了結",
  "轻生", "輕生", "寻死", "尋死", "厌世", "厭世", "不如死",
  "死了算了", "活着没意思", "活著沒意思", "生无可恋", "生無可戀",
  "跳楼", "跳樓", "割腕", "服毒", "上吊", "吞药", "吞藥",
  // Chinese - semantic / despair
  "想解脱", "想解脫", "离开这个世界", "離開這個世界",
  "人间不值得", "人間不值得", "活着还是死去", "活著還是死去",
  "人生的意义是消失", "人生的意義是消失",
  "不想醒来", "不想醒來", "永远睡去", "永遠睡去",
  "世界没有我会更好", "世界沒有我會更好",
  "没有人在乎", "沒有人在乎", "活着好累", "活著好累",
  "消失就好了", "如果我不在了", "如果我不在了",
  // English
  "suicide", "kill myself", "end my life", "want to die", "don't want to live",
  "better off dead", "no reason to live",
];

/**
 * Check if text contains crisis-related keywords.
 */
export function containsCrisisKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Detect if text is likely Traditional Chinese.
 * Returns "traditional" or "simplified".
 */
export function detectChineseVariant(text: string): "traditional" | "simplified" {
  const traditionalChars = [
    "嗎", "們", "裡", "與", "對", "將", "從", "這", "過", "還",
    "進", "為", "無", "後", "應", "點", "開", "間", "說", "請",
    "關", "實", "經", "現", "發", "問", "運", "會", "區", "機",
    "種", "論", "別", "當", "動", "書", "學", "體", "電", "長",
    "門", "車", "見", "話", "買", "遠", "選", "處", "聽", "義",
    "讓", "認", "議", "價", "傳", "優", "億", "黨", "歡", "歷",
    "壓", "雞", "齊", "齒", "龍", "龜",
  ];
  const simplifiedChars = [
    "吗", "们", "里", "与", "对", "将", "从", "这", "过", "还",
    "进", "为", "无", "后", "应", "点", "开", "间", "说", "请",
    "关", "实", "经", "现", "发", "问", "运", "会", "区", "机",
    "种", "论", "别", "当", "动", "书", "学", "体", "电", "长",
    "门", "车", "见", "话", "买", "远", "选", "处", "听", "义",
    "让", "认", "议", "价", "传", "优", "亿", "党", "欢", "历",
    "压", "鸡", "齐", "齿", "龙", "龟",
  ];

  let tradCount = 0;
  let simpCount = 0;

  for (const char of text) {
    if (traditionalChars.includes(char)) tradCount++;
    if (simplifiedChars.includes(char)) simpCount++;
  }

  return tradCount > simpCount ? "traditional" : "simplified";
}
