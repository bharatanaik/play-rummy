// Suit and Rank types
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
    id: string;
    suit: Suit | 'joker'; // 'joker' for printed jokers
    rank: Rank | 'JOKER'; // 'JOKER' for printed jokers
    isPrintedJoker: boolean;
    isWildJoker: boolean;
}

export interface Player {
    uid: string | null;
    name: string | null;
    email: string | null;
    photoURL: string | null;
    isHost: boolean;
    hand?: Card[];
    score?: number;
    hasDrawn?: boolean;
    hasDeclared?: boolean;
}

// Meld type for card groupings
export type MeldType = 'sequence' | 'pure-sequence' | 'set';

export interface Meld {
    type: MeldType;
    cards: Card[];
}

// Game State interface
export interface GameState {
    gameId: string;
    lobbyId: string;
    status: 'in-progress' | 'completed' | 'cancelled';
    currentTurn: string; // player uid
    turnOrder: string[]; // array of player uids
    wildJokerRank: Rank | null;
    closedPile: Card[];
    openPile: Card[];
    players: Record<string, Player>;
    createdAt: number;
    winner?: string | null;
}
