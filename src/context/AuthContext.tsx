// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
    type User,
    onAuthStateChanged,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    signInWithPopup
} from 'firebase/auth';
import { auth, provider } from '../firebase/config';
import { useNavigate } from 'react-router';
import type { Player } from '../model';

interface AuthContextType {
    user: User | null;
    player: Player | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [player, setPlayer] = useState<Player | null>(null);
    const [loading, setLoading] = useState(true);

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            console.log('Google sign-in successful:', result.user);
        } catch (error) {
            console.error('Google sign-in error:', error);
            throw error;
        }
    };


    const signUpWithEmail = async (email: string, password: string, displayName: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Update profile with display name
            await updateProfile(userCredential.user, {
                displayName: displayName
            });
        } catch (error) {
            console.error("Email sign-up error:", error);
            throw error;
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Email sign-in error:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error("Logout error:", error);
        }
    };


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log(currentUser);

            setUser(currentUser);

            setPlayer({
                uid: currentUser?.uid || null,
                name: currentUser?.displayName || null,
                email: currentUser?.email || null,
                photoURL: currentUser?.photoURL || null,
                isHost: false
            })
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const value = {
        user,
        player,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
