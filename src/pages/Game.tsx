import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { gameService } from "../services/game.service";
import type { GameState } from "../model";
import Card from "../components/Card";
import HandBar from "../components/HandBar";
import ActionBar from "../components/ActionBar";
import PlayerList from "../components/PlayerList";

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

    // Guard: must be authenticated and have a gameId
    useEffect(() => {
        if (!player || !gameId) {
            navigate("/", { replace: true });
        }
    }, [player, gameId, navigate]);

    // Subscribe to game state updates
    useEffect(() => {
        if (!gameId) return;

        const unsubscribe = gameService.subscribeToGame(gameId, (state) => {
            setGameState(state);
            
            // Clear error when game state updates successfully
            setError(null);
        });

        return () => unsubscribe();
    }, [gameId]);

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

        // For now, just show an alert - full implementation would have a modal
        setError('Declaration modal not yet implemented. Please organize your cards and use the Declare button when you have a valid hand.');
        
        // Example: In a full implementation, you would:
        // 1. Show a modal/dialog
        // 2. Let user organize cards into melds (sequences/sets)
        // 3. Call gameService.declare(gameId, player.uid, melds)
    };

    // Handle card selection
    const handleCardSelect = (cardId: string) => {
        setSelectedCardId(cardId === selectedCardId ? null : cardId);
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
        
        // Only allow discarding from hand
        if (source === 'hand' && cardId && gameId && player?.uid) {
            try {
                setError(null);
                await gameService.discard(gameId, player.uid, cardId);
                setSelectedCardId(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to discard card');
                console.error(err);
            }
        }
    };

    // Handle hand reordering (local only - not synced to server)
    const handleHandReorder = (reorderedHand: typeof playerHand) => {
        // This is a local UI change only
        // You could save the order to localStorage if needed
        console.log('Hand reordered:', reorderedHand);
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
    const topOpenCard = gameState.openPile[gameState.openPile.length - 1];

    return (
        <div className="game-table pb-32">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-green-900/80 text-white p-4 shadow-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-xl font-bold">Indian Rummy</h1>
                            <p className="text-sm opacity-90">Game ID: {gameId}</p>
                        </div>
                        {gameState.wildJokerRank && (
                            <div className="text-center bg-yellow-500 text-black px-3 py-1 rounded-lg">
                                <div className="text-xs font-semibold">Wild Joker</div>
                                <div className="text-lg font-bold">{gameState.wildJokerRank}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Player List */}
                <PlayerList players={gameState.players} currentTurn={gameState.currentTurn} />

                {/* Turn Indicator */}
                <div className="p-4">
                    {isMyTurn ? (
                        <div className="bg-green-500 text-white px-4 py-2 rounded-lg text-center font-bold">
                            🎮 Your Turn
                        </div>
                    ) : (
                        <div className="bg-gray-700 text-white px-4 py-2 rounded-lg text-center">
                            ⏳ Waiting for other player...
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mx-4 mb-4 bg-red-500 text-white px-4 py-2 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Game Area: Closed and Open Piles */}
                <div className="flex justify-center gap-8 p-8">
                    {/* Closed Pile */}
                    <div className="text-center">
                        <div className="text-white font-semibold mb-2">Closed Pile</div>
                        <div className="relative">
                            <CardBack />
                            <div className="absolute -top-1 -left-1 opacity-50">
                                <CardBack />
                            </div>
                            <div className="absolute -top-2 -left-2 opacity-30">
                                <CardBack />
                            </div>
                        </div>
                        <div className="text-white text-sm mt-2">
                            {gameState.closedPile.length} cards
                        </div>
                    </div>

                    {/* Open Pile - Drop Zone for Discard */}
                    <div className="text-center">
                        <div className="text-white font-semibold mb-2">Open Pile (Discard Here)</div>
                        <div
                            className={`
                                relative transition-all duration-200
                                ${isDragOverDiscard ? 'scale-110 ring-4 ring-yellow-400' : ''}
                            `}
                            onDragOver={handleDiscardDragOver}
                            onDragLeave={handleDiscardDragLeave}
                            onDrop={handleDiscardDrop}
                        >
                            {topOpenCard ? (
                                <Card {...topOpenCard} size="small" />
                            ) : (
                                <div className="card-small bg-gray-700 border-gray-600 flex items-center justify-center">
                                    <div className="text-white text-sm">Empty</div>
                                </div>
                            )}
                            {isDragOverDiscard && (
                                <div className="absolute inset-0 bg-yellow-400/30 rounded-lg flex items-center justify-center">
                                    <div className="text-white font-bold text-lg">Drop to Discard</div>
                                </div>
                            )}
                        </div>
                        <div className="text-white text-sm mt-2">
                            {gameState.openPile.length} cards
                        </div>
                    </div>
                </div>

                {/* Player Info */}
                <div className="px-4 pb-4">
                    <div className="bg-white/90 rounded-lg p-3 shadow">
                        <div className="text-sm text-gray-600">Your Hand ({playerHand.length} cards)</div>
                        <div className="text-xs text-gray-500 mt-1">
                            {hasDrawn ? '✓ Drawn - Select a card to discard' : 'Draw a card to continue'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hand Bar - Fixed at bottom above action bar */}
            <HandBar
                hand={playerHand}
                selectedCardId={selectedCardId}
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
        </div>
    );
}
