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
    wishlist?: string[];
}

interface UserAuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    wishlist: string[];
    setUser: (user: User | null) => void;
    logout: () => Promise<void>;
    refreshAuth: () => Promise<void>;
    toggleWishlist: (productId: string) => Promise<void>;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export const UserAuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refreshAuth = async () => {
        try {
            const res = await fetch(`${API_URL}/auth/check`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                
                // Fetch wishlist silently on auth refresh
                const wishRes = await fetch(`${API_URL}/wishlist`, { credentials: 'include' });
                if (wishRes.ok) {
                    const wishData = await wishRes.json();
                    setWishlist(wishData.wishlist.map((item: any) => item._id || item));
                }
            } else {
                setUser(null);
                setWishlist([]);
            }
        } catch {
            setUser(null);
            setWishlist([]);
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
        setWishlist([]);
    };

    const toggleWishlist = async (productId: string) => {
        if (!user) {
            window.location.href = '/login';
            return;
        }

        const isWishlisted = wishlist.includes(productId);
        
        // Optimistic UX update
        if (isWishlisted) {
            setWishlist(prev => prev.filter(id => id !== productId));
        } else {
            setWishlist(prev => [...prev, productId]);
        }

        try {
            const res = await fetch(`${API_URL}/wishlist/${productId}`, {
                method: isWishlisted ? 'DELETE' : 'POST',
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'include'
            });

            if (res.status === 401) {
                window.location.href = '/login';
                return;
            }

            if (!res.ok) throw new Error('Failed to toggle wishlist');
        } catch (error) {
            // Revert on arbitrary failure
            if (isWishlisted) {
                setWishlist(prev => [...prev, productId]);
            } else {
                setWishlist(prev => prev.filter(id => id !== productId));
            }
        }
    };

    return (
        <UserAuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            wishlist,
            setUser,
            logout,
            refreshAuth,
            toggleWishlist
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
