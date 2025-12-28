import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { gameService } from "../services/game.service";
import { lobbyService } from "../services/lobby.service";
import type { GameState, Meld } from "../model";
import Card from "../components/Card";
import HandBar from "../components/HandBar";
import ActionBar from "../components/ActionBar";
import PlayerList from "../components/PlayerList";
import DeclareModal from "../components/DeclareModal";
import ScoreModal from "../components/ScoreModal";

// Card back component for closed pile
const CardBack = () => (
    <div className="card-base card-small bg-blue-900 border-blue-700 flex items-center justify-center">
        <div className="text-white text-2xl">🂠</div>
    </div>
);

export default function Game() {
    const { gameId } = useParams();
    const { player } = useAuth();
    const navigate = useNavigate();

    const [gameState, setGameState] = useState<GameState | null>(null);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragOverDiscard, setIsDragOverDiscard] = useState(false);
    const [showDeclareModal, setShowDeclareModal] = useState(false);
    const [showScoreModal, setShowScoreModal] = useState(false);
    const [organizeMode, setOrganizeMode] = useState(false);
    const [firstSelectedCard, setFirstSelectedCard] = useState<string | null>(null);
    const [myHandOrder, setMyHandOrder] = useState<typeof playerHand>([]);

    // Guard: must be authenticated and have a gameId
    useEffect(() => {
        if (!player || !gameId) {
            navigate("/", { replace: true });
        }
    }, [player, gameId, navigate]);

    // Subscribe to game state updates
    useEffect(() => {
        if (!gameId || !player?.uid) return;

        const unsubscribe = gameService.subscribeToGame(gameId, (state) => {
            setGameState(state);
            
            // Initialize/update hand order when game state changes
            const playerHand = state?.players[player.uid!]?.hand;
            if (playerHand) {
                setMyHandOrder(playerHand);
            }
            
            // Show score modal when game is completed and scores are available
            if (state?.status === 'completed' && state.scores && state.scores.length > 0) {
                setShowScoreModal(true);
                setShowDeclareModal(false); // Close declare modal if open
            }
            
            // Clear error when game state updates successfully
            setError(null);
        });

        return () => unsubscribe();
    }, [gameId, player?.uid]);

    // Handle draw from closed pile
    const handleDrawClosed = async () => {
        if (!gameId || !player?.uid) return;

        try {
            setError(null);
            await gameService.drawFromClosed(gameId, player.uid);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to draw from closed pile');
            console.error(err);
        }
    };

    // Handle draw from open pile
    const handleDrawOpen = async () => {
        if (!gameId || !player?.uid) return;

        try {
            setError(null);
            await gameService.drawFromOpen(gameId, player.uid);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to draw from open pile');
            console.error(err);
        }
    };

    // Handle discard
    const handleDiscard = async () => {
        if (!gameId || !player?.uid || !selectedCardId) return;

        try {
            setError(null);
            await gameService.discard(gameId, player.uid, selectedCardId);
            setSelectedCardId(null); // Clear selection after discard
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to discard card');
            console.error(err);
        }
    };

    // Handle declare (placeholder - full implementation would show modal)
    const handleDeclare = async () => {
        if (!gameId || !player?.uid) return;
        
        // Show the declaration modal
        setShowDeclareModal(true);
    };

    // Handle actual declaration submission
    const handleDeclareSubmit = async (melds: Meld[]) => {
        if (!gameId || !player?.uid) return;

        try {
            setError(null);
            await gameService.declare(gameId, player.uid, melds);
            setShowDeclareModal(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to declare');
            console.error(err);
        }
    };

    // Handle card selection
    const handleCardSelect = (cardId: string) => {
        if (organizeMode) {
            // In organize mode: swap cards
            if (!firstSelectedCard) {
                // First card selected
                setFirstSelectedCard(cardId);
            } else if (firstSelectedCard === cardId) {
                // Deselect if clicking same card
                setFirstSelectedCard(null);
            } else {
                // Second card selected - swap them
                const newHand = [...myHandOrder];
                const idx1 = newHand.findIndex(c => c.id === firstSelectedCard);
                const idx2 = newHand.findIndex(c => c.id === cardId);
                
                if (idx1 !== -1 && idx2 !== -1) {
                    // Swap
                    [newHand[idx1], newHand[idx2]] = [newHand[idx2], newHand[idx1]];
                    setMyHandOrder(newHand);
                }
                
                // Clear selection
                setFirstSelectedCard(null);
            }
        } else {
            // Normal mode: select for discard
            setSelectedCardId(cardId === selectedCardId ? null : cardId);
        }
    };

    // Handle drag-to-discard
    const handleDiscardDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        const source = e.dataTransfer.types.includes('text/plain') || e.dataTransfer.effectAllowed === 'move';
        if (source) {
            e.dataTransfer.dropEffect = 'move';
            setIsDragOverDiscard(true);
        }
    };

    const handleDiscardDragLeave = () => {
        setIsDragOverDiscard(false);
    };

    const handleDiscardDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOverDiscard(false);
        
        const cardId = e.dataTransfer.getData('cardId');
        const source = e.dataTransfer.getData('source');
        
        console.log('[DISCARD] Drop event - cardId:', cardId, 'source:', source);
        
        // Only allow discarding from hand
        if (source === 'hand' && cardId && gameId && player?.uid) {
            try {
                setError(null);
                console.log('[DISCARD] Attempting to discard via drag-drop');
                await gameService.discard(gameId, player.uid, cardId);
                setSelectedCardId(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to discard card');
                console.error('[DISCARD] ERROR:', err);
            }
        }
    };

    // Handle back to lobby from score modal
    const handleBackToLobby = async () => {
        if (!gameState?.lobbyId) return;
        
        try {
            // End the current game in lobby
            await lobbyService.endCurrentGame(gameState.lobbyId);
            // Navigate back to lobby
            navigate(`/lobby/${gameState.lobbyId}`);
        } catch (err) {
            console.error('Failed to return to lobby:', err);
            // Fallback: just navigate
            navigate(`/lobby/${gameState.lobbyId}`);
        }
    };

    // Handle hand reordering (local only - not synced to server)
    const handleHandReorder = (reorderedHand: typeof playerHand) => {
        // Update local hand order
        setMyHandOrder(reorderedHand);
        console.log('Hand reordered via drag and drop');
    };

    if (!player || !gameId) return null;

    if (!gameState) {
        return (
            <div className="game-table flex items-center justify-center">
                <div className="text-white text-xl">Loading game...</div>
            </div>
        );
    }

    const currentPlayer = player.uid ? gameState.players[player.uid] : undefined;
    const isMyTurn = gameState.currentTurn === player.uid;
    const hasDrawn = currentPlayer?.hasDrawn || false;
    const playerHand = currentPlayer?.hand || [];
    const topOpenCard = gameState.openPile?.at(-1);
    
    // Use local hand order for display, fallback to server hand
    const displayHand = myHandOrder.length > 0 ? myHandOrder : playerHand;

    return (
        <div className="game-table pb-24">
            {/* Organize Mode Button */}
            <button 
                onClick={() => {
                    setOrganizeMode(!organizeMode);
                    setFirstSelectedCard(null);
                    setSelectedCardId(null);
                }}
                className={`
                    fixed top-20 right-4 z-20 px-4 py-2 rounded-full shadow-lg
                    transition-all duration-200
                    ${organizeMode 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-white text-gray-800 hover:bg-gray-100'
                    }
                `}
            >
                {organizeMode ? '✓ Done' : '⚙️ Organize'}
            </button>

            {/* Mode Indicator */}
            {organizeMode && (
                <div className="fixed top-32 left-0 right-0 text-center z-10">
                    <span className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm shadow-lg inline-block">
                        Tap two cards to swap positions
                    </span>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                {/* Header - COMPACT */}
                <div className="bg-green-900/80 text-white p-2 shadow-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-lg font-bold">Indian Rummy</h1>
                            <p className="text-xs opacity-90">Game ID: {gameId}</p>
                        </div>
                        {gameState.wildJokerRank && (
                            <div className="text-center bg-yellow-500 text-black px-2 py-1 rounded-lg">
                                <div className="text-xs font-semibold">Wild Joker</div>
                                <div className="text-base font-bold">{gameState.wildJokerRank}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Player List - COMPACT */}
                <div className="py-1">
                    <PlayerList players={gameState.players} currentTurn={gameState.currentTurn} />
                </div>

                {/* Turn Indicator - COMPACT */}
                <div className="px-2 py-2">
                    {isMyTurn ? (
                        <div className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-center text-sm font-bold">
                            🎮 Your Turn
                        </div>
                    ) : (
                        <div className="bg-gray-700 text-white px-3 py-1.5 rounded-lg text-center text-sm">
                            ⏳ Waiting for other player...
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mx-2 mb-2 bg-red-500 text-white px-3 py-2 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Game Area: Closed and Open Piles - SMALLER */}
                <div className="flex justify-center gap-3 py-2">
                    {/* Closed Pile - SMALLER */}
                    <div className="text-center">
                        <div className="text-white text-xs font-semibold mb-1">Closed Pile</div>
                        <div className="relative scale-75 sm:scale-90 md:scale-100">
                            <CardBack />
                            <div className="absolute -top-1 -left-1 opacity-50">
                                <CardBack />
                            </div>
                            <div className="absolute -top-2 -left-2 opacity-30">
                                <CardBack />
                            </div>
                        </div>
                        <div className="text-white text-xs mt-1">
                            {gameState.closedPile.length} cards
                        </div>
                    </div>

                    {/* Open Pile - Drop Zone for Discard - SMALLER */}
                    <div className="text-center">
                        <div className="text-white text-xs font-semibold mb-1">Open Pile</div>
                        <div
                            className={`
                                relative transition-all duration-200 scale-75 sm:scale-90 md:scale-100
                                ${isDragOverDiscard ? 'scale-90 sm:scale-100 md:scale-110 ring-4 ring-yellow-400' : ''}
                            `}
                            onDragOver={handleDiscardDragOver}
                            onDragLeave={handleDiscardDragLeave}
                            onDrop={handleDiscardDrop}
                        >
                            {topOpenCard ? (
                                <Card {...topOpenCard} size="small" />
                            ) : (
                                <div className="card-small bg-gray-700 border-gray-600 flex items-center justify-center">
                                    <div className="text-white text-xs">Empty</div>
                                </div>
                            )}
                            {isDragOverDiscard && (
                                <div className="absolute inset-0 bg-yellow-400/30 rounded-lg flex items-center justify-center">
                                    <div className="text-white font-bold text-sm">Drop Here</div>
                                </div>
                            )}
                        </div>
                        <div className="text-white text-xs mt-1">
                            {gameState.openPile.length} cards
                        </div>
                    </div>
                </div>

                {/* Player Info - COMPACT */}
                <div className="px-2 pb-2">
                    <div className="bg-white/90 rounded-lg p-2 shadow">
                        <div className="text-xs text-gray-600">Your Hand ({playerHand.length} cards)</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                            {hasDrawn ? '✓ Drawn - Select a card to discard' : 'Draw a card to continue'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hand Bar - Fixed at bottom above action bar */}
            <HandBar
                hand={displayHand}
                selectedCardId={organizeMode ? firstSelectedCard : selectedCardId}
                onCardSelect={handleCardSelect}
                onReorder={handleHandReorder}
            />

            {/* Action Bar - Fixed at bottom */}
            <ActionBar
                isMyTurn={isMyTurn}
                hasDrawn={hasDrawn}
                hasSelectedCard={!!selectedCardId}
                onDrawClosed={handleDrawClosed}
                onDrawOpen={handleDrawOpen}
                onDiscard={handleDiscard}
                onDeclare={handleDeclare}
            />

            {/* Declare Modal */}
            {showDeclareModal && (
                <DeclareModal
                    hand={displayHand}
                    onDeclare={handleDeclareSubmit}
                    onClose={() => setShowDeclareModal(false)}
                />
            )}

            {/* Score Modal */}
            {showScoreModal && gameState?.scores && (
                <ScoreModal
                    scores={gameState.scores}
                    gameId={gameId}
                    lobbyId={gameState.lobbyId}
                    isHost={!!player.isHost}
                    onBackToLobby={handleBackToLobby}
                />
            )}
        </div>
    );
}
