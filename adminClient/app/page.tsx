"use client";

import { useSearchParams } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { MainContent } from "@/components/dashboard/main-content";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Suspense } from "react";

function DashboardContent() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const isExcalidrawView = view === "plan";

  if (isExcalidrawView) {
    return <MainContent />;
  }

  return (
    <SidebarProvider className="bg-sidebar h-screen overflow-hidden">
      <DashboardSidebar />
      <div className="flex flex-col flex-1 h-full overflow-hidden bg-background">
        <DashboardHeader />
        <main className="flex-1 overflow-hidden relative">
          <MainContent />
        </main>
      </div>
    </SidebarProvider>
  );

}



export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
