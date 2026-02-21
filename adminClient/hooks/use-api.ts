"use client";

import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";
import { createApiClient } from "@/lib/api-client";

/**
 * Hook that returns an axios instance pre-configured with the Clerk token.
 * Use this inside any component or hook that needs to call the backend.
 */
export function useApi() {
    const { getToken } = useAuth();
    const api = useMemo(() => createApiClient(getToken), [getToken]);
    return api;
}
