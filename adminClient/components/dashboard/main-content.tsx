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
// ... imports
import { VisualBookingAdmin } from "../admin-booking/visual-booking";
import { DevelopmentView } from "./development-view";
import { SupportView } from "./support-view";

export function MainContent() {
    const searchParams = useSearchParams();
    const view = searchParams.get("view");
    const id = searchParams.get("id");

    if (view === "plan" && id) {
        // return <ExcalidrawWrapper floorId={id} />;
        return <ExcalidrawWrapper floorId={id} />;
    }

    if (view === "calendar") {
        return (
            <div className="flex flex-col flex-1 w-full overflow-hidden">
                <CalendarControls />
                <CalendarView />
            </div>
        );
    }

    if (view === "bookmarks") {
        return (
            <div className="flex flex-col flex-1 w-full overflow-hidden">
                <BookmarksHeader />
                <BookmarksContent />
            </div>
        );
    }

    if (view === "clients") {
        return (
            <div className="flex flex-col flex-1 w-full overflow-hidden">
                <ClientsTable />
            </div>
        );
    }

    if (view === "tasks") {
        return (
            <div className="flex flex-col flex-1 w-full overflow-hidden">
                <TasksTable />
            </div>
        );
    }

    if (view === "bookings") {
        return <BookingView />;
    }

    if (view === "admin-reservation") {
        return <VisualBookingAdmin />;
    }

    if (view === "development") {
        return <DevelopmentView />;
    }

    if (view === "support") {
        return <SupportView />;
    }

    return <StatsContent />;
}
