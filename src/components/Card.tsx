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
    const sizeClass = size === 'mini' ? 'card-mini' : 'card-small';
    const colorClass = suitColors[suit] || 'text-gray-800';
    
    // Responsive text sizing - smaller on mobile for mini cards
    const rankSizeClass = size === 'mini' 
        ? 'text-xs xs:text-sm sm:text-base md:text-lg font-bold'
        : 'text-lg font-bold';
    const suitSizeClass = size === 'mini'
        ? 'text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl leading-none'
        : 'text-2xl leading-none';
    
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
                <div className="absolute top-0 right-0 w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full border border-yellow-600" />
            )}
            
            {/* Card Content */}
            <div className={`${colorClass} ${rankSizeClass}`}>
                {rank === 'JOKER' ? '🃏' : rank}
            </div>
            <div className={`${colorClass} ${suitSizeClass}`}>
                {suitSymbols[suit]}
            </div>
            
            {/* Printed Joker Label */}
            {isPrintedJoker && (
                <div className="absolute bottom-0 text-xs font-semibold text-purple-600">
                    JOKER
                </div>
            )}
        </div>
    );
}
