import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type EmplacementType = {
    id: string;
    name: string;
    icon?: string;
};

export type ReservationField = {
    id: string;
    name: string;
    type: "text" | "number" | "phone";
    isRequired: boolean;
    isConfirmationRequired?: boolean;
};

export type PricingPolicy = "hour" | "half-day" | "day" | "week" | "month" | "free";

export type DayOpening = {
    day: string;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
};

export type OpeningHours = Record<string, DayOpening>;

export const PRICING_POLICIES: { id: PricingPolicy; label: string }[] = [
    { id: "hour", label: "Heure" },
    { id: "half-day", label: "Demi-Journée" },
    { id: "day", label: "Journée" },
    { id: "week", label: "Semaine" },
    { id: "month", label: "Mois" },
    { id: "free", label: "Libre" },
];

export const getPricingPolicyLabel = (id: string) => {
    return PRICING_POLICIES.find(p => p.id === id)?.label || id;
};

interface TypesState {
    emplacementTypes: EmplacementType[];
    reservationFields: ReservationField[];
    pricingPolicies: PricingPolicy[];
    openingHours: OpeningHours;

    addEmplacementType: (type: Omit<EmplacementType, "id">) => void;
    deleteEmplacementType: (id: string) => void;
    updateEmplacementType: (id: string, updates: Partial<EmplacementType>) => void;

    updateReservationField: (id: string, updates: Partial<ReservationField>) => void;
    addReservationField: (field: Omit<ReservationField, "id">) => void;
    deleteReservationField: (id: string) => void;

    togglePricingPolicy: (policy: PricingPolicy) => void;
    updateOpeningHours: (day: string, updates: Partial<DayOpening>) => void;
}

const defaultFields: ReservationField[] = [
    { id: "customerName", name: "Nom / Pseudo", type: "text", isRequired: true, isConfirmationRequired: false },
    { id: "phone", name: "Numéro de téléphone", type: "phone", isRequired: true, isConfirmationRequired: true },
    { id: "email", name: "Email", type: "text", isRequired: true, isConfirmationRequired: false },
];

const defaultTypes: EmplacementType[] = [
    { id: 'chaise', name: 'Chaise' },
    { id: 'table', name: 'Table' },
    { id: 'parking', name: 'Parking' },
    { id: 'salon', name: 'Salon' },
    { id: 'scene', name: 'Scène' },
];

const initialPricing: PricingPolicy[] = ["hour", "half-day", "day"];

const initialOpening: OpeningHours = {
    "Lundi": { day: "Lundi", isOpen: true, openTime: "08:00", closeTime: "22:00" },
    "Mardi": { day: "Mardi", isOpen: true, openTime: "08:00", closeTime: "22:00" },
    "Mercredi": { day: "Mercredi", isOpen: true, openTime: "08:00", closeTime: "22:00" },
    "Jeudi": { day: "Jeudi", isOpen: true, openTime: "08:00", closeTime: "22:00" },
    "Vendredi": { day: "Vendredi", isOpen: true, openTime: "08:00", closeTime: "23:00" },
    "Samedi": { day: "Samedi", isOpen: true, openTime: "09:00", closeTime: "00:00" },
    "Dimanche": { day: "Dimanche", isOpen: false, openTime: "10:00", closeTime: "20:00" },
};

export const useTypesStore = create<TypesState>()(
    persist(
        (set) => ({
            emplacementTypes: defaultTypes,
            reservationFields: defaultFields,
            pricingPolicies: initialPricing,
            openingHours: initialOpening,

            addEmplacementType: (type) =>
                set((state) => ({
                    emplacementTypes: [
                        ...state.emplacementTypes,
                        { ...type, id: Math.random().toString(36).substring(7) },
                    ],
                })),
            deleteEmplacementType: (id) =>
                set((state) => ({
                    emplacementTypes: state.emplacementTypes.filter((t) => t.id !== id),
                })),
            updateEmplacementType: (id, updates) =>
                set((state) => ({
                    emplacementTypes: state.emplacementTypes.map((t) =>
                        t.id === id ? { ...t, ...updates } : t
                    ),
                })),
            addReservationField: (field) =>
                set((state) => ({
                    reservationFields: [
                        ...state.reservationFields,
                        { ...field, id: Math.random().toString(36).substring(7) },
                    ],
                })),
            deleteReservationField: (id) =>
                set((state) => ({
                    reservationFields: state.reservationFields.filter((f) => f.id !== id),
                })),
            updateReservationField: (id, updates) =>
                set((state) => ({
                    reservationFields: state.reservationFields.map((f) =>
                        f.id === id ? { ...f, ...updates } : f
                    ),
                })),
            togglePricingPolicy: (policy) =>
                set((state) => ({
                    pricingPolicies: state.pricingPolicies.includes(policy)
                        ? state.pricingPolicies.filter(p => p !== policy)
                        : [...state.pricingPolicies, policy]
                })),
            updateOpeningHours: (day, updates) =>
                set((state) => ({
                    openingHours: {
                        ...state.openingHours,
                        [day]: { ...state.openingHours[day], ...updates }
                    }
                })),
        }),
        {
            name: 'emplacement-types-storage-v2', // Bumped version for new schema
        }
    )
);
