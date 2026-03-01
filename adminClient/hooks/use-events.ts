"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./use-api";
import { Event, CreateEventDTO } from "@/types";

const QUERY_KEY = "events";

export function useEvents() {
    const api = useApi();

    return useQuery<Event[]>({
        queryKey: [QUERY_KEY],
        queryFn: async () => {
            const { data } = await api.get<{ data: Event[] }>("/events");
            return data.data;
        },
    });
}

export function useEvent(id: string | number) {
    const api = useApi();

    return useQuery<Event>({
        queryKey: [QUERY_KEY, id],
        queryFn: async () => {
            const { data } = await api.get<{ data: Event }>(`/events/${id}`);
            return data.data;
        },
        enabled: !!id,
    });
}

export function useCreateEvent() {
    const api = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateEventDTO) => {
            const { data } = await api.post<{ data: Event }>("/events", payload);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
    });
}

export function useUpdateEvent() {
    const api = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...payload }: Partial<Event> & { id: string | number }) => {
            const { data } = await api.patch<{ data: Event }>(`/events/${id}`, payload);
            return data.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
        },
    });
}

export function useDeleteEvent() {
    const api = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string | number) => {
            await api.delete(`/events/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
    });
}
