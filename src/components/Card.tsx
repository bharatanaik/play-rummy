import type { Card as CardType } from '../model';

interface CardProps extends CardType {
    isSelected?: boolean;
    onClick?: () => void;
    size?: 'mini' | 'small';
    onDragStart?: (e: React.DragEvent) => void;
    onDragEnd?: (e: React.DragEvent) => void;
    draggable?: boolean;
}

const suitSymbols: Record<string, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
    joker: '🃏',
};

const suitColors: Record<string, string> = {
    hearts: 'text-card-red',
    diamonds: 'text-card-red',
    clubs: 'text-card-black',
    spades: 'text-card-black',
    joker: 'text-purple-600',
};

export default function Card({
    id,
    suit,
    rank,
    isPrintedJoker,
    isWildJoker,
    isSelected = false,
    onClick,
    size = 'mini',
    onDragStart,
    onDragEnd,
    draggable = false,
}: CardProps) {
    // Validation: Check for invalid card data
    if (!id || !suit || !rank) {
        console.error('[CARD] ERROR: Invalid card data:', { id, suit, rank });
        // Return error card instead of null
        return (
            <div className="card-base card-mini bg-red-100 border-red-500 flex items-center justify-center">
                <div className="text-red-600 text-xs font-bold">ERROR</div>
            </div>
        );
    }

    const sizeClass = size === 'mini' ? 'card-mini' : 'card-small';
    const colorClass = suitColors[suit] || 'text-gray-800';
    
    // Responsive text sizing - smaller on mobile for two-row layout, larger on desktop
    const rankSizeClass = size === 'mini' 
        ? 'text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-none'
        : 'text-3xl md:text-4xl font-bold leading-none';
    const suitSizeClass = size === 'mini'
        ? 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-none'
        : 'text-4xl md:text-5xl leading-none';
    
    return (
        <div
            className={`
                card-base
                ${sizeClass} 
                ${isSelected ? 'card-selected' : ''} 
                flex flex-col items-center justify-center 
                cursor-pointer select-none
                transition-all duration-200
                ${onClick ? 'hover:shadow-lg active:scale-95' : ''}
                ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}
            `}
            onClick={onClick}
            draggable={draggable}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            {/* Wild Joker Indicator */}
            {isWildJoker && !isPrintedJoker && (
                <div className="absolute top-0.5 right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-400 rounded-full border border-yellow-600" />
            )}
            
            {/* Card Content */}
            <div className={`${colorClass} ${rankSizeClass} mb-0.5`}>
                {rank === 'JOKER' ? '🃏' : rank}
            </div>
            <div className={`${colorClass} ${suitSizeClass}`}>
                {suitSymbols[suit]}
            </div>
            
            {/* Printed Joker Label */}
            {isPrintedJoker && (
                <div className="absolute bottom-0.5 text-xs font-semibold text-purple-600">
                    JOKER
                </div>
            )}
        </div>
    );
}
