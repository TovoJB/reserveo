"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./use-api";

const QUERY_KEY = "space-plans";

export function useSpacePlan(spaceId: number | string) {
    const api = useApi();

    return useQuery({
        queryKey: [QUERY_KEY, spaceId],
        queryFn: async () => {
            if (!spaceId || spaceId === "default-plan") return null;
            try {
                const { data } = await api.get<{ data: any }>(`/space-plans/${spaceId}`);
                return data.data;
            } catch (error: any) {
                if (error.response?.status === 404) return null;
                throw error;
            }
        },
        enabled: !!spaceId && spaceId !== "default-plan",
    });
}

export function useSaveSpacePlan() {
    const api = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ spaceId, elements, appState, files }: {
            spaceId: number | string,
            elements: any[],
            appState: any,
            files: any
        }) => {
            const { data } = await api.put<{ data: any }>(`/space-plans/${spaceId}`, {
                elements,
                appState,
                files
            });
            return data.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.spaceId] });
        },
    });
}

export function useSpacePlanHistory(spaceId: number | string) {
    const api = useApi();

    return useQuery({
        queryKey: [QUERY_KEY, spaceId, "history"],
        queryFn: async () => {
            const { data } = await api.get<{ data: any[] }>(`/space-plans/${spaceId}/history`);
            return data.data;
        },
        enabled: !!spaceId && spaceId !== "default-plan",
    });
}
