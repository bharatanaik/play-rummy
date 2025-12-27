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
    const [copied, setCopied] = useState(false);
    const [isStarting, setIsStarting] = useState(false);

    // Get player initials for avatar fallback
    const getInitials = (name: string | null) => {
        if (!name) return '?';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // Get consistent color for player avatar
    const getAvatarColor = (uid: string | null) => {
        if (!uid) return 'bg-gray-500';
        const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500', 'bg-red-500', 'bg-indigo-500', 'bg-teal-500'];
        const hash = uid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    // Copy lobby code to clipboard
    const handleCopyLobbyCode = async () => {
        if (!lobbyId) return;
        try {
            await navigator.clipboard.writeText(lobbyId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Leave lobby
    const handleLeaveLobby = async () => {
        if (!lobbyId || !player?.uid) return;
        try {
            await lobbyService.leaveLobby(lobbyId, player.uid);
            navigate('/dashboard');
        } catch (err) {
            console.error('Failed to leave lobby:', err);
        }
    };

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
        if (!lobbyId || !player?.uid || players.length < 2) return;

        try {
            setIsStarting(true);
            await lobbyService.startNewGame(lobbyId, player.uid);
        } catch (err) {
            console.error(err);
            setIsStarting(false);
        }
    };

    const maxPlayers = 6;
    const hostPlayer = players.find(p => p.isHost);
    const isHost = player?.isHost;
    const canStartGame = isHost && players.length >= 2 && !isStarting;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="bg-white rounded-t-2xl shadow-2xl p-6 mb-0">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-center sm:text-left">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                                Game Lobby
                            </h1>
                            <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                                <span className="text-gray-600 font-semibold">Code:</span>
                                <span className="text-2xl md:text-3xl font-mono font-bold text-green-600 tracking-wider">
                                    {lobbyId}
                                </span>
                                <button
                                    onClick={handleCopyLobbyCode}
                                    className="
                                        bg-green-100 hover:bg-green-200 text-green-700 
                                        px-3 py-1 rounded-lg font-semibold text-sm
                                        transition-all duration-200 hover:scale-105 active:scale-95
                                        flex items-center gap-1
                                    "
                                >
                                    {copied ? (
                                        <>
                                            <span>✓</span>
                                            <span>Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>📋</span>
                                            <span>Copy</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        
                        <button
                            onClick={handleLeaveLobby}
                            className="
                                bg-red-500 hover:bg-red-600 text-white 
                                px-4 py-2 rounded-lg font-semibold
                                transition-all duration-200 hover:scale-105 active:scale-95
                                flex items-center gap-2
                            "
                        >
                            <span>←</span>
                            <span>Leave</span>
                        </button>
                    </div>
                    
                    {/* Player Count */}
                    <div className="mt-4 text-center sm:text-left">
                        <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                            <span className="text-2xl">👥</span>
                            <span className="font-bold text-blue-900">
                                {players.length}/{maxPlayers} Players
                            </span>
                        </div>
                    </div>
                </div>

                {/* Players Grid */}
                <div className="bg-white shadow-2xl p-6 mb-0">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Players</h2>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
                        {players.map((p) => (
                            <div
                                key={p.uid}
                                className="
                                    bg-gradient-to-br from-green-50 to-blue-50 
                                    rounded-xl p-4 
                                    border-2 border-green-200
                                    hover:border-green-400
                                    transition-all duration-200
                                    hover:shadow-lg
                                    flex flex-col items-center gap-2
                                "
                            >
                                {/* Avatar */}
                                <div className="relative">
                                    {p.photoURL ? (
                                        <img
                                            src={p.photoURL}
                                            alt={p.name || 'Player'}
                                            className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
                                            onError={(e) => {
                                                // Fallback to initials if image fails
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const parent = target.parentElement;
                                                if (parent) {
                                                    const fallback = document.createElement('div');
                                                    fallback.className = `w-16 h-16 rounded-full ${getAvatarColor(p.uid)} flex items-center justify-center text-white font-bold text-xl border-4 border-white shadow-lg`;
                                                    fallback.textContent = getInitials(p.name);
                                                    parent.appendChild(fallback);
                                                }
                                            }}
                                        />
                                    ) : (
                                        <div className={`
                                            w-16 h-16 rounded-full 
                                            ${getAvatarColor(p.uid)}
                                            flex items-center justify-center
                                            text-white font-bold text-xl
                                            border-4 border-white shadow-lg
                                        `}>
                                            {getInitials(p.name)}
                                        </div>
                                    )}
                                    
                                    {/* Host Badge */}
                                    {p.isHost && (
                                        <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 rounded-full p-1.5 border-2 border-white shadow">
                                            <span className="text-xs">👑</span>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Player Name */}
                                <div className="text-center">
                                    <div className="font-bold text-gray-800 text-sm truncate max-w-[100px]">
                                        {p.name}
                                    </div>
                                    {p.isHost && (
                                        <div className="text-xs font-semibold text-yellow-700">
                                            Host
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        
                        {/* Empty Slots */}
                        {Array.from({ length: Math.max(0, maxPlayers - players.length) }).map((_, i) => (
                            <div
                                key={`empty-${i}`}
                                className="
                                    bg-gray-50 rounded-xl p-4 
                                    border-2 border-dashed border-gray-300
                                    flex flex-col items-center gap-2
                                    opacity-50
                                "
                            >
                                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-3xl text-gray-400">?</span>
                                </div>
                                <div className="text-xs text-gray-500 font-medium">
                                    Waiting...
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Section - Host Controls */}
                <div className="bg-white rounded-b-2xl shadow-2xl p-6">
                    {players.length < 2 ? (
                        <div className="text-center py-4">
                            <div className="text-4xl mb-2">⏳</div>
                            <p className="text-gray-600 font-semibold">
                                Waiting for more players to join...
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                At least 2 players needed to start the game
                            </p>
                        </div>
                    ) : isHost ? (
                        <div className="text-center">
                            <p className="text-gray-600 mb-4 font-semibold">
                                Ready to start? All players will join the game!
                            </p>
                            <button
                                onClick={handleStartGame}
                                disabled={!canStartGame}
                                className="
                                    bg-gradient-to-r from-green-500 to-emerald-600 
                                    hover:from-green-600 hover:to-emerald-700
                                    text-white px-12 py-4 rounded-xl 
                                    font-bold text-xl shadow-2xl
                                    transition-all duration-200
                                    hover:scale-105 active:scale-95
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    disabled:hover:scale-100
                                    flex items-center gap-3 mx-auto
                                "
                            >
                                <span className="text-2xl">🎮</span>
                                <span>{isStarting ? 'Starting...' : 'Start Game'}</span>
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <div className="text-4xl mb-2">⏳</div>
                            <p className="text-gray-600 font-semibold">
                                Waiting for {hostPlayer?.name || 'host'} to start the game...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Lobby;
