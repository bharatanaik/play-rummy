import { ref, set, update, onValue, off, get, type DatabaseReference } from 'firebase/database';
import { db } from '../firebase/config';
import type { GameState, Player, Meld } from '../model';
import { deckService } from './deck.service';
import { validationService } from './validation.service';

class GameService {
    /**
     * Initialize a new game with dealt cards and game state
     */
    async initializeGame(gameId: string, lobbyId: string, players: Player[]): Promise<void> {
        if (players.length < 2) {
            throw new Error('Need at least 2 players to start a game');
        }

        // Create and shuffle deck
        const deck = deckService.createDeck();
        
        // Select wild joker
        const wildJokerRank = deckService.selectWildJoker();
        
        // Mark wild jokers in deck
        const markedDeck = deckService.markWildJokers(deck, wildJokerRank);
        
        // Deal cards
        const { hands, closedPile, openPile } = deckService.dealCards(markedDeck, players.length, 13);
        
        // Create turn order (randomize players)
        const turnOrder = deckService.shuffle(players.map(p => p.uid!));
        
        // Build player objects with hands
        const playersWithHands: Record<string, Player> = {};
        players.forEach((player, index) => {
            if (player.uid) {
                playersWithHands[player.uid] = {
                    ...player,
                    hand: deckService.sortHand(hands[index]),
                    score: 0,
                    hasDrawn: false,
                    hasDeclared: false,
                };
            }
        });

        // Create initial game state
        const gameState: GameState = {
            gameId,
            lobbyId,
            status: 'in-progress',
            currentTurn: turnOrder[0],
            turnOrder,
            wildJokerRank,
            closedPile,
            openPile,
            players: playersWithHands,
            createdAt: Date.now(),
            winner: null,
        };

        // Save to Firebase
        await set(ref(db, `games/${gameId}`), gameState);
    }

    /**
     * Draw a card from the closed pile
     */
    async drawFromClosed(gameId: string, playerId: string): Promise<void> {
        const gameRef = ref(db, `games/${gameId}`);
        const snapshot = await get(gameRef);
        
        if (!snapshot.exists()) {
            throw new Error('Game not found');
        }

        const gameState: GameState = snapshot.val();

        // Validate turn
        if (gameState.currentTurn !== playerId) {
            throw new Error('Not your turn');
        }

        // Validate player hasn't already drawn
        if (gameState.players[playerId]?.hasDrawn) {
            throw new Error('Already drawn this turn');
        }

        // Validate closed pile has cards
        if (gameState.closedPile.length === 0) {
            throw new Error('Closed pile is empty');
        }

        // Draw top card from closed pile
        const drawnCard = gameState.closedPile[0];
        const newClosedPile = gameState.closedPile.slice(1);
        
        // Add to player's hand
        const playerHand = [...(gameState.players[playerId].hand || []), drawnCard];
        
        // Update game state
        await update(gameRef, {
            closedPile: newClosedPile,
            [`players/${playerId}/hand`]: deckService.sortHand(playerHand),
            [`players/${playerId}/hasDrawn`]: true,
        });
    }

    /**
     * Draw the top card from the open pile
     */
    async drawFromOpen(gameId: string, playerId: string): Promise<void> {
        const gameRef = ref(db, `games/${gameId}`);
        const snapshot = await get(gameRef);
        
        if (!snapshot.exists()) {
            throw new Error('Game not found');
        }

        const gameState: GameState = snapshot.val();

        // Validate turn
        if (gameState.currentTurn !== playerId) {
            throw new Error('Not your turn');
        }

        // Validate player hasn't already drawn
        if (gameState.players[playerId]?.hasDrawn) {
            throw new Error('Already drawn this turn');
        }

        // Validate open pile has cards
        if (gameState.openPile.length === 0) {
            throw new Error('Open pile is empty');
        }

        // Draw top card from open pile
        const drawnCard = gameState.openPile[gameState.openPile.length - 1];
        const newOpenPile = gameState.openPile.slice(0, -1);
        
        // Add to player's hand
        const playerHand = [...(gameState.players[playerId].hand || []), drawnCard];
        
        // Update game state
        await update(gameRef, {
            openPile: newOpenPile,
            [`players/${playerId}/hand`]: deckService.sortHand(playerHand),
            [`players/${playerId}/hasDrawn`]: true,
        });
    }

    /**
     * Discard a card and pass turn to next player
     */
    async discard(gameId: string, playerId: string, cardId: string): Promise<void> {
        const gameRef = ref(db, `games/${gameId}`);
        const snapshot = await get(gameRef);
        
        if (!snapshot.exists()) {
            throw new Error('Game not found');
        }

        const gameState: GameState = snapshot.val();

        // Validate turn
        if (gameState.currentTurn !== playerId) {
            throw new Error('Not your turn');
        }

        // Validate player has drawn
        if (!gameState.players[playerId]?.hasDrawn) {
            throw new Error('Must draw a card first');
        }

        // Find and remove card from player's hand
        const playerHand = gameState.players[playerId].hand || [];
        const cardIndex = playerHand.findIndex(c => c.id === cardId);
        
        if (cardIndex === -1) {
            throw new Error('Card not in hand');
        }

        const discardedCard = playerHand[cardIndex];
        const newHand = playerHand.filter(c => c.id !== cardId);
        
        // Add to open pile
        const newOpenPile = [...gameState.openPile, discardedCard];
        
        // Get next player
        const currentTurnIndex = gameState.turnOrder.indexOf(playerId);
        const nextTurnIndex = (currentTurnIndex + 1) % gameState.turnOrder.length;
        const nextPlayerId = gameState.turnOrder[nextTurnIndex];
        
        // Update game state
        await update(gameRef, {
            openPile: newOpenPile,
            [`players/${playerId}/hand`]: deckService.sortHand(newHand),
            [`players/${playerId}/hasDrawn`]: false,
            currentTurn: nextPlayerId,
        });
    }

    /**
     * Submit a declaration for validation
     */
    async declare(gameId: string, playerId: string, melds: Meld[]): Promise<void> {
        const gameRef = ref(db, `games/${gameId}`);
        const snapshot = await get(gameRef);
        
        if (!snapshot.exists()) {
            throw new Error('Game not found');
        }

        const gameState: GameState = snapshot.val();

        // Validate turn
        if (gameState.currentTurn !== playerId) {
            throw new Error('Not your turn');
        }

        // Validate declaration
        const validation = validationService.validateDeclaration(melds);
        
        if (!validation.valid) {
            throw new Error(validation.reason || 'Invalid declaration');
        }

        // Mark player as declared and update game status
        await update(gameRef, {
            status: 'completed',
            winner: playerId,
            [`players/${playerId}/hasDeclared`]: true,
        });
    }

    /**
     * Subscribe to real-time game state updates
     */
    subscribeToGame(
        gameId: string,
        callback: (gameState: GameState | null) => void
    ): () => void {
        const gameRef: DatabaseReference = ref(db, `games/${gameId}`);
        
        const listener = onValue(gameRef, (snapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.val() as GameState);
            } else {
                callback(null);
            }
        });

        // Return unsubscribe function
        return () => off(gameRef, 'value', listener);
    }

    /**
     * Get game reference
     */
    getGameRef(gameId: string): DatabaseReference {
        return ref(db, `games/${gameId}`);
    }
}

export const gameService = new GameService();
