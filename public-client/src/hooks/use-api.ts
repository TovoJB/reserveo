import axios from 'axios';
import { useAuth } from '@clerk/nextjs';
import { useMemo } from 'react';

// Use same backend URL structure
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export function useApi() {
    const { getToken } = useAuth();

    const api = useMemo(() => {
        const instance = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        instance.interceptors.request.use(async (config) => {
            // In publicClient, we'll try to get the clerk token 
            // even if it's for public resources, some actions (like POST /reservations) will need it.
            const token = await getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        return instance;
    }, [getToken]);

    return api;
}
