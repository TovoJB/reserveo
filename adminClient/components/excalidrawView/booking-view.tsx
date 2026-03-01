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
import { useEvent } from "@/hooks/use-events";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Share2, Check } from "lucide-react";
import { useSearchParams } from "next/navigation";

export function BookingView() {
    const searchParams = useSearchParams();
    const eventId = searchParams?.get("eventId");
    const { data: event } = useEvent(eventId || "");
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
    const [files, setFiles] = React.useState<Record<string, any>>({});
    const [focusedElementId, setFocusedElementId] = React.useState<string | null>(null);
    const [isCopied, setIsCopied] = React.useState(false);

    const handleShare = () => {
        const publicUrl = `http://localhost:3005/book/${selectedFloorId}`;
        navigator.clipboard.writeText(publicUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

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
            <div className="flex items-center justify-between px-6 py-3 border-b bg-background z-20 shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
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

                    {event && (
                        <div className="flex items-center gap-3 border-l pl-6">
                            <div className="flex items-center gap-2">
                                <Calendar className="size-4 text-primary" />
                                <span className="text-sm font-medium">Événement : <span className="text-primary">{event.title}</span></span>
                            </div>
                            <Badge variant="outline" className="text-[10px] uppercase">
                                En cours de gestion
                            </Badge>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 h-8"
                        onClick={handleShare}
                    >
                        {isCopied ? <Check className="size-4 text-emerald-500" /> : <Share2 className="size-4" />}
                        {isCopied ? "Copié !" : "Partager"}
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex relative overflow-hidden">
                {/* List Panel */}
                <div className="w-80 sm:w-[400px] h-full border-r bg-background shrink-0 z-10 relative">
                    <MapsPanel
                        elements={namedElements}
                        files={files}
                        onSelectElement={(id) => setFocusedElementId(id)}
                        selectedElementId={focusedElementId}
                    />
                </div>

                {/* Main Map View */}
                <div className="flex-1 relative h-full">
                    {allFloorPlans.length > 0 ? (
                        <>
                            {/* Always render so it can load data and call onElementsChange */}
                            <ExcalidrawWrapper
                                floorId={selectedFloorId}
                                viewMode={true}
                                onElementsChange={setElements}
                                onFilesChange={setFiles}
                                focusedElementId={focusedElementId}
                            />
                            {/* Overlay the empty-state while elements haven't loaded yet */}
                            {elements.length === 0 && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center p-8 bg-white/80 backdrop-blur-sm z-10 pointer-events-none">
                                    <FileText className="size-12 text-muted-foreground/20" />
                                    <div className="space-y-1">
                                        <p className="font-semibold text-slate-600">Plan non initialisé</p>
                                        <p className="text-sm text-muted-foreground italic">Ce plan ne contient aucun élément graphique.</p>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8 bg-gray-50/20">
                            <Calendar className="size-12 text-muted-foreground/20" />
                            <div className="space-y-1">
                                <p className="font-semibold text-slate-600">Aucun plan configuré</p>
                                <p className="text-sm text-muted-foreground italic">Créez un plan dans le dashboard pour le voir s'afficher ici.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
