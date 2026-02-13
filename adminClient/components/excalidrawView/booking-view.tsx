"use client";

import * as React from "react";
import { MapsPanel } from "./maps-panel";
import { ExcalidrawWrapper } from "../excalidraw-wrapper";

export function BookingView() {
    const [elements, setElements] = React.useState<any[]>([]);
    const [focusedElementId, setFocusedElementId] = React.useState<string | null>(null);

    // Only sync named elements to the list
    const namedElements = React.useMemo(() => {
        return elements.filter(el => el.customData?.name);
    }, [elements]);

    return (
        <div className="relative w-full h-full flex overflow-hidden">
            {/* List Panel */}
            <div className="w-80 sm:w-[400px] h-full border-r bg-background shrink-0 z-10 relative">
                <MapsPanel
                    elements={namedElements}
                    onSelectElement={(id) => setFocusedElementId(id)}
                    selectedElementId={focusedElementId}
                />
            </div>

            {/* Main Map View */}
            <div className="flex-1 relative h-full">

                <ExcalidrawWrapper floorId="etage 1" viewMode={true} onElementsChange={setElements}
                    focusedElementId={focusedElementId} />
            </div>
        </div>
    );
}
