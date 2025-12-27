import type { Card as CardType } from '../model';

interface CardProps extends CardType {
    isSelected?: boolean;
    onClick?: () => void;
    size?: 'mini' | 'small';
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
}: CardProps) {
    const sizeClass = size === 'mini' ? 'card-mini' : 'card-small';
    const colorClass = suitColors[suit] || 'text-gray-800';
    
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
            `}
            onClick={onClick}
        >
            {/* Wild Joker Indicator */}
            {isWildJoker && !isPrintedJoker && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 rounded-full border border-yellow-600" />
            )}
            
            {/* Card Content */}
            <div className={`${colorClass} font-bold text-lg`}>
                {rank === 'JOKER' ? '🃏' : rank}
            </div>
            <div className={`${colorClass} text-2xl leading-none`}>
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
