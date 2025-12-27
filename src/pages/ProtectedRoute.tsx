import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute() {
    const { player, loading } = useAuth();

    const location = useLocation();

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!player?.uid) {
        console.error("No Player detected. Redirecting to login")
        return <Navigate to={`/?next=${location.pathname}`} replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
