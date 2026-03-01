"use client";

import { WelcomeSection } from "./header";
import { StatsCards } from "./stats-cards";
import { LeadSourcesChart } from "./lead-sources-chart";
import { RevenueFlowChart } from "./revenue-flow-chart";
import { TasksTable } from "./tasks-table";
import { TeamsActivityTable } from "./teams-activity-table";

export function DashboardContent() {
  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 space-y-6 bg-background w-full">
      <WelcomeSection />
      <StatsCards />
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        <LeadSourcesChart />
        <RevenueFlowChart />
      </div>

      <TeamsActivityTable />


    </main>
  );
}

