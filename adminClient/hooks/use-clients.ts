"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./use-api";

export type { Client as BackendClient } from "@/types";
import { type Client as BackendClient } from "@/types";

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

export function useUpdateClient() {
    const api = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: any }) => {
            const response = await api.put<{ data: BackendClient }>(`/clients/${id}`, data);
            return response.data.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
        },
    });
}

export function useInviteClient() {
    const api = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { email: string; firstName?: string; lastName?: string }) => {
            const res = await api.post<{ data: any }>("/clients", data);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
    });
}

export function useSendInvitation() {
    const api = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (relationshipId: number) => {
            const res = await api.post<{ data: any }>("/clients/send-invitation", {
                relationshipId,
            });
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
    });
}

export function useRemoveClientRelationship() {
    const api = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (relationshipId: number) => {
            await api.delete(`/clients/relationship/${relationshipId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
    });
}
