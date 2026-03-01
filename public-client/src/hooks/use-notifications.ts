import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { useUser } from './use-user';

export interface Notification {
    id: number;
    uuid: string;
    userId: number;
    type: string;
    title: string;
    message: string;
    data?: any;
    status: 'PENDING' | 'SENT';
    readAt?: string;
    createdAt: string;
}

export function useNotifications() {
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const { user } = useUser();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 1. Listen for real-time updates via Firestore
    useEffect(() => {
        if (!isLoaded || !isSignedIn || !user?.uuid) return;

        console.log(`[Realtime] Listening for notifications for user ${user.uuid}`);
        const q = query(
            collection(db, `users/${user.uuid}/notifications`),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: Notification[] = [];
            let unread = 0;

            snapshot.forEach((doc) => {
                const docData = doc.data();
                // Map Firestore Timestamp to string for compatibility
                const notification = {
                    ...docData,
                    id: docData.id || doc.id,
                    createdAt: docData.createdAt instanceof Timestamp ? docData.createdAt.toDate().toISOString() : docData.createdAt,
                    readAt: docData.readAt instanceof Timestamp ? docData.readAt.toDate().toISOString() : docData.readAt,
                } as Notification;

                data.push(notification);
                if (!notification.readAt) {
                    unread++;
                }
            });

            setNotifications(data);
            setUnreadCount(unread);
            setIsLoading(false);
        }, (err) => {
            console.error('Firestore listener error:', err);
            setError(err.message);
        });

        return () => unsubscribe();
    }, [isLoaded, isSignedIn, user?.uuid]);

    // Keep fetch as fallback or initial load if needed
    const fetchNotifications = useCallback(async () => {
        if (!isLoaded || !isSignedIn) return;

        setIsLoading(true);
        setError(null);
        try {
            const token = await getToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/notifications`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch notifications');
            const { data, unreadCount: count } = await response.json();

            // If we don't have Firestore active yet, use this data
            if (notifications.length === 0) {
                setNotifications(data);
                setUnreadCount(count);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [isLoaded, isSignedIn, getToken, notifications.length]);

    const markAsRead = async (id: number | string) => {
        if (!isLoaded || !isSignedIn) return;

        try {
            const token = await getToken();
            // We use the ID (which might be the uuid from Firestore)
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/notifications/${id}/read`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({})
            });

            if (!response.ok) throw new Error('Failed to mark notification as read');
            // The listener will handle the UI update
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const markAllAsRead = async () => {
        if (!isLoaded || !isSignedIn) return;

        try {
            const token = await getToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/notifications/read-all`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({})
            });

            if (!response.ok) throw new Error('Failed to mark all as read');
            // The listener will handle the UI update
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const acceptInvitation = async (relationshipId: number) => {
        if (!isLoaded || !isSignedIn) return;

        try {
            const token = await getToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/clients/accept-invitation`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ relationshipId })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to accept invitation');
            }

            // The listener will catch the notification being marked as read in the backend
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    return {
        notifications,
        unreadCount,
        isLoading,
        error,
        markAsRead,
        markAllAsRead,
        acceptInvitation,
        refresh: fetchNotifications
    };
}
