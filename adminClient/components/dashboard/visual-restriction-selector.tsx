"use client";

import * as React from "react";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    MousePointer2,
    Hand,
    Plus,
    Minus,
    Maximize,
    Check,
    X,
    Map as MapIcon,
    Ban
} from "lucide-react";
import { useWorkgroupStore, WorkgroupItem } from "@/store/workgroup-store";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface VisualRestrictionSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    forbiddenPlaces: string[];
    onTogglePlace: (elementId: string) => void;
}

export function VisualRestrictionSelector({
    open,
    onOpenChange,
    forbiddenPlaces,
    onTogglePlace
}: VisualRestrictionSelectorProps) {
    const { groups } = useWorkgroupStore();

    const allFloorPlans = useMemo(() => {
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

    const [selectedFloorId, setSelectedFloorId] = useState<string>(allFloorPlans[0]?.id || "default-plan");
    const [elements, setElements] = useState<any[]>([]);
    const [appState, setAppState] = useState<any>(null);
    const [files, setFiles] = useState<any>({});
    const [svgMap, setSvgMap] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    // Viewport state
    const [scale, setScale] = useState(0.8);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [mode, setMode] = useState<'select' | 'pan'>('select');
    const containerRef = useRef<HTMLDivElement>(null);

    // Load floor data
    const loadData = useCallback(async () => {
        if (!selectedFloorId) return;
        setIsLoading(true);
        try {
            const stored = localStorage.getItem(`reserveo-floor-${selectedFloorId}`);
            if (stored) {
                const parsed = JSON.parse(stored);
                setElements(parsed.elements || []);
                setAppState(parsed.appState || {});
                setFiles(parsed.files || {});
            } else if (selectedFloorId === "default-plan") {
                const res = await fetch('/data/florplan1.excalidraw');
                const data = await res.json();
                setElements(data.elements || []);
                setAppState(data.appState || {});
                setFiles(data.files || []);
            } else {
                setElements([]);
            }
        } catch (error) {
            console.error("Failed to load floor data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedFloorId]);

    useEffect(() => {
        if (open) loadData();
    }, [open, loadData]);

    // Generate SVGs (cached version)
    useEffect(() => {
        if (!elements.length) return;
        const generateSvgs = async () => {
            try {
                const { exportToSvg } = await import("@excalidraw/excalidraw");
                const newSvgMap: Record<string, string> = {};
                const namedElements = elements.filter(el => el.customData?.name && !el.isDeleted);

                for (const el of namedElements) {
                    try {
                        const svg = await exportToSvg({
                            elements: [el],
                            appState: { ...appState, viewBackgroundColor: "transparent" },
                            files,
                            exportPadding: 0
                        });
                        newSvgMap[el.id] = svg.outerHTML;
                    } catch (e) { }
                }
                setSvgMap(newSvgMap);
            } catch (e) { }
        };
        generateSvgs();
    }, [elements, appState, files]);

    // Handlers for zoom/pan
    const handleZoomIn = () => setScale(s => Math.min(s * 1.2, 5));
    const handleZoomOut = () => setScale(s => Math.max(s / 1.2, 0.1));
    const handleReset = () => {
        setScale(0.8);
        setPosition({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (mode === 'pan') {
            const startX = e.clientX - position.x;
            const startY = e.clientY - position.y;

            const handleMouseMove = (moveEvent: MouseEvent) => {
                setPosition({
                    x: moveEvent.clientX - startX,
                    y: moveEvent.clientY - startY
                });
            };

            const handleMouseUp = () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };

            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[90vw] h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="flex items-center gap-2">
                                <MapIcon className="size-5 text-primary" />
                                Sélection Visuelle des Restrictions
                            </DialogTitle>
                            <DialogDescription>
                                Cliquez sur les places pour les interdire à ce client spécifique.
                            </DialogDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <Select value={selectedFloorId} onValueChange={setSelectedFloorId}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Choisir un plan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allFloorPlans.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex bg-muted p-1 rounded-md">
                                <Button
                                    variant={mode === 'select' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="h-7 px-2 text-[10px]"
                                    onClick={() => setMode('select')}
                                >
                                    <MousePointer2 className="size-3 mr-1" /> SÉLECTION
                                </Button>
                                <Button
                                    variant={mode === 'pan' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="h-7 px-2 text-[10px]"
                                    onClick={() => setMode('pan')}
                                >
                                    <Hand className="size-3 mr-1" /> NAVIGATION
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div
                    ref={containerRef}
                    className={cn(
                        "flex-1 relative bg-slate-50 overflow-hidden",
                        mode === 'pan' ? "cursor-grab active:cursor-grabbing" : "cursor-default"
                    )}
                    onMouseDown={handleMouseDown}
                >
                    <div
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                            transformOrigin: "0 0",
                            position: 'absolute',
                            top: '10%',
                            left: '10%'
                        }}
                    >
                        {elements.filter(el => el.customData?.name && !el.isDeleted).map((el) => {
                            const svgContent = svgMap[el.id];
                            if (!svgContent) return null;
                            const isForbidden = forbiddenPlaces.includes(el.id);

                            return (
                                <div
                                    key={el.id}
                                    style={{
                                        position: 'absolute',
                                        left: `${el.x}px`,
                                        top: `${el.y}px`,
                                        width: `${el.width}px`,
                                        height: `${el.height}px`,
                                    }}
                                    className={cn(
                                        "group transition-all duration-200",
                                        mode === 'select' && "cursor-pointer"
                                    )}
                                    onClick={(e) => {
                                        if (mode === 'select') {
                                            e.stopPropagation();
                                            onTogglePlace(el.id);
                                        }
                                    }}
                                >
                                    <div
                                        dangerouslySetInnerHTML={{ __html: svgContent }}
                                        className={cn(
                                            "w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:overflow-visible pointer-events-none transition-filter",
                                            isForbidden && "grayscale opacity-40 contrast-50"
                                        )}
                                    />

                                    {isForbidden && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-red-500/10 border-2 border-red-500 rounded-lg pointer-events-none">
                                            <div className="bg-red-500 text-white rounded-full p-1 shadow-lg">
                                                <Ban className="size-4" />
                                            </div>
                                        </div>
                                    )}

                                    {mode === 'select' && !isForbidden && (
                                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary rounded-lg pointer-events-none" />
                                    )}

                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                                        {el.customData.name} {isForbidden ? "(INTERDIT)" : ""}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Float Controls */}
                    <div className="absolute bottom-6 left-6 flex flex-col gap-2">
                        <Button variant="secondary" size="icon" className="size-8 rounded-full shadow-md" onClick={handleZoomIn}><Plus className="size-4" /></Button>
                        <Button variant="secondary" size="icon" className="size-8 rounded-full shadow-md" onClick={handleReset}><Maximize className="size-3" /></Button>
                        <Button variant="secondary" size="icon" className="size-8 rounded-full shadow-md" onClick={handleZoomOut}><Minus className="size-4" /></Button>
                    </div>

                    <div className="absolute bottom-6 right-6">
                        <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm border shadow-sm px-4 py-2 flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <div className="size-2 rounded-full bg-red-500" />
                                <span className="text-[10px] font-bold">{forbiddenPlaces.length} Places interdites</span>
                            </div>
                        </Badge>
                    </div>
                </div>

                <DialogFooter className="p-6 border-t shrink-0">
                    <div className="flex items-center justify-between w-full">
                        <p className="text-xs text-muted-foreground italic max-w-md">
                            Note: Les restrictions visuelles bloquent spécifiquement ces emplacements unitaires pour ce client.
                        </p>
                        <Button onClick={() => onOpenChange(false)} className="bg-primary text-primary-foreground min-w-[150px]">
                            <Check className="size-4 mr-2" /> Valider la sélection
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
