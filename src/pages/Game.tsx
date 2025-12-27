import { useParams, useNavigate } from "react-router";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Game() {
    const { gameId } = useParams();
    const { player } = useAuth();
    const navigate = useNavigate();

    // Guard: must be authenticated and have a gameId
    useEffect(() => {
        if (!player || !gameId) {
            navigate("/", { replace: true });
        }
    }, [player, gameId, navigate]);

    if (!player || !gameId) return null;

    return (
        <>
            <h1>Indian Rummy</h1>
            <p>Game ID: {gameId}</p>

            <p>Player: {player.name}</p>

            <hr />

            <p>Game in progress...</p>
        </>
    );
}
