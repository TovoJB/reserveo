import { Client } from "./client";
import { Space } from "./space";

export type ReservationStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "ARRIVED" | "COMPLETED";

export interface Reservation {
    id: number | string;
    uuid?: string;

    // Core details
    customerId?: number | string; // Optional if fully mapped to customer object, or direct string
    customerName: string;
    customerPhone: string;

    // Relationships
    spaceId: number | string;
    space?: Space;
    client?: Client;

    // Time information
    startDate: string;      // YYYY-MM-DD
    startTime?: string;     // HH:mm
    endTime?: string;       // HH:mm

    // Extra details
    guestsCount?: number;
    status: ReservationStatus;

    // Derived/Display details
    paymentMethod?: string;
    isPaid?: boolean;
    details?: string;

    // Flexibility
    customFields?: Record<string, string>;
    relatedIds?: string[]; // E.g., for multi-element reservations

    // Auditing
    createdAt: string;
    updatedAt: string;
}

export interface CreateReservationDTO {
    customerName: string;
    customerPhone: string;
    spaceId: number | string;
    startDate: string;
    startTime?: string;
    endTime?: string;
    guestsCount?: number;
    status?: ReservationStatus;
    customFields?: Record<string, string>;
    relatedIds?: string[];
}

export interface UpdateReservationStatusDTO {
    status: ReservationStatus;
}
