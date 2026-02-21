"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./use-api";

export interface BackendClient {
    id: number;
    name?: string;
    email: string;
    phone?: string;
    status: "ACTIVE" | "SUSPENDED" | "BANNED";
    restrictions?: string | null;
    bookingCount?: number;
    lastInteraction?: string;
    profile?: {
        firstName?: string;
        lastName?: string;
        avatar?: string;
    };
    reservations?: Array<{
        id: number;
        startDate: string;
        status: string;
        space?: { name: string };
    }>;
}

const QUERY_KEY = "clients";

export function useClients() {
    const api = useApi();

    return useQuery<BackendClient[]>({
        queryKey: [QUERY_KEY],
        queryFn: async () => {
            const { data } = await api.get<{ data: BackendClient[] }>("/clients");
            return data.data;
        },
    });
}

export function useClient(id: number) {
    const api = useApi();

    return useQuery<BackendClient>({
        queryKey: [QUERY_KEY, id],
        queryFn: async () => {
            const { data } = await api.get<{ data: BackendClient }>(`/clients/${id}`);
            return data.data;
        },
        enabled: !!id,
    });
}

export function useUpdateClientStatus() {
    const api = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, status }: { id: number; status: BackendClient["status"] }) => {
            const { data } = await api.patch<{ data: BackendClient }>(`/clients/${id}/status`, {
                status,
            });
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
    });
}

export function useUpdateClientRestrictions() {
    const api = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, restrictions }: { id: number; restrictions: string }) => {
            const { data } = await api.patch<{ data: BackendClient }>(`/clients/${id}/restrictions`, {
                restrictions,
            });
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
    });
}

export function useDeleteClient() {
    const api = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/clients/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
    });
}
