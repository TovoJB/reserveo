"use client";

import { useUser } from "@clerk/nextjs";
import { useApi } from "./use-api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useDashboardStore } from "@/store/dashboard-store";

let lastSyncAttemptClerkId: string | null = null;

export function useAccountSync() {
    const { user, isLoaded } = useUser();
    const api = useApi();
    const { setWorkspaceType, setUsageType } = useDashboardStore();

    // Query to get current user record from local DB
    const meQuery = useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            try {
                const response = await api.get('/auth/me');
                return response.data;
            } catch (err) {
                return null;
            }
        },
        enabled: isLoaded && !!user,
    });

    // Mutation to sync user with optional workspaceType
    const syncMutation = useMutation({
        mutationFn: async (data: {
            clerkId: string,
            email: string,
            userType?: string,
            workspaceType?: 'FIXED' | 'EVENT',
            usageType?: 'PROFESSIONAL' | 'PERSONAL'
        }) => {
            const response = await api.post('/auth/sync', data);
            return response.data;
        },
        onSuccess: (data) => {
            meQuery.refetch();
        }
    });

    // Initial sync (only if not already syncing and user is loaded)
    useEffect(() => {
        if (isLoaded && user && meQuery.data === null && !meQuery.isLoading && !syncMutation.isPending) {
            if (lastSyncAttemptClerkId === user.id) return;
            lastSyncAttemptClerkId = user.id;

            // Check if we have a setup param in URL to include it in first sync
            const params = new URLSearchParams(window.location.search);
            const setup = params.get("setup")?.toUpperCase() as 'FIXED' | 'EVENT' | undefined;

            syncMutation.mutate({
                clerkId: user.id,
                email: user.primaryEmailAddress?.emailAddress || "",
                userType: 'ORGANIZER',
                workspaceType: setup
            });
        }
    }, [isLoaded, user, meQuery.data, meQuery.isLoading]);

    // Sync workspace type & usage type from local DB to store
    useEffect(() => {
        if (meQuery.data?.workspaceType) {
            setWorkspaceType(meQuery.data.workspaceType.toLowerCase() as "fixed" | "event");
        }
        if (meQuery.data?.usageType) {
            setUsageType(meQuery.data.usageType as "PROFESSIONAL" | "PERSONAL");
        }
    }, [meQuery.data, setWorkspaceType, setUsageType]);

    return {
        me: meQuery.data,
        isLoading: meQuery.isLoading || !isLoaded,
        sync: syncMutation.mutate,
        isSyncing: syncMutation.isPending,
        refetch: meQuery.refetch,
    };
}
