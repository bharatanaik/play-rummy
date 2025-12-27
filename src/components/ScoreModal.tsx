import type { GameScore } from '../model';
import { useNavigate } from 'react-router';
import { lobbyService } from '../services/lobby.service';
import { useState } from 'react';

interface ScoreModalProps {
    scores: GameScore[];
    gameId: string;
    lobbyId: string;
    isHost: boolean;
    onBackToLobby: () => void;
}

export default function ScoreModal({ scores, gameId, lobbyId, isHost, onBackToLobby }: ScoreModalProps) {
    const navigate = useNavigate();
    const [isUpdatingScores, setIsUpdatingScores] = useState(false);
    const winner = scores.find(s => s.isWinner);

    const handleBackToLobby = async () => {
        // Update lobby scores before going back
        setIsUpdatingScores(true);
        try {
            await lobbyService.updateLobbyScores(lobbyId, scores);
        } catch (err) {
            console.error('Failed to update lobby scores:', err);
        } finally {
            setIsUpdatingScores(false);
            onBackToLobby();
        }
    };

    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header with celebration */}
                <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white p-8 rounded-t-2xl text-center">
                    <div className="text-6xl mb-4 animate-bounce">🏆</div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Game Complete!</h1>
                    {winner && (
                        <div className="mt-4">
                            <p className="text-2xl font-bold text-yellow-100">
                                🎉 {winner.playerName} Wins! 🎉
                            </p>
                            <p className="text-yellow-100 mt-2">
                                Perfect declaration with {winner.score} points
                            </p>
                        </div>
                    )}
                </div>

                {/* Scores Table */}
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Final Scores</h2>
                    
                    <div className="space-y-3">
                        {scores
                            .sort((a, b) => a.score - b.score) // Sort by score (lowest first)
                            .map((score, index) => (
                                <div
                                    key={score.playerUid}
                                    className={`
                                        border-2 rounded-lg p-4
                                        ${score.isWinner 
                                            ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-400' 
                                            : 'bg-gray-50 border-gray-300'
                                        }
                                    `}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`
                                                text-2xl font-bold w-10 h-10 rounded-full 
                                                flex items-center justify-center
                                                ${score.isWinner 
                                                    ? 'bg-yellow-400 text-yellow-900' 
                                                    : index === 1 
                                                        ? 'bg-gray-300 text-gray-700'
                                                        : index === 2
                                                            ? 'bg-orange-300 text-orange-900'
                                                            : 'bg-gray-200 text-gray-600'
                                                }
                                            `}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-lg text-gray-800">
                                                        {score.playerName}
                                                    </span>
                                                    {score.isWinner && (
                                                        <span className="text-xl">👑</span>
                                                    )}
                                                </div>
                                                {score.declarationType && (
                                                    <div className="text-sm text-gray-600">
                                                        {score.declarationType === 'valid' && '✓ Valid Declaration'}
                                                        {score.declarationType === 'invalid' && '✗ Invalid Declaration (80 pts penalty)'}
                                                        {score.declarationType === 'first-drop' && '↓ First Drop (20 pts penalty)'}
                                                        {score.declarationType === 'middle-drop' && '↓ Middle Drop (40 pts penalty)'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="text-right">
                                            <div className={`
                                                text-3xl font-bold
                                                ${score.isWinner ? 'text-green-600' : 'text-red-600'}
                                            `}>
                                                {score.score}
                                            </div>
                                            <div className="text-xs text-gray-500">points</div>
                                        </div>
                                    </div>

                                    {/* Show melds for winner or declared players */}
                                    {score.melds && score.melds.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <div className="text-sm font-semibold text-gray-700 mb-2">Melds:</div>
                                            <div className="flex flex-wrap gap-2">
                                                {score.melds.map((meld, i) => (
                                                    <div
                                                        key={i}
                                                        className="text-xs bg-white border border-gray-300 rounded px-2 py-1"
                                                    >
                                                        <span className="font-semibold capitalize">
                                                            {meld.type.replace('-', ' ')}:
                                                        </span>{' '}
                                                        {meld.cards.map(c => `${c.rank}${c.suit === 'joker' ? '🃏' : ''}`).join(', ')}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>

                    {/* Game Info */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <div className="text-sm text-gray-600">
                            <p><strong>Game ID:</strong> {gameId}</p>
                            <p className="mt-1"><strong>Total Players:</strong> {scores.length}</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <button
                            onClick={handleBackToLobby}
                            disabled={isUpdatingScores}
                            className="flex-1 btn bg-green-500 hover:bg-green-600 text-white px-6 py-3 text-lg font-bold rounded-lg disabled:opacity-50"
                        >
                            {isUpdatingScores ? 'Updating...' : (isHost ? '🔄 Play Again' : '↩️ Back to Lobby')}
                        </button>
                        <button
                            onClick={handleBackToDashboard}
                            className="flex-1 btn bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 text-lg font-bold rounded-lg"
                        >
                            🏠 Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
