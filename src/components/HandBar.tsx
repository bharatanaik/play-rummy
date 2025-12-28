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

    // Constants for layout
    const CARDS_PER_ROW = 7;
    const DRAG_SPACING = 'ml-2';

    // Split hand into two rows
    const topRow = hand.slice(0, CARDS_PER_ROW);
    const bottomRow = hand.slice(CARDS_PER_ROW);

    const handleDragStart = (e: React.DragEvent, cardId: string, index: number) => {
        setDraggedCardId(cardId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('cardId', cardId);
        e.dataTransfer.setData('sourceIndex', index.toString());
        e.dataTransfer.setData('source', 'hand');
        console.log('[DRAG] Drag started for card:', cardId, 'at index:', index);
    };

    const handleDragEnd = () => {
        console.log('[DRAG] Drag ended, clearing state');
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
        
        try {
            const cardId = e.dataTransfer.getData('cardId');
            const sourceIndexStr = e.dataTransfer.getData('sourceIndex');
            const source = e.dataTransfer.getData('source');
            
            console.log('[DRAG] Drop event - cardId:', cardId, 'source:', source, 'sourceIndex:', sourceIndexStr, 'dropIndex:', dropIndex);
            
            // Only handle reordering within hand
            if (source === 'hand' && cardId && sourceIndexStr && onReorder) {
                const sourceIndex = parseInt(sourceIndexStr, 10);
                if (sourceIndex !== dropIndex) {
                    const newHand = [...hand];
                    const [movedCard] = newHand.splice(sourceIndex, 1);
                    newHand.splice(dropIndex, 0, movedCard);
                    console.log('[DRAG] Reordering hand from index', sourceIndex, 'to', dropIndex);
                    onReorder(newHand);
                }
            }
        } catch (error) {
            console.error('[DRAG] Error during drop:', error);
        } finally {
            // Always clean up drag state
            setDragOverIndex(null);
            setDraggedCardId(null);
        }
    };

    return (
        <div className="hand-bar">
            <div className="px-2 pb-2">
                {/* Top row - 7 cards */}
                <div className="flex justify-center gap-1 mb-1">
                    {topRow.map((card, index) => (
                        <div
                            key={card.id}
                            className={`
                                shrink-0 transition-all duration-200
                                ${dragOverIndex === index && draggedCardId !== card.id ? DRAG_SPACING : ''}
                                ${draggedCardId === card.id ? 'opacity-50' : 'opacity-100'}
                            `}
                            style={{ 
                                transform: selectedCardId === card.id ? 'translateY(-12px)' : 'none',
                                zIndex: selectedCardId === card.id ? 50 : 10
                            }}
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

                {/* Bottom row - 6 or 7 cards */}
                <div className="flex justify-center gap-1">
                    {bottomRow.map((card, index) => {
                        const actualIndex = index + CARDS_PER_ROW;
                        return (
                            <div
                                key={card.id}
                                className={`
                                    shrink-0 transition-all duration-200
                                    ${dragOverIndex === actualIndex && draggedCardId !== card.id ? DRAG_SPACING : ''}
                                    ${draggedCardId === card.id ? 'opacity-50' : 'opacity-100'}
                                `}
                                style={{ 
                                    transform: selectedCardId === card.id ? 'translateY(-12px)' : 'none',
                                    zIndex: selectedCardId === card.id ? 50 : 10
                                }}
                                onDragOver={(e) => handleDragOver(e, actualIndex)}
                                onDrop={(e) => handleDrop(e, actualIndex)}
                            >
                                <Card
                                    {...card}
                                    isSelected={selectedCardId === card.id}
                                    onClick={() => onCardSelect(card.id)}
                                    size="mini"
                                    draggable={true}
                                    onDragStart={(e) => handleDragStart(e, card.id, actualIndex)}
                                    onDragEnd={handleDragEnd}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
