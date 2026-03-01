import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useApi } from './use-api';

export function useReservations() {
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const api = useApi();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createReservation = useCallback(async (data: any) => {
        if (!isLoaded || !isSignedIn) return null;

        setIsLoading(true);
        setError(null);
        try {
            const token = await getToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/clients/me/reservations`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to create reservation');
            }
            const { data: reservation } = await response.json();
            return reservation;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [isLoaded, isSignedIn, getToken]);

    return { createReservation, isLoading, error };
}
