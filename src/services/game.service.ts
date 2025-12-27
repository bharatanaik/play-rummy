import { ref, set, update, onValue, off, get, runTransaction, type DatabaseReference } from 'firebase/database';
import { db } from '../firebase/config';
import type { GameState, Player, Meld, GameScore } from '../model';
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

        console.log('[GAME] Initializing game:', gameId, 'with', players.length, 'players');

        // Create and shuffle deck
        const deck = deckService.createDeck();
        console.log('[GAME] Created deck with', deck.length, 'cards');
        
        // Select wild joker
        const wildJokerRank = deckService.selectWildJoker();
        console.log('[GAME] Wild joker rank:', wildJokerRank);
        
        // Mark wild jokers in deck
        const markedDeck = deckService.markWildJokers(deck, wildJokerRank);
        
        // Deal cards
        const { hands, closedPile, openPile } = deckService.dealCards(markedDeck, players.length, 13);
        
        console.log('[GAME] Dealt cards - Hands:', hands.length, 'players');
        console.log('[GAME] Cards per hand:', hands.map(h => h.length));
        console.log('[GAME] Closed pile:', closedPile.length, 'cards');
        console.log('[GAME] Open pile:', openPile.length, 'cards');

        // Validation: Total card count
        const totalCards = hands.flat().length + closedPile.length + openPile.length;
        console.log('[GAME] Total cards after deal:', totalCards, 'Expected: 106');
        
        if (totalCards !== 106) {
            console.error('[GAME] ERROR: Card count mismatch:', totalCards);
            throw new Error(`Card count mismatch: ${totalCards} (expected 106)`);
        }

        // Validation: Check for duplicates across all cards
        const allCards = [...hands.flat(), ...closedPile, ...openPile];
        const allIds = allCards.map(c => c.id);
        const uniqueIds = new Set(allIds);
        if (allIds.length !== uniqueIds.size) {
            console.error('[GAME] ERROR: Duplicate cards detected after deal');
            const duplicates = allIds.filter((id, index) => allIds.indexOf(id) !== index);
            console.error('[GAME] Duplicate IDs:', [...new Set(duplicates)]);
            throw new Error('Duplicate cards detected after deal');
        }
        
        console.log('[GAME] Validation passed: All cards unique, total count correct');
        
        // Create turn order (randomize players)
        const turnOrder = deckService.shuffle(players.map(p => p.uid!));
        console.log('[GAME] Turn order:', turnOrder);
        
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
        console.log('[GAME] Saving game state to Firebase');
        await set(ref(db, `games/${gameId}`), gameState);
        console.log('[GAME] Game initialized successfully');
    }

    /**
     * Draw a card from the closed pile
     */
    async drawFromClosed(gameId: string, playerId: string): Promise<void> {
        const gameRef = ref(db, `games/${gameId}`);
        
        console.log('[DRAW] Player', playerId, 'attempting to draw from closed pile');

        await runTransaction(gameRef, (currentGame) => {
            if (!currentGame) {
                console.error('[DRAW] ERROR: Game not found');
                throw new Error('Game not found');
            }

            const gameState: GameState = currentGame;

            // Validate turn
            if (gameState.currentTurn !== playerId) {
                console.error('[DRAW] ERROR: Not player\'s turn. Current:', gameState.currentTurn, 'Attempting:', playerId);
                throw new Error('Not your turn');
            }

            // Validate player hasn't already drawn
            if (gameState.players[playerId]?.hasDrawn) {
                console.error('[DRAW] ERROR: Player has already drawn this turn');
                throw new Error('Already drawn this turn');
            }

            // Validate closed pile has cards
            if (!gameState.closedPile || gameState.closedPile.length === 0) {
                console.error('[DRAW] ERROR: Closed pile is empty');
                throw new Error('Closed pile is empty');
            }

            console.log('[DRAW] Closed pile before:', gameState.closedPile.length, 'cards');

            // Draw last card from closed pile (top of deck)
            const drawnCard = gameState.closedPile.at(-1)!; // Safe: length already validated
            const newClosedPile = gameState.closedPile.slice(0, -1);
            
            console.log('[DRAW] Drew card:', drawnCard.id, drawnCard.rank, 'of', drawnCard.suit);
            
            // Add to player's hand
            const playerHand = [...(gameState.players[playerId].hand || []), drawnCard];
            
            console.log('[DRAW] Hand size before:', gameState.players[playerId].hand?.length || 0, 'after:', playerHand.length);

            // Validate hand size after draw
            if (playerHand.length !== 14) {
                console.error('[DRAW] ERROR: Invalid hand size after draw:', playerHand.length, 'expected 14');
                throw new Error(`Invalid hand size after draw: ${playerHand.length} (expected 14)`);
            }
            
            // Update game state atomically
            gameState.closedPile = newClosedPile;
            gameState.players[playerId].hand = deckService.sortHand(playerHand);
            gameState.players[playerId].hasDrawn = true;

            console.log('[DRAW] Closed pile after:', newClosedPile.length, 'cards');
            console.log('[DRAW] Draw successful');

            return gameState;
        });
    }

    /**
     * Draw the top card from the open pile
     */
    async drawFromOpen(gameId: string, playerId: string): Promise<void> {
        const gameRef = ref(db, `games/${gameId}`);
        
        console.log('[DRAW] Player', playerId, 'attempting to draw from open pile');

        await runTransaction(gameRef, (currentGame) => {
            if (!currentGame) {
                console.error('[DRAW] ERROR: Game not found');
                throw new Error('Game not found');
            }

            const gameState: GameState = currentGame;

            // Validate turn
            if (gameState.currentTurn !== playerId) {
                console.error('[DRAW] ERROR: Not player\'s turn. Current:', gameState.currentTurn, 'Attempting:', playerId);
                throw new Error('Not your turn');
            }

            // Validate player hasn't already drawn
            if (gameState.players[playerId]?.hasDrawn) {
                console.error('[DRAW] ERROR: Player has already drawn this turn');
                throw new Error('Already drawn this turn');
            }

            // Validate open pile has cards
            if (!gameState.openPile || gameState.openPile.length === 0) {
                console.error('[DRAW] ERROR: Open pile is empty');
                throw new Error('Open pile is empty');
            }

            console.log('[DRAW] Open pile before:', gameState.openPile.length, 'cards');

            // Draw top card from open pile (last card in array)
            const drawnCard = gameState.openPile.at(-1)!; // Safe: length already validated
            const newOpenPile = gameState.openPile.slice(0, -1);
            
            console.log('[DRAW] Drew card:', drawnCard.id, drawnCard.rank, 'of', drawnCard.suit);
            
            // Add to player's hand
            const playerHand = [...(gameState.players[playerId].hand || []), drawnCard];
            
            console.log('[DRAW] Hand size before:', gameState.players[playerId].hand?.length || 0, 'after:', playerHand.length);

            // Validate hand size after draw
            if (playerHand.length !== 14) {
                console.error('[DRAW] ERROR: Invalid hand size after draw:', playerHand.length, 'expected 14');
                throw new Error(`Invalid hand size after draw: ${playerHand.length} (expected 14)`);
            }
            
            // Update game state atomically
            gameState.openPile = newOpenPile;
            gameState.players[playerId].hand = deckService.sortHand(playerHand);
            gameState.players[playerId].hasDrawn = true;

            console.log('[DRAW] Open pile after:', newOpenPile.length, 'cards');
            console.log('[DRAW] Draw successful');

            return gameState;
        });
    }

    /**
     * Discard a card and pass turn to next player
     */
    async discard(gameId: string, playerId: string, cardId: string): Promise<void> {
        const gameRef = ref(db, `games/${gameId}`);
        
        console.log('[DISCARD] Player', playerId, 'attempting to discard card:', cardId);

        await runTransaction(gameRef, (currentGame) => {
            if (!currentGame) {
                console.error('[DISCARD] ERROR: Game not found');
                throw new Error('Game not found');
            }

            const gameState: GameState = currentGame;

            // Validate turn
            if (gameState.currentTurn !== playerId) {
                console.error('[DISCARD] ERROR: Not player\'s turn. Current:', gameState.currentTurn, 'Attempting:', playerId);
                throw new Error('Not your turn');
            }

            // Validate player has drawn
            if (!gameState.players[playerId]?.hasDrawn) {
                console.error('[DISCARD] ERROR: Must draw a card first');
                throw new Error('Must draw a card first');
            }

            // Find and remove card from player's hand
            const playerHand = gameState.players[playerId].hand || [];
            const cardIndex = playerHand.findIndex(c => c.id === cardId);
            
            if (cardIndex === -1) {
                console.error('[DISCARD] ERROR: Card not in hand:', cardId);
                console.error('[DISCARD] Hand cards:', playerHand.map(c => c.id));
                throw new Error('Card not in hand');
            }

            const discardedCard = playerHand[cardIndex];
            console.log('[DISCARD] Discarding card:', discardedCard.id, discardedCard.rank, 'of', discardedCard.suit);
            console.log('[DISCARD] Hand size before:', playerHand.length);

            // Remove card from hand (immutably)
            const newHand = playerHand.filter(c => c.id !== cardId);
            
            console.log('[DISCARD] Hand size after:', newHand.length);

            // Validate hand size after discard
            if (newHand.length !== 13) {
                console.error('[DISCARD] ERROR: Invalid hand size after discard:', newHand.length, 'expected 13');
                throw new Error(`Invalid hand size after discard: ${newHand.length} (expected 13)`);
            }
            
            // Add to open pile
            const newOpenPile = [...gameState.openPile, discardedCard];
            
            // Get next player
            const currentTurnIndex = gameState.turnOrder.indexOf(playerId);
            const nextTurnIndex = (currentTurnIndex + 1) % gameState.turnOrder.length;
            const nextPlayerId = gameState.turnOrder[nextTurnIndex];
            
            console.log('[TURN] Turn advancing from', playerId, 'to', nextPlayerId);
            
            // Update game state atomically
            gameState.openPile = newOpenPile;
            gameState.players[playerId].hand = deckService.sortHand(newHand);
            gameState.players[playerId].hasDrawn = false;
            gameState.currentTurn = nextPlayerId;

            console.log('[DISCARD] Discard successful');

            return gameState;
        });
    }

    /**
     * Calculate score for a player
     * Winner gets 0, losers get points based on deadwood
     */
    private calculatePlayerScore(player: Player, isWinner: boolean, melds: Meld[]): number {
        if (isWinner) return 0;

        // Get all cards that are not in melds (deadwood)
        const cardsInMelds = new Set(melds.flatMap(m => m.cards.map(c => c.id)));
        const deadwoodCards = (player.hand || []).filter(card => !cardsInMelds.has(card.id));
        
        return validationService.calculateDeadwood(deadwoodCards);
    }

    /**
     * Calculate scores for all players and update game
     */
    private async calculateAndStoreScores(gameId: string, gameState: GameState, winnerId: string, winnerMelds: Meld[]): Promise<void> {
        const scores: GameScore[] = [];

        // Calculate score for each player
        Object.values(gameState.players).forEach((player) => {
            if (!player.uid) return;

            const isWinner = player.uid === winnerId;
            const melds = isWinner ? winnerMelds : (player.melds || []);
            const score = this.calculatePlayerScore(player, isWinner, melds);

            scores.push({
                playerUid: player.uid,
                playerName: player.name || 'Player',
                score,
                melds,
                isWinner,
                declarationType: isWinner ? 'valid' : null,
            });
        });

        // Update game with scores
        await update(ref(db, `games/${gameId}`), {
            scores,
        });
    }

    /**
     * Handle player drop (leaving the game mid-turn)
     */
    async drop(gameId: string, playerId: string): Promise<void> {
        const gameRef = ref(db, `games/${gameId}`);
        const snapshot = await get(gameRef);
        
        if (!snapshot.exists()) {
            throw new Error('Game not found');
        }

        const gameState: GameState = snapshot.val();
        const player = gameState.players[playerId];
        
        if (!player) {
            throw new Error('Player not in game');
        }

        // Determine drop type based on game progress
        const isFirstTurn = gameState.currentTurn === gameState.turnOrder[0];
        const dropType = isFirstTurn ? 'first-drop' : 'middle-drop';
        const dropPenalty = dropType === 'first-drop' ? 20 : 40;

        // Mark player as dropped
        await update(gameRef, {
            [`players/${playerId}/hasDropped`]: true,
            [`players/${playerId}/score`]: dropPenalty,
        });

        // Check if all other players have dropped - if so, declare remaining player as winner
        const activePlayers = Object.values(gameState.players).filter(
            p => p.uid !== playerId && !p.hasDropped && !p.hasDeclared
        );

        if (activePlayers.length === 1 && activePlayers[0].uid) {
            const winnerId = activePlayers[0].uid;
            
            // Calculate scores for all players
            const scores: GameScore[] = [];
            Object.values(gameState.players).forEach((p) => {
                if (!p.uid) return;

                scores.push({
                    playerUid: p.uid,
                    playerName: p.name || 'Player',
                    score: p.uid === winnerId ? 0 : (p.score || dropPenalty),
                    melds: [],
                    isWinner: p.uid === winnerId,
                    declarationType: p.uid === winnerId ? 'valid' : (p.hasDropped ? dropType : null),
                });
            });

            // Last player standing wins
            await update(gameRef, {
                status: 'completed',
                winner: winnerId,
                scores,
            });
        }
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
            // Invalid declaration - player gets 80 points penalty, calculate scores for all
            const scores: GameScore[] = [];
            
            Object.values(gameState.players).forEach((p) => {
                if (!p.uid) return;

                const isInvalidDeclarer = p.uid === playerId;
                const score = isInvalidDeclarer ? 80 : 0; // Invalid declarer gets 80, others get 0

                scores.push({
                    playerUid: p.uid,
                    playerName: p.name || 'Player',
                    score,
                    melds: isInvalidDeclarer ? melds : [],
                    isWinner: false, // No winner on invalid declaration
                    declarationType: isInvalidDeclarer ? 'invalid' : null,
                });
            });

            await update(gameRef, {
                status: 'completed',
                [`players/${playerId}/hasDeclared`]: true,
                [`players/${playerId}/score`]: 80,
                [`players/${playerId}/melds`]: melds,
                scores,
            });
            
            throw new Error(validation.reason || 'Invalid declaration');
        }

        // Valid declaration - calculate scores
        await update(gameRef, {
            status: 'completed',
            winner: playerId,
            [`players/${playerId}/hasDeclared`]: true,
            [`players/${playerId}/melds`]: melds,
        });

        // Calculate and store scores for all players
        await this.calculateAndStoreScores(gameId, gameState, playerId, melds);
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
