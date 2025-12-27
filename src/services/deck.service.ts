import type { Card, Rank, Suit } from '../model';

class DeckService {
    private suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    private ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    private globalCardId = 0; // Global counter for unique card IDs

    /**
     * Create a standard 52-card deck
     */
    private createSingleDeck(deckNumber: number, timestamp: number): Card[] {
        const deck: Card[] = [];

        for (const suit of this.suits) {
            for (const rank of this.ranks) {
                // Generate truly unique ID using timestamp, deck number, and global counter
                const id = `card-${timestamp}-${deckNumber}-${this.globalCardId++}`;
                deck.push({
                    id,
                    suit,
                    rank,
                    isPrintedJoker: false,
                    isWildJoker: false,
                });
            }
        }

        return deck;
    }

    /**
     * Create a single printed joker card
     */
    private createPrintedJoker(timestamp: number): Card {
        const id = `card-${timestamp}-joker-${this.globalCardId++}`;
        return {
            id,
            suit: 'joker',
            rank: 'JOKER',
            isPrintedJoker: true,
            isWildJoker: false,
        };
    }

    /**
     * Create 2 standard decks (104 cards) + 2 printed jokers (106 total)
     */
    createDeck(): Card[] {
        const deck: Card[] = [];
        const timestamp = Date.now(); // Single timestamp for entire deck creation

        console.log('[DECK] Creating new deck...');
        
        // Add two standard decks with unique IDs
        deck.push(...this.createSingleDeck(1, timestamp));
        deck.push(...this.createSingleDeck(2, timestamp));

        // Add 2 printed jokers
        deck.push(this.createPrintedJoker(timestamp));
        deck.push(this.createPrintedJoker(timestamp));

        console.log('[DECK] Created deck with', deck.length, 'cards');

        // Validation: Check for duplicate IDs
        const ids = deck.map(c => c.id);
        const uniqueIds = new Set(ids);
        if (ids.length !== uniqueIds.size) {
            console.error('[DECK] ERROR: Duplicate card IDs detected!');
            throw new Error('Duplicate card IDs detected in deck creation');
        }

        // Validation: Verify card count
        if (deck.length !== 106) {
            console.error('[DECK] ERROR: Expected 106 cards, got', deck.length);
            throw new Error(`Invalid deck size: ${deck.length} (expected 106)`);
        }

        console.log('[DECK] Validation passed: All card IDs are unique');

        return deck;
    }

    /**
     * Shuffle array using Fisher-Yates algorithm
     */
    shuffle<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Select a random wild joker rank (excluding printed jokers)
     */
    selectWildJoker(): Rank {
        const randomIndex = Math.floor(Math.random() * this.ranks.length);
        return this.ranks[randomIndex];
    }

    /**
     * Mark wild jokers in the deck based on selected rank
     */
    markWildJokers(deck: Card[], wildJokerRank: Rank): Card[] {
        return deck.map(card => ({
            ...card,
            isWildJoker: !card.isPrintedJoker && card.rank === wildJokerRank,
        }));
    }

    /**
     * Deal cards to players
     * Returns: { hands, closedPile, openPile }
     */
    dealCards(
        deck: Card[],
        playerCount: number,
        cardsPerPlayer: number = 13
    ): {
        hands: Card[][];
        closedPile: Card[];
        openPile: Card[];
    } {
        const shuffledDeck = this.shuffle(deck);
        const hands: Card[][] = [];

        let currentIndex = 0;

        // Deal cards to each player
        for (let i = 0; i < playerCount; i++) {
            hands.push(shuffledDeck.slice(currentIndex, currentIndex + cardsPerPlayer));
            currentIndex += cardsPerPlayer;
        }

        // Remaining cards form the closed pile
        const remainingCards = shuffledDeck.slice(currentIndex);

        // First card of remaining goes to open pile
        const openPile = remainingCards.length > 0 ? [remainingCards[0]] : [];
        const closedPile = remainingCards.slice(1);

        return { hands, closedPile, openPile };
    }

    /**
     * Sort cards in a hand by suit and rank for better display
     */
    sortHand(hand: Card[]): Card[] {
        const suitOrder: Record<string, number> = {
            'hearts': 0,
            'diamonds': 1,
            'clubs': 2,
            'spades': 3,
            'joker': 4,
        };

        const rankOrder: Record<string, number> = {
            'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
            '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'JOKER': 14,
        };

        return [...hand].sort((a, b) => {
            const suitDiff = suitOrder[a.suit] - suitOrder[b.suit];
            if (suitDiff !== 0) return suitDiff;
            return rankOrder[a.rank] - rankOrder[b.rank];
        });
    }
}

export const deckService = new DeckService();
