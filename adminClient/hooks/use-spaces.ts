"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./use-api";

import { Space } from "@/types";

const QUERY_KEY = "spaces";

export function useSpaces(hierarchical = false) {
    const api = useApi();

    return useQuery<Space[]>({
        queryKey: [QUERY_KEY, { hierarchical }],
        queryFn: async () => {
            const { data } = await api.get<{ data: Space[] }>("/spaces", {
                params: hierarchical ? { hierarchical: "true" } : undefined,
            });
            return data.data;
        },
    });
}

export function useSpace(id: number) {
    const api = useApi();

    return useQuery<Space>({
        queryKey: [QUERY_KEY, id],
        queryFn: async () => {
            const { data } = await api.get<{ data: Space }>(`/spaces/${id}`);
            return data.data;
        },
        enabled: !!id,
    });
}

export function useCreateSpace() {
    const api = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post<{ data: Space }>("/spaces", data);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
    });
}

export function useUpdateSpace() {
    const api = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: any }) => {
            const response = await api.put<{ data: Space }>(`/spaces/${id}`, data);
            return response.data.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
        },
    });
}

export function useDeleteSpace() {
    const api = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/spaces/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
    });
}

export function usePublishSpace() {
    const api = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const { data } = await api.patch<{ data: Space }>(`/spaces/${id}/publish`);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
    });
}
