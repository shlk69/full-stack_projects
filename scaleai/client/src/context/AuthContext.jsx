import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    useEffect(() => {
        // Optionally fetch user profile with token
        // For simplicity, we just check token presence
        if (token) {
            setUser({ authenticated: true });
        } else {
            setUser(null);
        }
    }, [token]);

    const loginUser = (userObj, tokenStr) => {
        localStorage.setItem('token', tokenStr);
        setToken(tokenStr);
        setUser(userObj);
    };

    const logoutUser = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};
