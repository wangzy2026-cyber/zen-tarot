export interface TarotCardData {
  name: string;
  nameCn: string;
  image: string;
}

const BASE = "https://upload.wikimedia.org/wikipedia/commons";

export const TAROT_DECK: TarotCardData[] = [
  // Major Arcana (0-21)
  { name: "The Fool", nameCn: "愚者", image: `${BASE}/9/90/RWS_Tarot_00_Fool.jpg` },
  { name: "The Magician", nameCn: "魔术师", image: `${BASE}/d/de/RWS_Tarot_01_Magician.jpg` },
  { name: "The High Priestess", nameCn: "女祭司", image: `${BASE}/8/88/RWS_Tarot_02_High_Priestess.jpg` },
  { name: "The Empress", nameCn: "女皇", image: `${BASE}/d/d2/RWS_Tarot_03_Empress.jpg` },
  { name: "The Emperor", nameCn: "皇帝", image: `${BASE}/c/c3/RWS_Tarot_04_Emperor.jpg` },
  { name: "The Hierophant", nameCn: "教皇", image: `${BASE}/8/8d/RWS_Tarot_05_Hierophant.jpg` },
  { name: "The Lovers", nameCn: "恋人", image: `${BASE}/3/3a/RWS_Tarot_06_Lovers.jpg` },
  { name: "The Chariot", nameCn: "战车", image: `${BASE}/9/9b/RWS_Tarot_07_Chariot.jpg` },
  { name: "Strength", nameCn: "力量", image: `${BASE}/f/f5/RWS_Tarot_08_Strength.jpg` },
  { name: "The Hermit", nameCn: "隐士", image: `${BASE}/4/4d/RWS_Tarot_09_Hermit.jpg` },
  { name: "Wheel of Fortune", nameCn: "命运之轮", image: `${BASE}/3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg` },
  { name: "Justice", nameCn: "正义", image: `${BASE}/e/e0/RWS_Tarot_11_Justice.jpg` },
  { name: "The Hanged Man", nameCn: "倒吊人", image: `${BASE}/2/2b/RWS_Tarot_12_Hanged_Man.jpg` },
  { name: "Death", nameCn: "死神", image: `${BASE}/d/d7/RWS_Tarot_13_Death.jpg` },
  { name: "Temperance", nameCn: "节制", image: `${BASE}/f/f8/RWS_Tarot_14_Temperance.jpg` },
  { name: "The Devil", nameCn: "恶魔", image: `${BASE}/5/55/RWS_Tarot_15_Devil.jpg` },
  { name: "The Tower", nameCn: "高塔", image: `${BASE}/5/53/RWS_Tarot_16_Tower.jpg` },
  { name: "The Star", nameCn: "星星", image: `${BASE}/d/db/RWS_Tarot_17_Star.jpg` },
  { name: "The Moon", nameCn: "月亮", image: `${BASE}/7/7f/RWS_Tarot_18_Moon.jpg` },
  { name: "The Sun", nameCn: "太阳", image: `${BASE}/1/17/RWS_Tarot_19_Sun.jpg` },
  { name: "Judgement", nameCn: "审判", image: `${BASE}/d/dd/RWS_Tarot_20_Judgement.jpg` },
  { name: "The World", nameCn: "世界", image: `${BASE}/f/ff/RWS_Tarot_21_World.jpg` },
  // Wands
  { name: "Ace of Wands", nameCn: "权杖王牌", image: `${BASE}/1/11/Wands01.jpg` },
  { name: "Two of Wands", nameCn: "权杖二", image: `${BASE}/0/0f/Wands02.jpg` },
  { name: "Three of Wands", nameCn: "权杖三", image: `${BASE}/f/ff/Wands03.jpg` },
  { name: "Four of Wands", nameCn: "权杖四", image: `${BASE}/a/a4/Wands04.jpg` },
  { name: "Five of Wands", nameCn: "权杖五", image: `${BASE}/9/9d/Wands05.jpg` },
  { name: "Six of Wands", nameCn: "权杖六", image: `${BASE}/3/3b/Wands06.jpg` },
  { name: "Seven of Wands", nameCn: "权杖七", image: `${BASE}/e/e4/Wands07.jpg` },
  { name: "Eight of Wands", nameCn: "权杖八", image: `${BASE}/6/6a/Wands08.jpg` },
  { name: "Nine of Wands", nameCn: "权杖九", image: `${BASE}/e/e7/Wands09.jpg` },
  { name: "Ten of Wands", nameCn: "权杖十", image: `${BASE}/0/0b/Wands10.jpg` },
  { name: "Page of Wands", nameCn: "权杖侍从", image: `${BASE}/6/6a/Wands11.jpg` },
  { name: "Knight of Wands", nameCn: "权杖骑士", image: `${BASE}/1/16/Wands12.jpg` },
  { name: "Queen of Wands", nameCn: "权杖王后", image: `${BASE}/0/0d/Wands13.jpg` },
  { name: "King of Wands", nameCn: "权杖国王", image: `${BASE}/c/ce/Wands14.jpg` },
  // Cups
  { name: "Ace of Cups", nameCn: "圣杯王牌", image: `${BASE}/3/36/Cups01.jpg` },
  { name: "Two of Cups", nameCn: "圣杯二", image: `${BASE}/f/f8/Cups02.jpg` },
  { name: "Three of Cups", nameCn: "圣杯三", image: `${BASE}/7/7a/Cups03.jpg` },
  { name: "Four of Cups", nameCn: "圣杯四", image: `${BASE}/3/35/Cups04.jpg` },
  { name: "Five of Cups", nameCn: "圣杯五", image: `${BASE}/d/d7/Cups05.jpg` },
  { name: "Six of Cups", nameCn: "圣杯六", image: `${BASE}/1/17/Cups06.jpg` },
  { name: "Seven of Cups", nameCn: "圣杯七", image: `${BASE}/a/ae/Cups07.jpg` },
  { name: "Eight of Cups", nameCn: "圣杯八", image: `${BASE}/6/60/Cups08.jpg` },
  { name: "Nine of Cups", nameCn: "圣杯九", image: `${BASE}/2/24/Cups09.jpg` },
  { name: "Ten of Cups", nameCn: "圣杯十", image: `${BASE}/8/84/Cups10.jpg` },
  { name: "Page of Cups", nameCn: "圣杯侍从", image: `${BASE}/a/ad/Cups11.jpg` },
  { name: "Knight of Cups", nameCn: "圣杯骑士", image: `${BASE}/f/fa/Cups12.jpg` },
  { name: "Queen of Cups", nameCn: "圣杯王后", image: `${BASE}/6/62/Cups13.jpg` },
  { name: "King of Cups", nameCn: "圣杯国王", image: `${BASE}/0/04/Cups14.jpg` },
  // Swords
  { name: "Ace of Swords", nameCn: "宝剑王牌", image: `${BASE}/1/1a/Swords01.jpg` },
  { name: "Two of Swords", nameCn: "宝剑二", image: `${BASE}/9/9e/Swords02.jpg` },
  { name: "Three of Swords", nameCn: "宝剑三", image: `${BASE}/0/02/Swords03.jpg` },
  { name: "Four of Swords", nameCn: "宝剑四", image: `${BASE}/b/bf/Swords04.jpg` },
  { name: "Five of Swords", nameCn: "宝剑五", image: `${BASE}/2/23/Swords05.jpg` },
  { name: "Six of Swords", nameCn: "宝剑六", image: `${BASE}/2/29/Swords06.jpg` },
  { name: "Seven of Swords", nameCn: "宝剑七", image: `${BASE}/3/34/Swords07.jpg` },
  { name: "Eight of Swords", nameCn: "宝剑八", image: `${BASE}/a/a7/Swords08.jpg` },
  { name: "Nine of Swords", nameCn: "宝剑九", image: `${BASE}/2/2f/Swords09.jpg` },
  { name: "Ten of Swords", nameCn: "宝剑十", image: `${BASE}/d/d4/Swords10.jpg` },
  { name: "Page of Swords", nameCn: "宝剑侍从", image: `${BASE}/4/4c/Swords11.jpg` },
  { name: "Knight of Swords", nameCn: "宝剑骑士", image: `${BASE}/b/b0/Swords12.jpg` },
  { name: "Queen of Swords", nameCn: "宝剑王后", image: `${BASE}/d/d4/Swords13.jpg` },
  { name: "King of Swords", nameCn: "宝剑国王", image: `${BASE}/3/33/Swords14.jpg` },
  // Pentacles
  { name: "Ace of Pentacles", nameCn: "星币王牌", image: `${BASE}/f/fd/Pents01.jpg` },
  { name: "Two of Pentacles", nameCn: "星币二", image: `${BASE}/9/9f/Pents02.jpg` },
  { name: "Three of Pentacles", nameCn: "星币三", image: `${BASE}/4/42/Pents03.jpg` },
  { name: "Four of Pentacles", nameCn: "星币四", image: `${BASE}/3/35/Pents04.jpg` },
  { name: "Five of Pentacles", nameCn: "星币五", image: `${BASE}/9/96/Pents05.jpg` },
  { name: "Six of Pentacles", nameCn: "星币六", image: `${BASE}/a/a6/Pents06.jpg` },
  { name: "Seven of Pentacles", nameCn: "星币七", image: `${BASE}/6/6a/Pents07.jpg` },
  { name: "Eight of Pentacles", nameCn: "星币八", image: `${BASE}/4/49/Pents08.jpg` },
  { name: "Nine of Pentacles", nameCn: "星币九", image: `${BASE}/f/f0/Pents09.jpg` },
  { name: "Ten of Pentacles", nameCn: "星币十", image: `${BASE}/4/42/Pents10.jpg` },
  { name: "Page of Pentacles", nameCn: "星币侍从", image: `${BASE}/e/ec/Pents11.jpg` },
  { name: "Knight of Pentacles", nameCn: "星币骑士", image: `${BASE}/d/d5/Pents12.jpg` },
  { name: "Queen of Pentacles", nameCn: "星币王后", image: `${BASE}/8/88/Pents13.jpg` },
  { name: "King of Pentacles", nameCn: "星币国王", image: `${BASE}/1/1c/Pents14.jpg` },
];

/** Pick n unique random cards from the deck */
export function drawCards(n: number): TarotCardData[] {
  const indices = new Set<number>();
  while (indices.size < n) {
    indices.add(Math.floor(Math.random() * TAROT_DECK.length));
  }
  return [...indices].map((i) => TAROT_DECK[i]);
}
