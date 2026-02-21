"use client";

import { useSearchParams } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { MainContent } from "@/components/dashboard/main-content";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const isExcalidrawView = view === "plan";

  if (isExcalidrawView) {
    return <MainContent />;
  }

  return (
    <SidebarProvider className="bg-sidebar">
      <DashboardSidebar />
      <div className="h-svh overflow-hidden lg:p-2 w-full">
        <div className="lg:border lg:rounded-md overflow-hidden flex flex-col items-center justify-start bg-container h-full w-full bg-background">
          {view !== "bookmarks" && <DashboardHeader />}
          <MainContent />
        </div>
      </div>
    </SidebarProvider>
  );
}
