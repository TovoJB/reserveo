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
}

interface BookingState {
    reservations: Record<string, Reservation>; // key is floorId-elementId
    addReservation: (res: Reservation) => void;
    removeReservation: (floorId: string, elementId: string) => void;
    getReservationsForFloor: (floorId: string) => Reservation[];
}

export const useBookingStore = create<BookingState>()(
    persist(
        (set, get) => ({
            reservations: {},
            addReservation: (res) => set((state) => ({
                reservations: {
                    ...state.reservations,
                    [`${res.floorId}-${res.elementId}`]: res
                }
            })),
            removeReservation: (floorId, elementId) => set((state) => {
                const next = { ...state.reservations };
                delete next[`${floorId}-${elementId}`];
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
