import { DrawnCard, SpreadType } from "@/types/tarot";
import TarotCard from "./TarotCard";

interface CardSpreadProps {
  cards: DrawnCard[];
  spread: SpreadType;
  onFlip: (id: number) => void;
  onImageLoad: (id: number) => void;
}

const SingleLayout = ({ cards, onFlip, onImageLoad }: Omit<CardSpreadProps, "spread">) => (
  <div className="flex justify-center">
    {cards.map((card, i) => (
      <TarotCard key={card.id} card={card} index={i} onFlip={onFlip} onImageLoad={onImageLoad} mobile />
    ))}
  </div>
);

const TrinityLayout = ({ cards, onFlip, onImageLoad }: Omit<CardSpreadProps, "spread">) => (
  <>
    {/* Mobile: top-1 bottom-2 pyramid */}
    <div className="flex flex-col items-center gap-3 md:hidden">
      <TarotCard key={cards[0]?.id} card={cards[0]} index={0} onFlip={onFlip} onImageLoad={onImageLoad} mobile />
      <div className="flex gap-3 justify-center">
        {cards.slice(1).map((card, i) => (
          <TarotCard key={card.id} card={card} index={i + 1} onFlip={onFlip} onImageLoad={onImageLoad} mobile />
        ))}
      </div>
    </div>
    {/* Desktop */}
    <div className="hidden md:flex gap-8 justify-center">
      {cards.map((card, i) => (
        <TarotCard key={card.id} card={card} index={i} onFlip={onFlip} onImageLoad={onImageLoad} />
      ))}
    </div>
  </>
);

const CelticLayout = ({ cards, onFlip, onImageLoad }: Omit<CardSpreadProps, "spread">) => (
  <div className="w-full max-w-2xl mx-auto">
    {/* Mobile: 2-col grid, no horizontal scroll */}
    <div className="grid grid-cols-2 gap-2 place-items-center md:hidden">
      {cards.map((card, i) => (
        <div key={card.id} className="flex flex-col items-center gap-1">
          <TarotCard card={card} index={i} onFlip={onFlip} onImageLoad={onImageLoad} compact />
          <span className="text-muted-foreground/50 text-[9px] text-center leading-tight max-w-[80px]">
            {card.position}
          </span>
        </div>
      ))}
    </div>
    {/* Desktop: cross layout */}
    <div className="hidden md:grid grid-cols-6 grid-rows-5 gap-2 place-items-center min-h-[480px]">
      {/* Center cross: cards 0,1 stacked */}
      <div className="col-start-3 row-start-2 row-span-2 relative">
        <TarotCard card={cards[0]} index={0} onFlip={onFlip} onImageLoad={onImageLoad} compact />
        {cards[1] && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 origin-center">
            <TarotCard card={cards[1]} index={1} onFlip={onFlip} onImageLoad={onImageLoad} compact />
          </div>
        )}
      </div>
      {/* Above: card 2 */}
      <div className="col-start-3 row-start-1">
        {cards[2] && <TarotCard card={cards[2]} index={2} onFlip={onFlip} onImageLoad={onImageLoad} compact />}
      </div>
      {/* Below: card 4 */}
      <div className="col-start-3 row-start-4">
        {cards[4] && <TarotCard card={cards[4]} index={4} onFlip={onFlip} onImageLoad={onImageLoad} compact />}
      </div>
      {/* Left: card 3 */}
      <div className="col-start-2 row-start-2">
        {cards[3] && <TarotCard card={cards[3]} index={3} onFlip={onFlip} onImageLoad={onImageLoad} compact />}
      </div>
      {/* Right: card 5 */}
      <div className="col-start-4 row-start-2">
        {cards[5] && <TarotCard card={cards[5]} index={5} onFlip={onFlip} onImageLoad={onImageLoad} compact />}
      </div>
      {/* Right column: cards 6-9 */}
      <div className="col-start-6 row-start-4">
        {cards[6] && <TarotCard card={cards[6]} index={6} onFlip={onFlip} onImageLoad={onImageLoad} compact />}
      </div>
      <div className="col-start-6 row-start-3">
        {cards[7] && <TarotCard card={cards[7]} index={7} onFlip={onFlip} onImageLoad={onImageLoad} compact />}
      </div>
      <div className="col-start-6 row-start-2">
        {cards[8] && <TarotCard card={cards[8]} index={8} onFlip={onFlip} onImageLoad={onImageLoad} compact />}
      </div>
      <div className="col-start-6 row-start-1">
        {cards[9] && <TarotCard card={cards[9]} index={9} onFlip={onFlip} onImageLoad={onImageLoad} compact />}
      </div>
    </div>
  </div>
);

const CardSpread = ({ cards, spread, onFlip, onImageLoad }: CardSpreadProps) => {
  switch (spread) {
    case "single":
      return <SingleLayout cards={cards} onFlip={onFlip} onImageLoad={onImageLoad} />;
    case "trinity":
      return <TrinityLayout cards={cards} onFlip={onFlip} onImageLoad={onImageLoad} />;
    case "celtic":
      return <CelticLayout cards={cards} onFlip={onFlip} onImageLoad={onImageLoad} />;
  }
};

export default CardSpread;
