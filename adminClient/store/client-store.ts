import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clients as initialClients, Client } from "@/mock-data/dashboard";

interface ClientState {
    clients: Client[];
    addClient: (client: Client) => void;
    updateClient: (id: string, updates: Partial<Client>) => void;
    deleteClient: (id: string) => void;
}

export const useClientStore = create<ClientState>()(
    persist(
        (set) => ({
            clients: initialClients,
            addClient: (client) => set((state) => ({ clients: [client, ...state.clients] })),
            updateClient: (id, updates) => set((state) => ({
                clients: state.clients.map(c => c.id === id ? { ...c, ...updates } : c)
            })),
            deleteClient: (id) => set((state) => ({
                clients: state.clients.filter(c => c.id !== id)
            }))
        }),
        {
            name: "client-storage",
        }
    )
);
