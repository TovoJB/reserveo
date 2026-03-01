import {
  ClientStatus,
  ClientRestriction,
  RestrictionRule,
  RestrictionOperator,
  ClientRestrictionDetails
} from "@/types";

export type { ClientStatus, ClientRestriction, RestrictionRule, RestrictionOperator, ClientRestrictionDetails };

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
  relationshipStatus?: ClientStatus;
  restrictions: ClientRestriction;
  lastInteraction: string;
  history: ReservationHistory[];
  bookingCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export const clients: Client[] = [];

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

export const leadsChartDataWeek = [
  { date: "Mon", line1: 400, line2: 240, line3: 150, line4: 80 },
  { date: "Tue", line1: 300, line2: 139, line3: 200, line4: 120 },
  { date: "Wed", line1: 200, line2: 980, line3: 300, line4: 150 },
  { date: "Thu", line1: 278, line2: 390, line3: 250, line4: 200 },
  { date: "Fri", line1: 189, line2: 480, line3: 400, line4: 250 },
  { date: "Sat", line1: 239, line2: 380, line3: 350, line4: 180 },
  { date: "Sun", line1: 349, line2: 430, line3: 280, line4: 220 },
];

export const leadsChartDataMonth = [
  { date: "Week 1", line1: 1200, line2: 800, line3: 600, line4: 400 },
  { date: "Week 2", line1: 1500, line2: 1200, line3: 850, line4: 550 },
  { date: "Week 3", line1: 1100, line2: 950, line3: 1200, line4: 700 },
  { date: "Week 4", line1: 1800, line2: 1400, line3: 1500, line4: 900 },
];

export const leadsChartDataQuarter = [
  { date: "Oct", line1: 4500, line2: 3200, line3: 2800, line4: 1500 },
  { date: "Nov", line1: 5200, line2: 4100, line3: 3500, line4: 2200 },
  { date: "Dec", line1: 6100, line2: 5300, line3: 4800, line4: 3100 },
];
