import React, { useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [username, setUsername] = useState('');
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, initializeUser);
        return unsubscribe;
    }, []);

    async function initializeUser(user) {
        if (user) {
            setCurrentUser(user);
            setUsername(user.displayName || '');
            setUserLoggedIn(true);
        } else {
            setCurrentUser(null);
            setUsername('');
            setUserLoggedIn(false);
        }
        setLoading(false);
    }

    const updateUsername = async (newUsername) => {
        try {
            if (currentUser) {
                setUsername(newUsername);
            }
        } catch (error) {
            console.error('Error updating username:', error);
            throw error;
        }
    };

    const value = {
        currentUser,
        username,
        loading,
        userLoggedIn,
        updateUsername
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}