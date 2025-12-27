import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext"
import { useEffect, useState } from "react";

export default function Login () {
    const {signInWithGoogle, user, loading} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(()=>{
        if(user){
            const redirectURL =  new URLSearchParams(location.search).get('next')
            console.log("Redirect: ", redirectURL);
            if(redirectURL)
                navigate(redirectURL);
            else
                navigate('/dashboard');
        }
    }, [user, navigate, location.search]);

    const handleSignIn = async () => {
        setIsRedirecting(true);
        await signInWithGoogle();
    };

    if (loading || isRedirecting) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="text-8xl mb-6 animate-bounce">🃏</div>
                    <div className="text-white text-2xl font-bold mb-4">
                        {isRedirecting ? 'Redirecting to Google...' : 'Loading...'}
                    </div>
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                </div>
            </div>
        );
    }
 
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    {/* Card Icon */}
                    <div className="text-8xl mb-6 animate-bounce">
                        🃏
                    </div>
                    
                    {/* Title */}
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg">
                        Play Rummy
                    </h1>
                    <p className="text-xl md:text-2xl text-green-100 mb-8">
                        The Classic Indian Rummy Game Online
                    </p>
                    
                    {/* Login Button */}
                    <button 
                        onClick={handleSignIn}
                        className="
                            bg-white text-green-700 px-8 py-4 rounded-lg 
                            font-bold text-lg shadow-2xl
                            hover:bg-green-50 hover:scale-105
                            active:scale-95
                            transition-all duration-200
                            flex items-center gap-3 mx-auto
                        "
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Sign in with Google
                    </button>
                </div>

                {/* Features Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center text-white">
                        <div className="text-4xl mb-3">⚡</div>
                        <h3 className="text-xl font-bold mb-2">Fast & Fun</h3>
                        <p className="text-green-100">Quick matches with smooth gameplay</p>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center text-white">
                        <div className="text-4xl mb-3">👥</div>
                        <h3 className="text-xl font-bold mb-2">Multiplayer</h3>
                        <p className="text-green-100">Play with friends in real-time</p>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center text-white">
                        <div className="text-4xl mb-3">🎯</div>
                        <h3 className="text-xl font-bold mb-2">Classic Rules</h3>
                        <p className="text-green-100">Authentic Indian Rummy experience</p>
                    </div>
                </div>

                {/* Game Rules Preview */}
                <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
                    <h3 className="text-2xl font-bold mb-4 text-center">How to Play</h3>
                    <ul className="space-y-2 text-green-100">
                        <li className="flex items-start gap-2">
                            <span className="text-green-300">✓</span>
                            <span>Form valid sequences and sets with 13 cards</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-300">✓</span>
                            <span>At least 2 sequences required, including 1 pure sequence</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-300">✓</span>
                            <span>Draw and discard cards to complete your hand</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-300">✓</span>
                            <span>Declare when you have a valid hand to win!</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}