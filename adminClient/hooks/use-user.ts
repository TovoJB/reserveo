"use client";

import { useAccountSync } from "./use-account-sync";

export function useUser() {
    const { me, isLoading, refetch } = useAccountSync();

    return {
        user: me,
        isLoading,
        refetch
    };
}
