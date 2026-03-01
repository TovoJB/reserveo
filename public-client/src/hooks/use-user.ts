import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

export function useUser() {
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            if (!isLoaded || !isSignedIn) return;
            setIsLoading(true);
            try {
                const token = await getToken();
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                }
            } catch (err) {
                console.error('Failed to fetch user:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [isLoaded, isSignedIn, getToken]);

    return { user, isLoading, isSignedIn };
}
