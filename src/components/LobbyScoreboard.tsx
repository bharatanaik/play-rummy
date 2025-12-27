import type { LobbyScore, Player } from '../model';

interface LobbyScoreboardProps {
    scores: LobbyScore;
    players: Player[];
}

export default function LobbyScoreboard({ scores, players }: LobbyScoreboardProps) {
    // Create array of player scores with player info
    const scoreData = Object.entries(scores).map(([uid, scoreInfo]) => {
        const player = players.find(p => p.uid === uid);
        return {
            uid,
            name: player?.name || 'Unknown Player',
            ...scoreInfo,
            winRate: scoreInfo.gamesPlayed > 0 
                ? Math.round((scoreInfo.gamesWon / scoreInfo.gamesPlayed) * 100) 
                : 0,
        };
    }).sort((a, b) => {
        // Sort by total score (lower is better)
        if (a.totalScore !== b.totalScore) {
            return a.totalScore - b.totalScore;
        }
        // Tie-breaker: more wins
        return b.gamesWon - a.gamesWon;
    });

    if (scoreData.length === 0) {
        return null; // Don't show scoreboard if no games played yet
    }

    return (
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-4">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📊</span>
                <h2 className="text-xl font-bold text-gray-800">Lobby Leaderboard</h2>
            </div>

            {/* Desktop View - Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">Rank</th>
                            <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">Player</th>
                            <th className="text-center py-2 px-3 text-sm font-semibold text-gray-600">Games</th>
                            <th className="text-center py-2 px-3 text-sm font-semibold text-gray-600">Wins</th>
                            <th className="text-center py-2 px-3 text-sm font-semibold text-gray-600">Win Rate</th>
                            <th className="text-center py-2 px-3 text-sm font-semibold text-gray-600">Total Score</th>
                            <th className="text-center py-2 px-3 text-sm font-semibold text-gray-600">Best Hand</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scoreData.map((data, index) => (
                            <tr 
                                key={data.uid}
                                className={`border-b border-gray-100 ${index === 0 ? 'bg-yellow-50' : ''}`}
                            >
                                <td className="py-3 px-3">
                                    <div className={`
                                        w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                        ${index === 0 ? 'bg-yellow-400 text-yellow-900' : 
                                          index === 1 ? 'bg-gray-300 text-gray-700' :
                                          index === 2 ? 'bg-orange-300 text-orange-900' :
                                          'bg-gray-100 text-gray-600'}
                                    `}>
                                        {index + 1}
                                    </div>
                                </td>
                                <td className="py-3 px-3">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-800">{data.name}</span>
                                        {index === 0 && <span>👑</span>}
                                    </div>
                                </td>
                                <td className="py-3 px-3 text-center text-gray-700">{data.gamesPlayed}</td>
                                <td className="py-3 px-3 text-center">
                                    <span className="font-semibold text-green-600">{data.gamesWon}</span>
                                </td>
                                <td className="py-3 px-3 text-center">
                                    <span className={`font-semibold ${data.winRate >= 50 ? 'text-green-600' : 'text-gray-600'}`}>
                                        {data.winRate}%
                                    </span>
                                </td>
                                <td className="py-3 px-3 text-center">
                                    <span className="font-bold text-blue-600">{data.totalScore}</span>
                                </td>
                                <td className="py-3 px-3 text-center">
                                    <span className="text-purple-600 font-semibold">
                                        {data.bestHand === Infinity ? '-' : data.bestHand}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile View - Cards */}
            <div className="md:hidden space-y-3">
                {scoreData.map((data, index) => (
                    <div
                        key={data.uid}
                        className={`
                            border-2 rounded-lg p-4
                            ${index === 0 ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'}
                        `}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center font-bold
                                    ${index === 0 ? 'bg-yellow-400 text-yellow-900' : 
                                      index === 1 ? 'bg-gray-300 text-gray-700' :
                                      index === 2 ? 'bg-orange-300 text-orange-900' :
                                      'bg-gray-100 text-gray-600'}
                                `}>
                                    {index + 1}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-800 flex items-center gap-2">
                                        <span>{data.name}</span>
                                        {index === 0 && <span>👑</span>}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {data.gamesPlayed} games • {data.gamesWon} wins
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                                <div className="text-xs text-gray-600">Win Rate</div>
                                <div className={`font-bold ${data.winRate >= 50 ? 'text-green-600' : 'text-gray-700'}`}>
                                    {data.winRate}%
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-600">Total Score</div>
                                <div className="font-bold text-blue-600">{data.totalScore}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-600">Best Hand</div>
                                <div className="font-bold text-purple-600">
                                    {data.bestHand === Infinity ? '-' : data.bestHand}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
