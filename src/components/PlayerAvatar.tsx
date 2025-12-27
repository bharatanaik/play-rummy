import type { Player } from '../model';

interface PlayerAvatarProps {
    player: Player;
    isCurrentTurn: boolean;
    cardCount?: number;
}

export default function PlayerAvatar({ player, isCurrentTurn, cardCount }: PlayerAvatarProps) {
    // Get initials from name
    const getInitials = (name: string | null) => {
        if (!name) return '?';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const initials = getInitials(player.name);
    const displayName = player.name || 'Player';

    return (
        <div
            className={`
                flex flex-col items-center p-2 rounded-lg transition-all duration-300
                ${isCurrentTurn ? 'bg-green-500/20 ring-2 ring-green-500 shadow-lg' : 'bg-white/10'}
            `}
        >
            {/* Avatar with card count badge */}
            <div className="relative">
                {player.photoURL ? (
                    <img
                        src={player.photoURL}
                        alt={displayName}
                        className={`
                            w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full border-2
                            ${isCurrentTurn ? 'border-green-400 ring-2 ring-green-300' : 'border-gray-300'}
                        `}
                    />
                ) : (
                    <div
                        className={`
                            w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full 
                            flex items-center justify-center font-bold text-white
                            ${isCurrentTurn ? 'bg-green-600 border-2 border-green-400' : 'bg-gray-600 border-2 border-gray-400'}
                        `}
                    >
                        {initials}
                    </div>
                )}
                
                {/* Card count badge */}
                {cardCount !== undefined && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                        {cardCount}
                    </div>
                )}

                {/* Current turn indicator */}
                {isCurrentTurn && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                )}
            </div>

            {/* Player name */}
            <div className="mt-2 text-center">
                <div className={`text-xs sm:text-sm font-semibold truncate max-w-[80px] sm:max-w-[100px] ${isCurrentTurn ? 'text-green-100' : 'text-white'}`}>
                    {displayName}
                </div>
                {isCurrentTurn && (
                    <div className="text-xs text-green-200 font-medium">
                        Playing...
                    </div>
                )}
            </div>

            {/* Declared/Dropped status */}
            {player.hasDeclared && (
                <div className="mt-1 bg-yellow-500 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded">
                    Declared
                </div>
            )}
        </div>
    );
}
