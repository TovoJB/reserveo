"use client";

import { useQuery } from "@tanstack/react-query";
import { useApi } from "./use-api";

const QUERY_KEY = "space-plans";

export function useSpacePlan(spaceId: number | string) {
    const api = useApi();

    return useQuery({
        queryKey: [QUERY_KEY, spaceId],
        queryFn: async () => {
            if (!spaceId) return null;
            try {
                // Public endpoint to get space plan
                const { data } = await api.get<{ data: any }>(`/public/space-plans/${spaceId}`);
                return data.data;
            } catch (error: any) {
                if (error.response?.status === 404) return null;
                throw error;
            }
        },
        enabled: !!spaceId,
    });
}
