"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useDashboardStore } from "@/store/dashboard-store";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { MainContent } from "@/components/dashboard/main-content";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useUser } from "@clerk/nextjs";
import { useAccountSync } from "@/hooks/use-account-sync";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const view = searchParams.get("view");
  const setup = searchParams.get("setup") as "fixed" | "event" | null;
  const { workspaceType, setWorkspaceType } = useDashboardStore();
  const { sync, me } = useAccountSync();

  useEffect(() => {
    if (setup && isLoaded && user) {
      const upperType = setup.toUpperCase() as "FIXED" | "EVENT";

      // If setup param exists and doesn't match local DB yet
      if (me && me.workspaceType !== upperType) {
        sync({
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress || "",
          userType: 'ORGANIZER',
          workspaceType: upperType
        });
      }

      setWorkspaceType(setup);

      // If it's a first-time setup and no view is selected, redirect to profile
      if (!view) {
        router.replace(`/dashboard?view=profile&setup=${setup}`);
      }
    }
  }, [setup, view, router, setWorkspaceType, isLoaded, user, me, sync]);

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
