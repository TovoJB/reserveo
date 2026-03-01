"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { useUser } from '@/hooks/use-user';
import { useApi } from './use-api';

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
    const api = useApi();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 1. Listen for real-time updates via Firestore
    useEffect(() => {
        if (!isLoaded || !isSignedIn || !user?.uuid) return;

        console.log(`[Realtime] Organizer Listening for notifications for user ${user.uuid}`);
        const q = query(
            collection(db, `users/${user.uuid}/notifications`),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: Notification[] = [];
            let unread = 0;

            snapshot.docs.forEach((doc) => {
                const docData = doc.data();
                const notification = {
                    ...docData,
                    id: docData.id || doc.id,
                    uuid: docData.id || doc.id,
                    createdAt: docData.createdAt instanceof Timestamp ? docData.createdAt.toDate().toISOString() : docData.createdAt,
                    readAt: docData.readAt instanceof Timestamp ? docData.readAt.toDate().toISOString() : docData.readAt,
                } as Notification;

                data.push(notification);
                if (!notification.readAt) {
                    unread++;
                }
            });

            console.log(`[Notifications] Received ${data.length} notifications (${unread} unread)`);
            setNotifications(data);
            setUnreadCount(unread);
            setIsLoading(false);
        }, (err) => {
            console.error('Firestore listener error:', err);
            setError(err.message);
        });

        return () => unsubscribe();
    }, [isLoaded, isSignedIn, user?.uuid]);

    const markAsRead = async (id: number | string) => {
        if (!id || id === 'undefined') {
            console.warn('[Notifications] Attempted to mark undefined notification as read');
            return;
        }

        try {
            await api.patch(`/notifications/${id}/read`, {});
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch(`/notifications/read-all`, {});
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const deleteNotification = async (id: number | string) => {
        if (!id || id === 'undefined') return;
        try {
            await api.delete(`/notifications/${id}`);
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
        deleteNotification
    };
}
