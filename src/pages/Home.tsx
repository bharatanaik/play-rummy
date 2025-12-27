import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext"
import { useEffect } from "react";

export default function Login () {
    const {signInWithGoogle, user} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

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
 
    return (
        <>
            <h1>Play Rummy</h1>
            <div>
                <button onClick={signInWithGoogle}>Login user</button>
            </div>
        </>
    )
}