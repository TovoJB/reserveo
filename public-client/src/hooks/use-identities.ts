import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

export interface ClientIdentity {
    id: number;
    uuid: string;
    userId: number;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    address?: string;
    whatsapp: boolean;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export function useIdentities() {
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const [identities, setIdentities] = useState<ClientIdentity[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchIdentities = useCallback(async () => {
        if (!isLoaded || !isSignedIn) return;

        setIsLoading(true);
        setError(null);
        try {
            const token = await getToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/clients/me/identities`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch identities');
            const { data } = await response.json();
            setIdentities(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [isLoaded, isSignedIn, getToken]);

    const addIdentity = async (data: Partial<ClientIdentity>) => {
        if (!isLoaded || !isSignedIn) return;

        try {
            const token = await getToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/clients/me/identities`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to add identity');
            const { data: newIdentity } = await response.json();
            setIdentities(prev => [newIdentity, ...prev]);
            return newIdentity;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const deleteIdentity = async (id: number) => {
        if (!isLoaded || !isSignedIn) return;

        try {
            const token = await getToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/clients/me/identities/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to delete identity');
            setIdentities(prev => prev.filter(i => i.id !== id));
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const updateIdentity = async (id: number, data: Partial<ClientIdentity>) => {
        if (!isLoaded || !isSignedIn) return;

        try {
            const token = await getToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/clients/me/identities/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to update identity');
            const { data: updatedIdentity } = await response.json();
            setIdentities(prev => prev.map(i => i.id === id ? updatedIdentity : i));
            return updatedIdentity;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchIdentities();
    }, [fetchIdentities]);

    return {
        identities,
        isLoading,
        error,
        addIdentity,
        updateIdentity,
        deleteIdentity,
        refresh: fetchIdentities
    };
}
