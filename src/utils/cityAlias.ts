const CITY_ALIASES = [
  "星尘旅者", "月影行者", "极光守望", "深海游吟", "云端隐士",
  "晨曦寻路", "暮色织梦", "银河漫步", "幽谷听风", "雪山问道",
  "荒原骑士", "雾都幻影", "沙漠之鹰", "森林精灵", "冰原猎手",
  "彩虹桥畔", "瀑布之声", "古堡守夜", "灯塔望者", "潮汐使者",
];

export function getRandomCityAlias(): string {
  return CITY_ALIASES[Math.floor(Math.random() * CITY_ALIASES.length)];
}
