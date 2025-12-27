import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { lobbyService } from '../services/lobby.service';
import { useState } from 'react';

const Dashboard = () => {
    const { logout, player} = useAuth();
    const navigate = useNavigate();
    const [lobbyId, setLobbyId] = useState('');

    const handleCreateLobbyButton = async () => {
        if(player){
            try {
                const newLobbyId = await lobbyService.createLobby(player);
                navigate(`/lobby/${newLobbyId}`);
            } catch (error) {
                console.error('Failed to create lobby:', error);
                // You could show an error message to the user here
                alert('Failed to create lobby. Please try again.');
            }
        }
    }

    const handleJoinLobby = () => {
        if (lobbyId.trim()) {
            navigate(`/lobby/${lobbyId.trim()}`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header with User Profile */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6 shadow-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {player?.photoURL && (
                                <img 
                                    src={player.photoURL} 
                                    alt={player.name || 'User'} 
                                    className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
                                />
                            )}
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white">
                                    Welcome, {player?.name || 'Player'}!
                                </h2>
                                <p className="text-green-100 text-sm">{player?.email}</p>
                            </div>
                        </div>
                        <button 
                            onClick={logout}
                            className="
                                bg-red-500 hover:bg-red-600 text-white 
                                px-4 py-2 rounded-lg font-semibold
                                transition-all duration-200
                                hover:scale-105 active:scale-95
                            "
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Main Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Create Lobby Card */}
                    <div className="bg-white rounded-lg shadow-2xl p-8 hover:shadow-3xl transition-shadow duration-300">
                        <div className="text-center">
                            <div className="text-6xl mb-4">🎮</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">
                                Create New Lobby
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Start a new game and invite your friends to join
                            </p>
                            <button 
                                onClick={handleCreateLobbyButton}
                                className="
                                    w-full bg-green-600 hover:bg-green-700 text-white 
                                    px-6 py-4 rounded-lg font-bold text-lg
                                    shadow-lg hover:shadow-xl
                                    transition-all duration-200
                                    hover:scale-105 active:scale-95
                                "
                            >
                                Create Lobby
                            </button>
                        </div>
                    </div>

                    {/* Join Lobby Card */}
                    <div className="bg-white rounded-lg shadow-2xl p-8 hover:shadow-3xl transition-shadow duration-300">
                        <div className="text-center">
                            <div className="text-6xl mb-4">🚪</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">
                                Join Lobby
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Enter a lobby code to join an existing game
                            </p>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={lobbyId}
                                    onChange={(e) => setLobbyId(e.target.value)}
                                    placeholder="Enter Lobby ID"
                                    className="
                                        w-full px-4 py-3 border-2 border-gray-300 
                                        rounded-lg focus:border-green-500 focus:outline-none
                                        text-center text-lg font-mono
                                    "
                                />
                                <button 
                                    onClick={handleJoinLobby}
                                    disabled={!lobbyId.trim()}
                                    className="
                                        w-full bg-blue-600 hover:bg-blue-700 text-white 
                                        px-6 py-4 rounded-lg font-bold text-lg
                                        shadow-lg hover:shadow-xl
                                        transition-all duration-200
                                        hover:scale-105 active:scale-95
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        disabled:hover:scale-100
                                    "
                                >
                                    Join Lobby
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Game Info Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center text-white">
                        <div className="text-3xl mb-2">🏆</div>
                        <h4 className="font-bold text-lg">Win Big</h4>
                        <p className="text-sm text-green-100">Form valid sequences to win</p>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center text-white">
                        <div className="text-3xl mb-2">⚡</div>
                        <h4 className="font-bold text-lg">Quick Games</h4>
                        <p className="text-sm text-green-100">Fast-paced exciting matches</p>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center text-white">
                        <div className="text-3xl mb-2">👥</div>
                        <h4 className="font-bold text-lg">Play Together</h4>
                        <p className="text-sm text-green-100">Real-time multiplayer fun</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
