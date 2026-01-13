"use client";

import { useSearchParams } from "next/navigation";
import { DashboardContent as StatsContent } from "./content";
import { ExcalidrawWrapper } from "../excalidraw-wrapper";

import { CalendarView } from "../calendar/calendar-view";
import { CalendarControls } from "../calendar/calendar-controls";
import { BookmarksContent } from "../bookmarks/content";
import { BookmarksHeader } from "../bookmarks/header";

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
            <div className="flex flex-col h-full overflow-hidden">
                <CalendarControls />
                <CalendarView />
            </div>
        );
    }

    if (view === "bookmarks") {
        return (
            <div className="flex flex-col h-full overflow-hidden">
                <BookmarksHeader />
                <BookmarksContent />
            </div>
        );
    }

    return <StatsContent />;
}
