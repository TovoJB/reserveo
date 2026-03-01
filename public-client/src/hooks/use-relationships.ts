import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from './use-api';

export interface OrganizerRelationship {
    id: number;
    uuid: string;
    organizerId: number;
    clientId: number;
    status: string;
    createdAt: string;
    organizer: {
        id: number;
        uuid: string;
        email: string;
        userType: string;
        workspaceType: 'FIXED' | 'EVENT';
        profile?: {
            firstName: string;
            lastName: string;
            avatarUrl?: string;
        };
        organizerSpaces?: {
            id: number;
            uuid: string;
            name: string;
            slug: string;
            images?: { imageUrl: string }[];
        }[];
    };
}

export function useRelationships() {
    const api = useApi();

    return useQuery<OrganizerRelationship[]>({
        queryKey: ['my-relationships'],
        queryFn: async () => {
            const { data } = await api.get<{ data: OrganizerRelationship[] }>('/clients/my-relationships');
            return data.data;
        }
    });
}

export function useRemoveRelationship() {
    const api = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (relationshipId: number) => {
            await api.delete(`/clients/me/relationship/${relationshipId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-relationships'] });
        },
    });
}
