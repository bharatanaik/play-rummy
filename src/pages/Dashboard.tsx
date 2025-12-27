import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { lobbyService } from '../services/lobby.service';

const Dashboard = () => {
    const { logout, player} = useAuth();
    const navigate = useNavigate();

    const handleCreateLobbyButton = async () => {
        if(player){
            const lobbyId = await lobbyService.createLobby(player);
            navigate(`/lobby/${lobbyId}`);
        }
    }

    return (
        <div>
            <h2>Dashboard</h2>
            {player?.photoURL &&
                <img src={player.photoURL} alt="" width={20} height={20} />

            }
            {player && <p>Welcome, {player.name} ({player.email})</p>}
            <button onClick={logout}>Log Out</button>

            <hr />
            <button onClick={handleCreateLobbyButton}>Create Lobby</button>
        </div>
    );
};

export default Dashboard;
