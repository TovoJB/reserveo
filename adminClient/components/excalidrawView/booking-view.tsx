"use client";

import * as React from "react";
import { MapsPanel } from "./maps-panel";
import { ExcalidrawWrapper } from "../excalidraw-wrapper";

import { useWorkgroupStore, WorkgroupItem } from "@/store/workgroup-store";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function BookingView() {
    const { groups } = useWorkgroupStore();

    // Get all available floor plans from workgroups
    const allFloorPlans = React.useMemo(() => {
        const plans: { id: string, name: string }[] = [];
        const findPlans = (items: WorkgroupItem[]) => {
            items.forEach(item => {
                if (item.type === 'file' && item.floorId) {
                    plans.push({ id: item.floorId, name: item.name });
                }
                if (item.children) findPlans(item.children);
            });
        };
        findPlans(groups);
        return plans;
    }, [groups]);

    const [selectedFloorId, setSelectedFloorId] = React.useState<string>("default-plan");
    const [elements, setElements] = React.useState<any[]>([]);
    const [focusedElementId, setFocusedElementId] = React.useState<string | null>(null);

    // Sync with URL and available plans
    React.useEffect(() => {
        const urlId = new URLSearchParams(window.location.search).get("id");
        if (urlId) {
            setSelectedFloorId(urlId);
        } else if (allFloorPlans.length > 0 && selectedFloorId === "default-plan") {
            const hasDefault = allFloorPlans.some(p => p.id === "default-plan");
            if (!hasDefault) {
                setSelectedFloorId(allFloorPlans[0].id);
            }
        }
    }, [allFloorPlans, selectedFloorId]);

    // Only sync named elements to the list
    const namedElements = React.useMemo(() => {
        return elements.filter(el => el.customData?.name);
    }, [elements]);

    return (
        <div className="relative w-full h-full flex flex-col overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-3 border-b bg-background z-20 shrink-0">
                <h2 className="text-sm font-semibold">Plan de Salle :</h2>
                <Select value={selectedFloorId} onValueChange={setSelectedFloorId}>
                    <SelectTrigger className="w-[180px] h-8 text-xs font-medium">
                        <SelectValue placeholder="Choisir un plan" />
                    </SelectTrigger>
                    <SelectContent>
                        {allFloorPlans.map(plan => (
                            <SelectItem key={plan.id} value={plan.id} className="text-xs">
                                {plan.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex-1 flex relative overflow-hidden">
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
                    <ExcalidrawWrapper floorId={selectedFloorId} viewMode={true} onElementsChange={setElements}
                        focusedElementId={focusedElementId} />
                </div>
            </div>
        </div>
    );
}
