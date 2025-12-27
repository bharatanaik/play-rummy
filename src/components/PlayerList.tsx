import type { Player } from '../model';
import PlayerAvatar from './PlayerAvatar';

interface PlayerListProps {
    players: Record<string, Player>;
    currentTurn: string;
}

export default function PlayerList({ players, currentTurn }: PlayerListProps) {
    const playerArray = Object.entries(players).map(([uid, player]) => ({
        ...player,
        uid,
    }));

    return (
        <div className="bg-green-800/50 backdrop-blur-sm p-3 shadow-lg">
            {/* Mobile: Horizontal scroll */}
            <div className="flex overflow-x-auto hide-scrollbar gap-2 md:hidden">
                {playerArray.map((player) => (
                    <div key={player.uid} className="flex-shrink-0">
                        <PlayerAvatar
                            player={player}
                            isCurrentTurn={currentTurn === player.uid}
                            cardCount={player.hand?.length}
                        />
                    </div>
                ))}
            </div>

            {/* Desktop: Grid layout */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {playerArray.map((player) => (
                    <PlayerAvatar
                        key={player.uid}
                        player={player}
                        isCurrentTurn={currentTurn === player.uid}
                        cardCount={player.hand?.length}
                    />
                ))}
            </div>
        </div>
    );
}
