export type ClientStatus = "active" | "banned" | "subscribed";
export type ClientRestriction = "none" | "tables-only" | "chairs-only" | "all";

export interface ReservationHistory {
  id: string;
  date: string;
  space: string;
  status: "completed" | "cancelled" | "upcoming";
}

export interface Client {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  socials: {
    facebook?: string;
    whatsapp?: string;
  };
  status: ClientStatus;
  restrictions: ClientRestriction;
  lastInteraction: string;
  history: ReservationHistory[];
  bookingCount: number;
}

export const clients: Client[] = [
  {
    id: "1",
    name: "Sarah Rakoto",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=sarah",
    email: "sarah.r@example.mg",
    phone: "034 11 222 33",
    socials: {
      facebook: "fb.com/sarah.rakoto",
      whatsapp: "+261341122233"
    },
    status: "subscribed",
    restrictions: "none",
    lastInteraction: "2024-02-14 10:30",
    bookingCount: 12,
    history: [
      { id: "res-1", date: "2024-01-15", space: "Espace Cristal", status: "completed" },
      { id: "res-2", date: "2024-02-10", space: "Jardin Eden", status: "completed" }
    ]
  },
  {
    id: "2",
    name: "James Andria",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=james",
    email: "james.a@gmail.com",
    phone: "032 44 555 66",
    socials: {
      whatsapp: "+261324455566"
    },
    status: "active",
    restrictions: "tables-only",
    lastInteraction: "2024-02-13 14:20",
    bookingCount: 5,
    history: [
      { id: "res-3", date: "2023-12-20", space: "Espace Cristal", status: "completed" }
    ]
  },
  {
    id: "3",
    name: "Daniela Lala",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=daniela",
    email: "daniela.l@outlook.com",
    phone: "033 77 888 99",
    socials: {
      facebook: "fb.com/daniela.lala"
    },
    status: "banned",
    restrictions: "all",
    lastInteraction: "2023-11-05 09:00",
    bookingCount: 1,
    history: [
      { id: "res-4", date: "2023-11-01", space: "Petit Salon", status: "cancelled" }
    ]
  }
];

// Re-exporting original dashboard types and data for compatibility with other components
export type LeadType = "cold" | "warm";
export type LeadStatus = "closed" | "lost";
export type LeadSource =
  | "linkedin"
  | "google"
  | "referral"
  | "website"
  | "cold-call";

export interface Lead {
  id: string;
  name: string;
  avatar: string;
  type: LeadType;
  email: string;
  followUp: string;
  status: LeadStatus;
  website: string;
  score: number;
  source: LeadSource;
}

export const leads: Lead[] = [
  {
    id: "1",
    name: "Sarah",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=sarah",
    type: "cold",
    email: "sarah@brightwave.co",
    followUp: "In 1 day",
    status: "closed",
    website: "brightwave.co",
    score: 87,
    source: "linkedin",
  },
  // ... adding a few more for minimal compatibility
];

export const dashboardStats = {
  generatedRevenue: { value: "Ar 12.000.000", change: 12 },
  signedClients: { value: "227", change: 23 },
  totalLeads: { value: "3,867", change: 17 },
  teamMembers: { value: "38", activeCount: 6 },
};
