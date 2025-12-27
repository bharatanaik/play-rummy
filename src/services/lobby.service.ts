import {
    ref,
    set,
    update,
    remove,
    get,
    type DatabaseReference
} from "firebase/database";
import { db } from "../firebase/config";
import type { Player } from "../model";

class LobbyService {

    // Create a new lobby
    async createLobby(host: Player): Promise<string> {
        if (!host?.uid) {
            throw new Error("Host must have uid");
        }

        const lobbyId = this.generateLobbyId();
        host.isHost = true;
        const lobbyData = {
            status: "waiting",
            hostUid: host.uid,
            currentGameId: null,
            gameCount: 0,
            players: {
                [host.uid]: {
                    ...host,
                    isHost: true
                }
            }
        };

        await set(this.getLobbyRef(lobbyId), lobbyData);

        return lobbyId;
    }

    // Join existing lobby
    async joinLobby(lobbyId: string, player: Player): Promise<void> {
        if (!this.isLobbyIdValid(lobbyId)) {
            throw new Error(`Invalid lobby ID: ${lobbyId}`);
        }
        if (!player?.uid) {
            throw new Error("Player uid required");
        }

        const lobbySnap = await get(this.getLobbyRef(lobbyId));
        if (!lobbySnap.exists()) {
            throw new Error("Lobby does not exist");
        }

        await set(this.getPlayerRef(lobbyId, player.uid), {
            ...player,
            isHost: false
        });
    }

    // Leave lobby
    async leaveLobby(lobbyId: string, playerUid: string): Promise<void> {
        if (!this.isLobbyIdValid(lobbyId)) {
            throw new Error("Invalid lobby ID");
        }
        if (!playerUid) return;

        await remove(this.getPlayerRef(lobbyId, playerUid));
    }

    // Start a new game (host only)
    async startNewGame(lobbyId: string, hostUid: string): Promise<string> {
        if (!this.isLobbyIdValid(lobbyId)) {
            throw new Error("Invalid lobby ID");
        }

        const lobbyRef = this.getLobbyRef(lobbyId);
        const lobbySnap = await get(lobbyRef);

        if (!lobbySnap.exists()) {
            throw new Error("Lobby does not exist");
        }

        const lobby = lobbySnap.val();
        if (lobby.hostUid !== hostUid) {
            throw new Error("Only host can start a game");
        }

        const gameId = this.generateGameId();

        await update(lobbyRef, {
            status: "in-game",
            currentGameId: gameId,
            gameCount: (lobby.gameCount || 0) + 1
        });

        await set(ref(db, `games/${gameId}`), {
            lobbyId,
            gameNumber: (lobby.gameCount || 0) + 1,
            status: "in-progress",
            createdAt: Date.now()
        });

        return gameId;
    }

    // End current game
    async endCurrentGame(lobbyId: string): Promise<void> {
        await update(this.getLobbyRef(lobbyId), {
            status: "waiting",
            currentGameId: null
        });
    }

    // Helpers
    isLobbyIdValid(lobbyId: string): boolean {
        return /^[A-Z0-9]{4}$/.test(lobbyId);
    }

    generateLobbyId(): string {
        return Math.random()
            .toString(36)
            .substring(2, 6)
            .toUpperCase();
    }

    getLobbyRef(lobbyId: string): DatabaseReference {
        return ref(db, `lobbies/${lobbyId}`);
    }

    getPlayersRef(lobbyId: string): DatabaseReference {
        return ref(db, `lobbies/${lobbyId}/players`);
    }

    getPlayerRef(lobbyId: string, playerId: string): DatabaseReference {
        return ref(db, `lobbies/${lobbyId}/players/${playerId}`);
    }

    isPlayerNameValid(playerName: string): boolean {
        return playerName.trim().length >= 3;
    }

    generateGameId(): string {
        return Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();
    }

}

export const lobbyService = new LobbyService();
