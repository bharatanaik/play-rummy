import {
    onChildAdded,
    onChildRemoved,
    onDisconnect,
    onValue
} from "firebase/database";
import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { lobbyService } from "../services/lobby.service";
import { useAuth } from "../context/AuthContext";
import type { Player } from "../model";

function Lobby() {
    const { player } = useAuth();
    const { lobbyId } = useParams();
    const navigate = useNavigate();

    const [players, setPlayers] = useState<Player[]>([]);

    /* ===============================
       Join + presence lifecycle
       =============================== */
    useEffect(() => {
        if (!lobbyId || !player?.uid) return;

        const playerRef = lobbyService.getPlayerRef(lobbyId, player.uid);

        const join = async () => {
            await lobbyService.joinLobby(lobbyId, player);

            // Server-side cleanup (tab close / crash)
            onDisconnect(playerRef).remove();
        };

        join().catch(console.error);

        // Client-side cleanup (route change)
        return () => {
            if(player.uid)
                lobbyService
                    .leaveLobby(lobbyId, player.uid)
                    .catch(console.error);
        };
    }, [lobbyId, player]);

    /* ===============================
       Listen for players joining
       =============================== */
    useEffect(() => {
        if (!lobbyId) return;

        const playersRef = lobbyService.getPlayersRef(lobbyId);

        const unsubscribeAdded = onChildAdded(playersRef, snapshot => {
            const newPlayer = snapshot.val();
            if (!newPlayer) return;

            setPlayers(prev =>
                prev.some(p => p.uid === newPlayer.uid)
                    ? prev
                    : [...prev, newPlayer]
            );
        });

        return () => unsubscribeAdded();
    }, [lobbyId]);

    /* ===============================
       Listen for players leaving
       =============================== */
    useEffect(() => {
        if (!lobbyId) return;

        const playersRef = lobbyService.getPlayersRef(lobbyId);

        const unsubscribeRemoved = onChildRemoved(playersRef, snapshot => {
            const removedPlayer = snapshot.val();
            if (!removedPlayer) return;

            setPlayers(prev =>
                prev.filter(p => p.uid !== removedPlayer.uid)
            );
        });

        return () => unsubscribeRemoved();
    }, [lobbyId]);

    /* ===============================
       Listen for game start → redirect
       =============================== */
    useEffect(() => {
        if (!lobbyId) return;

        const lobbyRef = lobbyService.getLobbyRef(lobbyId);

        const unsubscribe = onValue(lobbyRef, snapshot => {
            const lobby = snapshot.val();
            if (!lobby) return;

            if (lobby.currentGameId) {
                navigate(`/game/${lobby.currentGameId}`, { replace: true });
            }
        });

        return () => unsubscribe();
    }, [lobbyId, navigate]);

    /* ===============================
       Host: start new game
       =============================== */
    const handleStartGame = async () => {
        if (!lobbyId || !player?.uid) return;

        try {
            await lobbyService.startNewGame(lobbyId, player.uid);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            <h1>Lobby</h1>
            <p>Lobby Id: {lobbyId}</p>

            <p>Waiting...</p>
            <hr />

            <p>List of players in the Lobby</p>
            {players.length > 0 && (
                <ul>
                    {players.map(p => (
                        <li key={p.uid}>
                            {p.name} {p.isHost && "(Host)"}
                        </li>
                    ))}
                </ul>
            )}

            {player?.isHost && (
                <p>
                    Start Game:{" "}
                    <button onClick={handleStartGame}>Start</button>
                </p>
            )}
        </>
    );
}

export default Lobby;
