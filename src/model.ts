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
    hasDropped?: boolean;
    melds?: Meld[];
}

// Meld type for card groupings
export type MeldType = 'sequence' | 'pure-sequence' | 'set';

export interface Meld {
    type: MeldType;
    cards: Card[];
}

// Lobby Score Tracking
export interface LobbyScore {
    [playerUid: string]: {
        totalScore: number;
        gamesPlayed: number;
        gamesWon: number;
        bestHand: number; // lowest score in a single game
    };
}

// Game Score (per player, per game)
export interface GameScore {
    playerUid: string;
    playerName: string;
    score: number;
    melds: Meld[];
    isWinner: boolean;
    declarationType: 'valid' | 'invalid' | 'first-drop' | 'middle-drop' | null;
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
    scores?: GameScore[]; // final scores after game completion
}

// Lobby interface
export interface Lobby {
    lobbyId: string;
    hostUid: string;
    status: 'waiting' | 'in-game' | 'finished';
    currentGameId: string | null;
    gameCount: number;
    players: Record<string, Player>;
    scores?: LobbyScore;
}
