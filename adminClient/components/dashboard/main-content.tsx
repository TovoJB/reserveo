"use client";

import { useSearchParams } from "next/navigation";
import { DashboardContent as StatsContent } from "./content";
import { ExcalidrawWrapper } from "../excalidraw-wrapper";
import { CalendarView } from "../calendar/calendar-view";
import { CalendarControls } from "../calendar/calendar-controls";
import { BookmarksContent } from "../bookmarks/content";
import { BookmarksHeader } from "../bookmarks/header";
import { ClientsTable } from "./clients-table";
import { TasksTable } from "./tasks-table";
import { BookingView } from "../excalidrawView/booking-view";
import { VisualBookingAdmin } from "../admin-booking/visual-booking";
import { TypesView } from "./types-view";
import { DevelopmentView } from "./development-view";
import { SupportView } from "./support-view";
import { ProfileView } from "./profile-view";
import { TeamsView } from "./teams-view";
import { ClientsImportView } from "./clients-import-view";

export function MainContent() {
    const searchParams = useSearchParams();
    const view = searchParams?.get("view");
    const id = searchParams?.get("id");

    // Important: No fallback to StatsContent outside of the switch logic
    if (!view) {
        return <StatsContent />;
    }

    if (view === "plan" && id) {
        return <ExcalidrawWrapper floorId={id} />;
    }

    const renderSelectedView = () => {
        switch (view) {
            case "calendar":
                return (
                    <div className="flex flex-col h-full w-full overflow-hidden">
                        <CalendarControls />
                        <CalendarView />
                    </div>
                );
            case "bookmarks":
                return (
                    <div className="flex flex-col h-full w-full overflow-hidden">
                        <BookmarksHeader />
                        <BookmarksContent />
                    </div>
                );
            case "clients":
                return <ClientsTable />;
            case "tasks":
                return <TasksTable />;
            case "bookings":
                return <BookingView />;
            case "admin-reservation":
                return <VisualBookingAdmin />;
            case "types":
                return <TypesView />;
            case "development":
                return <DevelopmentView />;
            case "support":
                return <SupportView />;
            case "profile":
                return <ProfileView />;
            case "teams":
                return <TeamsView />;
            case "clients-import":
                return <ClientsImportView />;
            default:
                return <StatsContent />;
        }
    };

    return (
        <div className="flex-1 h-full w-full relative overflow-hidden bg-background">
            {renderSelectedView()}
        </div>
    );
}
