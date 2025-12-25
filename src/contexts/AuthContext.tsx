'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
    userId: string;
    email: string;
    displayName: string;
    role: 'student' | 'admin' | 'super_admin';
    department?: string;
    studentId?: string;
    hostelBlock?: string;
    roomNumber?: string;
    phoneNumber?: string;
    createdAt: string;
    lastLoginAt: string;
    isActive: number;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName: string, role?: 'student' | 'admin') => Promise<void>;
    logout: () => void;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored user on mount
        const storedUser = localStorage.getItem('campusai_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem('campusai_user');
            }
        }
        setLoading(false);
    }, []);

    const signIn = async (email: string, password: string) => {
        const response = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'login', email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        setUser(data.user);
        localStorage.setItem('campusai_user', JSON.stringify(data.user));
    };

    const signUp = async (
        email: string,
        password: string,
        displayName: string,
        role: 'student' | 'admin' = 'student'
    ) => {
        const response = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'signup', email, password, displayName, role })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Signup failed');
        }

        setUser(data.user);
        localStorage.setItem('campusai_user', JSON.stringify(data.user));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('campusai_user');
    };

    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            signIn,
            signUp,
            logout,
            isAdmin
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
