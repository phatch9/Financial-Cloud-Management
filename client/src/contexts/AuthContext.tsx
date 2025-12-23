import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AuthState {
    isAuthenticated: boolean;
    username: string | null;
    password: string | null;
    authHeader: string | null;
}

interface AuthContextType extends AuthState {
    login: (username: string, password: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialAuthState: AuthState = {
    isAuthenticated: false,
    username: null,
    password: null,
    authHeader: null,
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>(() => {
        // Try to restore auth from localStorage
        const storedAuthHeader = localStorage.getItem('authHeader');
        const storedUsername = localStorage.getItem('username');

        if (storedAuthHeader && storedUsername) {
            return {
                isAuthenticated: true,
                username: storedUsername,
                password: null, // Don't store password
                authHeader: storedAuthHeader,
            };
        }

        return initialAuthState;
    });

    const login = useCallback((username: string, password: string) => {
        // Generate the Basic Auth header value
        const base64Credentials = btoa(`${username}:${password}`);
        const authHeader = `Basic ${base64Credentials}`;

        // Store in localStorage
        localStorage.setItem('authHeader', authHeader);
        localStorage.setItem('username', username);

        setAuthState({
            isAuthenticated: true,
            username,
            password,
            authHeader,
        });
    }, []);

    const logout = useCallback(() => {
        // Clear localStorage
        localStorage.removeItem('authHeader');
        localStorage.removeItem('username');

        setAuthState(initialAuthState);
    }, []);

    const value = { ...authState, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
