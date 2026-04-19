import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '@/config/api';

interface User {
    userId: string;
    name: string;
    email: string;
    role: string;
    mobile?: string;
    address?: string;
    savedAddress?: {
        fullName: string;
        mobile: string;
        addressLine: string;
        pincode: string;
        city: string;
        state: string;
        apartment?: string;
        houseNumber?: string;
    } | null;
}

interface UserAuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    logout: () => Promise<void>;
    refreshAuth: () => Promise<void>;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export const UserAuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshAuth = async () => {
        try {
            const res = await fetch(`${API_URL}/auth/check`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshAuth();
    }, []);

    const logout = async () => {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'include'
            });
        } catch {
            // Ignore errors — still clear local state
        }
        setUser(null);
    };

    return (
        <UserAuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            setUser,
            logout,
            refreshAuth
        }}>
            {children}
        </UserAuthContext.Provider>
    );
};

export const useUserAuth = () => {
    const context = useContext(UserAuthContext);
    if (!context) throw new Error('useUserAuth must be used within UserAuthProvider');
    return context;
};
