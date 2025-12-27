import type { Card, Meld, Rank } from '../model';

class ValidationService {
    /**
     * Get the numeric value of a rank for sequence validation
     * Note: Ace is treated as low (value 1) for forming sequences
     */
    private getRankValue(rank: Rank): number {
        const rankValues: Record<Rank, number> = {
            'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
            '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13,
        };
        return rankValues[rank];
    }

    /**
     * Get point value of a card for deadwood calculation
     * Note: Ace is worth 10 points for scoring (Indian Rummy rule)
     */
    private getCardPoints(card: Card): number {
        if (card.isPrintedJoker || card.isWildJoker) return 0;
        
        const rank = card.rank as Rank;
        if (rank === 'J' || rank === 'Q' || rank === 'K') return 10;
        if (rank === 'A') return 10; // Ace is worth 10 points in Indian Rummy
        
        return this.getRankValue(rank);
    }

    /**
     * Check if a card is a joker (printed or wild)
     */
    private isJoker(card: Card): boolean {
        return card.isPrintedJoker || card.isWildJoker;
    }

    /**
     * Validate a sequence: 3+ consecutive cards of same suit
     * Jokers can substitute for any card
     */
    validateSequence(cards: Card[]): boolean {
        if (cards.length < 3) return false;

        // Find the suit (from non-joker cards)
        const nonJokerCards = cards.filter(c => !this.isJoker(c));
        if (nonJokerCards.length === 0) return false; // All jokers is not valid

        const suit = nonJokerCards[0].suit;
        
        // All non-joker cards must be same suit
        if (!nonJokerCards.every(c => c.suit === suit)) return false;

        // Get rank values for non-joker cards
        const rankValues = nonJokerCards.map(c => this.getRankValue(c.rank as Rank));
        rankValues.sort((a, b) => a - b);

        // Check if we can form a consecutive sequence with jokers filling gaps
        let jokerCount = cards.length - nonJokerCards.length;
        
        for (let i = 1; i < rankValues.length; i++) {
            const gap = rankValues[i] - rankValues[i - 1] - 1;
            if (gap < 0) return false; // Duplicate ranks
            jokerCount -= gap;
            if (jokerCount < 0) return false; // Not enough jokers to fill gaps
        }

        // Check if sequence length with jokers is valid
        const minRank = rankValues[0];
        const maxRank = rankValues[rankValues.length - 1];
        const totalLength = maxRank - minRank + 1;

        return totalLength === cards.length && totalLength >= 3 && totalLength <= 13;
    }

    /**
     * Validate a pure sequence: 3+ consecutive cards of same suit, NO jokers
     */
    validatePureSequence(cards: Card[]): boolean {
        if (cards.length < 3) return false;

        // No jokers allowed in pure sequence
        if (cards.some(c => this.isJoker(c))) return false;

        return this.validateSequence(cards);
    }

    /**
     * Validate a set: 3-4 cards of same rank, different suits
     * Jokers can substitute for any card
     */
    validateSet(cards: Card[]): boolean {
        if (cards.length < 3 || cards.length > 4) return false;

        const nonJokerCards = cards.filter(c => !this.isJoker(c));
        if (nonJokerCards.length === 0) return false; // All jokers is not valid

        const rank = nonJokerCards[0].rank;
        
        // All non-joker cards must have same rank
        if (!nonJokerCards.every(c => c.rank === rank)) return false;

        // All non-joker cards must have different suits
        const suits = nonJokerCards.map(c => c.suit);
        const uniqueSuits = new Set(suits);
        if (suits.length !== uniqueSuits.size) return false; // Duplicate suits

        return true;
    }

    /**
     * Validate a complete declaration
     * Must have:
     * - At least 2 sequences
     * - At least 1 pure sequence
     * - All 13 cards grouped into valid sets/sequences
     */
    validateDeclaration(melds: Meld[]): { valid: boolean; reason?: string } {
        // Count total cards
        const totalCards = melds.reduce((sum, meld) => sum + meld.cards.length, 0);
        if (totalCards !== 13) {
            return { valid: false, reason: 'Must use all 13 cards' };
        }

        // Validate each meld
        for (const meld of melds) {
            let isValid = false;
            
            if (meld.type === 'pure-sequence') {
                isValid = this.validatePureSequence(meld.cards);
            } else if (meld.type === 'sequence') {
                isValid = this.validateSequence(meld.cards);
            } else if (meld.type === 'set') {
                isValid = this.validateSet(meld.cards);
            }

            if (!isValid) {
                return { valid: false, reason: `Invalid ${meld.type}` };
            }
        }

        // Count sequences and pure sequences
        const sequences = melds.filter(m => m.type === 'sequence' || m.type === 'pure-sequence');
        const pureSequences = melds.filter(m => m.type === 'pure-sequence');

        if (sequences.length < 2) {
            return { valid: false, reason: 'Need at least 2 sequences' };
        }

        if (pureSequences.length < 1) {
            return { valid: false, reason: 'Need at least 1 pure sequence' };
        }

        return { valid: true };
    }

    /**
     * Calculate deadwood points (ungrouped cards)
     */
    calculateDeadwood(cards: Card[]): number {
        return cards.reduce((sum, card) => sum + this.getCardPoints(card), 0);
    }

    /**
     * Calculate points for a meld (for scoring)
     */
    calculateMeldPoints(cards: Card[]): number {
        return cards.reduce((sum, card) => sum + this.getCardPoints(card), 0);
    }
}

export const validationService = new ValidationService();
