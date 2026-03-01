"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./use-api";
import { Payment, CreatePaymentDTO } from "@/types";

const QUERY_KEY = "payments";

export function usePayments() {
    const api = useApi();

    return useQuery<Payment[]>({
        queryKey: [QUERY_KEY],
        queryFn: async () => {
            const { data } = await api.get<{ data: Payment[] }>("/payments");
            return data.data;
        },
    });
}

export function usePayment(id: string | number) {
    const api = useApi();

    return useQuery<Payment>({
        queryKey: [QUERY_KEY, id],
        queryFn: async () => {
            const { data } = await api.get<{ data: Payment }>(`/payments/${id}`);
            return data.data;
        },
        enabled: !!id,
    });
}

export function useCreatePayment() {
    const api = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreatePaymentDTO) => {
            const { data } = await api.post<{ data: Payment }>("/payments", payload);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: ["reservations"] }); // Often update reservation status
        },
    });
}

export function useDeletePayment() {
    const api = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string | number) => {
            await api.delete(`/payments/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
    });
}
