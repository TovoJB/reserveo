export type ClientStatus = "ACTIVE" | "BANNED" | "SUBSCRIBED" | "PENDING" | "UNVERIFIED";

export type RestrictionOperator = "min" | "max" | "equal";

export interface RestrictionRule {
    type: string; // e.g. "chaise", "table"
    operator: RestrictionOperator;
    value: number;
}

export interface ClientRestrictionDetails {
    rules: RestrictionRule[];
    forbiddenPlaces: string[];
}

export type ClientRestriction = "none" | "all" | ClientRestrictionDetails;

export interface ReservationHistory {
    id: string;
    date: string;
    space: string;
    status: "completed" | "cancelled" | "upcoming";
}

export interface Client {
    id: string; // or number depending on backend, string is safer for UUIDs
    name: string;
    avatar?: string;
    email: string;
    phone: string;
    socials?: {
        facebook?: string;
        whatsapp?: string;
    };
    status: ClientStatus;
    restrictions: ClientRestriction;
    lastInteraction?: string;
    bookingCount?: number;
    relationshipStatus?: ClientStatus;
    relationshipId?: number;
    history?: ReservationHistory[];
    createdAt: string;
    updatedAt: string;
}

// DTOs for API
export interface CreateClientDTO {
    name: string;
    email: string;
    phone: string;
    status?: ClientStatus;
    restrictions?: ClientRestriction;
}

export interface UpdateClientDTO extends Partial<CreateClientDTO> {
    avatar?: string;
    socials?: {
        facebook?: string;
        whatsapp?: string;
    };
}
