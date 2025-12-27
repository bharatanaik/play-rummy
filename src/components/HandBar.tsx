import type { Card as CardType } from '../model';
import Card from './Card';

interface HandBarProps {
    hand: CardType[];
    selectedCardId: string | null;
    onCardSelect: (cardId: string) => void;
}

export default function HandBar({ hand, selectedCardId, onCardSelect }: HandBarProps) {
    return (
        <div className="hand-bar">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                {hand.map((card) => (
                    <div key={card.id} className="flex-shrink-0">
                        <Card
                            {...card}
                            isSelected={selectedCardId === card.id}
                            onClick={() => onCardSelect(card.id)}
                            size="mini"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
