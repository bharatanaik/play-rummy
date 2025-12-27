export interface Card {
    id: string;
    suit: string;
    rank: string;
}


export interface Player {
    uid: string | null;
    name: string | null;
    email: string | null;
    photoURL: string | null;
    isHost: boolean;
}
