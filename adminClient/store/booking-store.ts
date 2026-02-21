import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Reservation {
    id: string;
    elementId: string;
    customerName: string;
    customerPhone: string;
    date: string; // ISO string
    time: string;
    status: 'confirmed' | 'pending';
    floorId: string;
    relatedIds?: string[];
    customFields?: Record<string, string>;
    entryTime?: string; // Format "YYYY-MM-DD HH:mm"
    exitTime?: string;  // Format "YYYY-MM-DD HH:mm"
    elementName?: string;
    elementType?: string;
}

interface BookingState {
    reservations: Record<string, Reservation>; // key is res.id
    addReservation: (res: Reservation) => void;
    removeReservation: (floorId: string, elementId: string) => void; // Removes ALL reservations for this element
    removeReservationById: (id: string) => void;
    getReservationsForFloor: (floorId: string) => Reservation[];
}

export const useBookingStore = create<BookingState>()(
    persist(
        (set, get) => ({
            reservations: {},
            addReservation: (res) => set((state) => ({
                reservations: {
                    ...state.reservations,
                    [res.id]: res
                }
            })),
            removeReservation: (floorId, elementId) => set((state) => {
                const next = { ...state.reservations };
                Object.values(next).forEach(r => {
                    if (r.floorId === floorId && r.elementId === elementId) {
                        delete next[r.id];
                    }
                });
                return { reservations: next };
            }),
            removeReservationById: (id) => set((state) => {
                const next = { ...state.reservations };
                delete next[id];
                return { reservations: next };
            }),
            getReservationsForFloor: (floorId) => {
                return Object.values(get().reservations).filter(r => r.floorId === floorId);
            }
        }),
        {
            name: "booking-storage",
        }
    )
);
