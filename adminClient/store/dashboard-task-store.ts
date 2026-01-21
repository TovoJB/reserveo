import { create } from "zustand";
import { LeadType, client, LeadSource } from "@/mock-data/dashboard-tasks";

interface DashboardStore {
  searchQuery: string;
  typeFilter: LeadType | "all";
  statusFilter: client | "all";
  sourceFilter: LeadSource | "all";
  sortBy: "name" | "email" | "followUp" | "status" | "score";
  sortOrder: "asc" | "desc";
  chartPeriod: "last_week" | "last_month" | "last_quarter";
  setSearchQuery: (query: string) => void;
  setTypeFilter: (filter: LeadType | "all") => void;
  setStatusFilter: (filter: client | "all") => void;
  setSourceFilter: (filter: LeadSource | "all") => void;
  setSortBy: (sort: "name" | "email" | "followUp" | "status" | "score") => void;
  setSortOrder: (order: "asc" | "desc") => void;
  setChartPeriod: (period: "last_week" | "last_month" | "last_quarter") => void;
  clearFilters: () => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  searchQuery: "",
  typeFilter: "all",
  statusFilter: "all",
  sourceFilter: "all",
  sortBy: "name",
  sortOrder: "asc",
  chartPeriod: "last_month",
  setSearchQuery: (query) => set({ searchQuery: query }),
  setTypeFilter: (filter) => set({ typeFilter: filter }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  setSourceFilter: (filter) => set({ sourceFilter: filter }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setSortOrder: (order) => set({ sortOrder: order }),
  setChartPeriod: (period) => set({ chartPeriod: period }),
  clearFilters: () =>
    set({
      searchQuery: "",
      typeFilter: "all",
      statusFilter: "all",
      sourceFilter: "all",
      sortBy: "name",
      sortOrder: "asc",
    }),
}));

