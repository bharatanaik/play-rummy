import type { Card as CardType } from '../model';
import Card from './Card';
import { useState } from 'react';

interface HandBarProps {
    hand: CardType[];
    selectedCardId: string | null;
    onCardSelect: (cardId: string) => void;
    onReorder?: (reorderedHand: CardType[]) => void;
}

export default function HandBar({ hand, selectedCardId, onCardSelect, onReorder }: HandBarProps) {
    const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const handleDragStart = (e: React.DragEvent, cardId: string, index: number) => {
        setDraggedCardId(cardId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('cardId', cardId);
        e.dataTransfer.setData('sourceIndex', index.toString());
        e.dataTransfer.setData('source', 'hand');
    };

    const handleDragEnd = () => {
        setDraggedCardId(null);
        setDragOverIndex(null);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverIndex(index);
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        const cardId = e.dataTransfer.getData('cardId');
        const sourceIndexStr = e.dataTransfer.getData('sourceIndex');
        const source = e.dataTransfer.getData('source');
        
        // Only handle reordering within hand
        if (source === 'hand' && cardId && sourceIndexStr && onReorder) {
            const sourceIndex = parseInt(sourceIndexStr, 10);
            if (sourceIndex !== dropIndex) {
                const newHand = [...hand];
                const [movedCard] = newHand.splice(sourceIndex, 1);
                newHand.splice(dropIndex, 0, movedCard);
                onReorder(newHand);
            }
        }
        
        setDragOverIndex(null);
        setDraggedCardId(null);
    };

    return (
        <div className="hand-bar">
            <div className="flex gap-1 sm:gap-2 md:gap-3 overflow-x-auto hide-scrollbar pb-2 justify-center">
                {hand.map((card, index) => (
                    <div
                        key={card.id}
                        className={`
                            flex-shrink-0 transition-all duration-200
                            ${dragOverIndex === index && draggedCardId !== card.id ? 'ml-4' : ''}
                            ${draggedCardId === card.id ? 'opacity-50' : 'opacity-100'}
                        `}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                    >
                        <Card
                            {...card}
                            isSelected={selectedCardId === card.id}
                            onClick={() => onCardSelect(card.id)}
                            size="mini"
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, card.id, index)}
                            onDragEnd={handleDragEnd}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
