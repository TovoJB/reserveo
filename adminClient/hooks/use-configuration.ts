"use client";

import { useQuery } from "@tanstack/react-query";
import { useApi } from "./use-api";

export interface EventPricingRule {
    min_guests: number;
    max_guests: number;
    price: number;
    label: string;
}

export function useConfiguration() {
    const api = useApi();

    const eventPricingQuery = useQuery({
        queryKey: ["event-pricing"],
        queryFn: async () => {
            const { data } = await api.get<{ data: EventPricingRule[] }>("/configuration/event-pricing");
            return data.data;
        }
    });

    return {
        eventPricing: eventPricingQuery.data || [],
        isLoadingPricing: eventPricingQuery.isLoading
    };
}
