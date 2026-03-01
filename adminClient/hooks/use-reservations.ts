"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./use-api";

import { Reservation, CreateReservationDTO as ReservationFilters } from "@/types";

const QUERY_KEY = "reservations";

export function useReservations(filters?: ReservationFilters) {
    const api = useApi();

    return useQuery<Reservation[]>({
        queryKey: [QUERY_KEY, filters],
        queryFn: async () => {
            const { data } = await api.get<{ data: Reservation[] }>("/reservations", {
                params: filters,
            });
            return data.data;
        },
    });
}

export function useReservation(id: number) {
    const api = useApi();

    return useQuery<Reservation>({
        queryKey: [QUERY_KEY, id],
        queryFn: async () => {
            const { data } = await api.get<{ data: Reservation }>(`/reservations/${id}`);
            return data.data;
        },
        enabled: !!id,
    });
}

export function useCreateReservation() {
    const api = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: Omit<Reservation, "id" | "status">) => {
            const { data } = await api.post<{ data: Reservation }>("/reservations", payload);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
    });
}

export function useUpdateReservationStatus() {
    const api = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, status }: { id: number; status: Reservation["status"] }) => {
            const { data } = await api.patch<{ data: Reservation }>(`/reservations/${id}/status`, {
                status,
            });
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
    });
}

export function useDeleteReservation() {
    const api = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/reservations/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
    });
}

export function useUpdateReservation() {
    const api = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: any }) => {
            const response = await api.put<{ data: Reservation }>(`/reservations/${id}`, data);
            return response.data.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
        },
    });
}
