"use client";

import { useQuery } from "@tanstack/react-query";
import { useApi } from "./use-api";

export interface Space {
    id: number;
    name: string;
    description?: string;
    capacity?: number;
    type?: string;
    parentId?: number | null;
    children?: Space[];
    organizerId?: number;
}

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
