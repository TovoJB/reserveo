"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./use-api";

export interface Reservation {
    id: number;
    uuid?: string;
    customerName: string;
    customerPhone: string;
    spaceId: number;
    startDate: string;
    startTime?: string;
    endTime?: string;
    guestsCount?: number;
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | "ARRIVED" | "COMPLETED";
    space?: { id: number; name: string };
    createdAt?: string;
}

export interface ReservationFilters {
    spaceId?: number;
    startDate?: string;
    endDate?: string;
}

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
