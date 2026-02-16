"use client";

import * as React from "react";
import { useEffect, useState, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import {
    Calendar as CalendarIcon,
    Clock,
    Phone,
    User,
    Check,
    X,
    Move,
    Plus,
    Minus,
    Maximize,
    RotateCcw,
    MousePointer2,
    Hand,
    Lock,
    Search
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetClose
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// Interfaces
interface Reservation {
    id: string;
    elementId: string;
    customerName: string;
    customerPhone: string;
    date: Date;
    time: string;
    status: 'confirmed' | 'pending';
    // We might track related reservations here
    relatedIds?: string[];
}

type InteractionMode = 'select' | 'pan';

import { useWorkgroupStore, WorkgroupItem } from "@/store/workgroup-store";
import { useBookingStore, Reservation as StoreReservation } from "@/store/booking-store";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function VisualBookingAdmin() {
    const searchParams = useSearchParams();
    const { groups } = useWorkgroupStore();
    const { reservations: storeReservations, addReservation, removeReservation } = useBookingStore();

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

    const [selectedFloorId, setSelectedFloorId] = useState<string>(searchParams.get("id") || "default-plan");

    // Sync default plan if not set from searchParams
    useEffect(() => {
        if (!searchParams.get("id") && allFloorPlans.length > 0 && selectedFloorId === "default-plan") {
            const hasDefaultInPlans = allFloorPlans.some(p => p.id === "default-plan");
            if (!hasDefaultInPlans) {
                setSelectedFloorId(allFloorPlans[0].id);
            }
        }
    }, [allFloorPlans, searchParams, selectedFloorId]);
    // Find the actual floorId from the workgroups if searchParams has an id
    const floorId = useMemo(() => {
        const idFromParams = searchParams.get("id");
        if (!idFromParams) return selectedFloorId;

        // Search recursively for the item with this id
        let foundFloorId = idFromParams;
        const search = (items: WorkgroupItem[]) => {
            for (const item of items) {
                if (item.id === idFromParams && item.floorId) {
                    foundFloorId = item.floorId;
                    return true;
                }
                if (item.children && search(item.children)) return true;
            }
            return false;
        };
        search(groups);
        return foundFloorId;
    }, [searchParams, groups, selectedFloorId]);

    const [elements, setElements] = useState<any[]>([]);
    const [appState, setAppState] = useState<any>(null);
    const [files, setFiles] = useState<any>({});
    const [svgMap, setSvgMap] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);

    const [selectedElement, setSelectedElement] = useState<any>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Interaction Mode
    const [mode, setMode] = useState<InteractionMode>('select');

    // Filtered reservations for current floor
    const reservations = React.useMemo(() => {
        const filtered: Record<string, any> = {};
        Object.values(storeReservations).forEach(res => {
            if (res.floorId === floorId) {
                filtered[res.elementId] = res;
            }
        });
        return filtered;
    }, [storeReservations, floorId]);

    // Zoom & Pan State
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Bounding Box State
    const [bounds, setBounds] = useState({ minX: 0, minY: 0, width: 0, height: 0 });


    // Form State
    const [formData, setFormData] = useState({
        customerName: "",
        customerPhone: "",
        date: new Date(),
        time: "19:00",
        notes: ""
    });

    // Helper: Get Descendants
    // Recursively find all children IDs of an element
    const getDescendants = useMemo(() => {
        return (parentId: string, allEls: any[]): string[] => {
            const parent = allEls.find(e => e.id === parentId);
            if (!parent || !parent.customData?.children) return [];

            let descendants: string[] = [...parent.customData.children];
            parent.customData.children.forEach((childId: string) => {
                descendants = [...descendants, ...getDescendants(childId, allEls)];
            });
            return descendants;
        };
    }, []);

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const stored = localStorage.getItem(`reserveo-floor-${floorId}`);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setElements(parsed.elements || []);
                    setAppState(parsed.appState || {});
                    setFiles(parsed.files || {});
                } else if (floorId === "default-plan") {
                    // Fallback to fetch default plan if not in storage
                    const res = await fetch('/data/florplan1.excalidraw');
                    const data = await res.json();
                    setElements(data.elements || []);
                    setAppState(data.appState || {});
                    setFiles(data.files || []);
                    // Cache it
                    localStorage.setItem(`reserveo-floor-${floorId}`, JSON.stringify(data));
                } else {
                    setElements([]);
                }
            } catch (error) {
                console.error("Failed to load floor data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [floorId]);

    // Calculate Bounds
    useEffect(() => {
        if (!elements.length) return;

        const visibleElements = elements.filter(el => !el.isDeleted);
        if (visibleElements.length === 0) return;

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        visibleElements.forEach(el => {
            minX = Math.min(minX, el.x);
            minY = Math.min(minY, el.y);
            maxX = Math.max(maxX, el.x + el.width);
            maxY = Math.max(maxY, el.y + el.height);
        });

        setBounds({
            minX,
            minY,
            width: maxX - minX,
            height: maxY - minY
        });

    }, [elements]);

    // Initial Auto-Fit
    useEffect(() => {
        if (bounds.width === 0 || !containerRef.current) return;

        const container = containerRef.current;
        const padding = 80;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        const availableWidth = containerWidth - padding * 2;
        const availableHeight = containerHeight - padding * 2;

        const scaleX = availableWidth / bounds.width;
        const scaleY = availableHeight / bounds.height;

        const fitScale = Math.min(scaleX, scaleY, 1.2); // Allow a bit of zoom in but not too much

        setScale(fitScale);

        const centerX = (containerWidth - bounds.width * fitScale) / 2;
        const centerY = (containerHeight - bounds.height * fitScale) / 2;

        setPosition({
            x: centerX - (bounds.minX * fitScale),
            y: centerY - (bounds.minY * fitScale)
        });

    }, [bounds]);

    // Generate SVGs
    useEffect(() => {
        if (!elements.length) {
            setSvgMap({});
            return;
        }

        const generateSvgs = async () => {
            try {
                const { exportToSvg } = await import("@excalidraw/excalidraw");
                const newSvgMap: Record<string, string> = {};

                const namedElements = elements.filter(el => el.customData?.name && !el.isDeleted);

                for (const el of namedElements) {
                    try {
                        const svg = await exportToSvg({
                            elements: [el],
                            appState: {
                                ...appState,
                                viewBackgroundColor: "transparent",
                                exportWithDarkMode: false,
                            },
                            files: files,
                            exportPadding: 0
                        });
                        newSvgMap[el.id] = svg.outerHTML;
                    } catch (e) {
                        console.error("Error generating SVG for element", el.id, e);
                    }
                }
                setSvgMap(newSvgMap);
            } catch (error) {
                console.error("Failed to generate SVGs", error);
            }
        };

        generateSvgs();
    }, [elements, appState, files]);


    /* ---------------- CONTROLS ---------------- */

    const handleZoomIn = () => setScale(s => Math.min(s * 1.2, 5));
    const handleZoomOut = () => setScale(s => Math.max(s / 1.2, 0.1));
    const handleReset = () => {
        if (bounds.width === 0 || !containerRef.current) return;
        const container = containerRef.current;
        const padding = 80;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        const scaleX = (containerWidth - padding * 2) / bounds.width;
        const scaleY = (containerHeight - padding * 2) / bounds.height;
        const fitScale = Math.min(scaleX, scaleY, 1.2);

        setScale(fitScale);

        const centerX = (containerWidth - bounds.width * fitScale) / 2;
        const centerY = (containerHeight - bounds.height * fitScale) / 2;

        setPosition({
            x: centerX - (bounds.minX * fitScale),
            y: centerY - (bounds.minY * fitScale)
        });
    };


    /* ---------------- MOUSE EVENTS FOR PANNING ---------------- */

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = -e.deltaY;
            const factor = 0.001;
            const newScale = Math.max(0.1, Math.min(5, scale + delta * factor * scale));
            setScale(newScale);
        } else {
            // Pan
            setPosition(prev => ({
                x: prev.x - e.deltaX,
                y: prev.y - e.deltaY
            }));
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (mode === 'pan' || !isElementTarget(e.target as Element)) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const isElementTarget = (target: Element) => {
        return target.closest('.interactive-element') !== null;
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };


    const handleElementClick = (element: any, e: React.MouseEvent) => {
        e.stopPropagation();

        if (mode === 'pan') return;

        // Check if any descendant is reserved
        const descendants = getDescendants(element.id, elements);
        const hasReservedChild = descendants.some(childId => !!reservations[childId]);

        // If it's a parent element and a child is reserved -> Error
        if (hasReservedChild && !reservations[element.id]) {
            // In a real app show a toast
            alert("Impossible de réserver cet espace : une partie (enfant) est déjà réservée.");
            return;
        }

        const isReserved = !!reservations[element.id];

        // Prepare info about what will be reserved
        const affectedElements = [element.id, ...descendants];

        setSelectedElement({
            ...element,
            isReserved,
            descendants,
            hasReservedChild
        });

        if (isReserved) {
            const res = reservations[element.id];
            setFormData({
                customerName: res.customerName,
                customerPhone: res.customerPhone,
                date: res.date,
                time: res.time,
                notes: "Déjà réservé"
            });
        } else {
            setFormData({
                customerName: "",
                customerPhone: "",
                date: new Date(),
                time: "19:00",
                notes: ""
            });
        }

        setIsSheetOpen(true);
    };

    const handleSaveReservation = () => {
        if (selectedElement) {
            const descendants = getDescendants(selectedElement.id, elements);
            const allIds = [selectedElement.id, ...descendants];

            allIds.forEach(id => {
                addReservation({
                    id: `res-${Date.now()}-${id}`,
                    elementId: id,
                    customerName: formData.customerName,
                    customerPhone: formData.customerPhone,
                    date: formData.date.toISOString(),
                    time: formData.time,
                    status: 'confirmed',
                    floorId: floorId,
                    relatedIds: allIds.filter(rid => rid !== id)
                });
            });
        }
        setIsSheetOpen(false);
    };

    const handleCancelReservation = () => {
        if (selectedElement) {
            const descendants = getDescendants(selectedElement.id, elements);
            const allIds = [selectedElement.id, ...descendants];

            allIds.forEach(id => {
                removeReservation(floorId, id);
            });
        }
        setIsSheetOpen(false);
    }

    if (isLoading) {
        return <div className="flex items-center justify-center h-full">Chargement du plan...</div>;
    }

    return (
        <div className="flex flex-col h-full w-full bg-gray-50/50 overflow-hidden relative">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b z-20 shadow-sm shrink-0">
                <div className="flex items-center gap-3">
                    <h1 className="text-lg font-bold">Réservation Visuelle</h1>
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
                    <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                        {Math.round(scale * 100)}%
                    </div>
                </div>

                {/* TOOLBAR */}
                <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-1 rounded-lg flex items-center gap-1">
                        <Button
                            variant={mode === 'select' ? 'default' : 'ghost'}
                            size="sm"
                            className="h-8 px-3 gap-2"
                            onClick={() => setMode('select')}
                        >
                            <MousePointer2 className="h-4 w-4" />
                            <span className="text-xs font-medium">Réserver</span>
                        </Button>
                        <Button
                            variant={mode === 'pan' ? 'default' : 'ghost'}
                            size="sm"
                            className="h-8 px-3 gap-2"
                            onClick={() => setMode('pan')}
                        >
                            <Hand className="h-4 w-4" />
                            <span className="text-xs font-medium">Naviguer</span>
                        </Button>
                    </div>

                    <div className="h-6 w-px bg-gray-200 mx-2" />

                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleZoomOut} title="Dezoom (-)">
                            <Minus className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleReset} title="Reset">
                            <Maximize className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleZoomIn} title="Zoom (+)">
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Canvas Area */}
            <div
                ref={containerRef}
                className={cn(
                    "flex-1 relative overflow-hidden bg-gray-100 select-none",
                    mode === 'pan' ? "cursor-grab active:cursor-grabbing" : "cursor-default"
                )}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div
                    ref={contentRef}
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transformOrigin: "0 0",
                        width: '0px',
                        height: '0px',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        willChange: 'transform'
                    }}
                >
                    {elements.filter(el => el.customData?.name && !el.isDeleted).map((el) => {
                        const svgContent = svgMap[el.id];
                        if (!svgContent) return null;

                        const isReserved = !!reservations[el.id];
                        const descendants = getDescendants(el.id, elements);
                        // Check if any child is reserved, making this parent partially blocked if not fully reserved
                        const hasReservedChild = descendants.some(childId => !!reservations[childId]);
                        const isPartiallyReserved = !isReserved && hasReservedChild;

                        return (
                            <div
                                key={el.id}
                                style={{
                                    position: 'absolute',
                                    left: `${el.x}px`,
                                    top: `${el.y}px`,
                                    width: `${el.width}px`,
                                    height: `${el.height}px`,
                                    zIndex: 10
                                }}
                                className={cn(
                                    "group transition-all duration-200 interactive-element",
                                    mode === 'select' ? "cursor-pointer hover:z-50" : "cursor-grab"
                                )}
                                onClick={(e) => handleElementClick(el, e)}
                            >
                                {/* THE SVG CONTENT */}
                                <div
                                    dangerouslySetInnerHTML={{ __html: svgContent }}
                                    className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:overflow-visible pointer-events-none drop-shadow-sm"
                                    style={{
                                        opacity: isReserved ? 0.6 : 1,
                                        filter: isReserved ? 'grayscale(100%)' : 'none'
                                    }}
                                />

                                {/* RESERVED OVERLAY MARKER */}
                                {isReserved && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-red-500/10 border-2 border-red-500 rounded-lg pointer-events-none">
                                        <div className="bg-red-500 text-white rounded-full p-1 shadow-sm">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                    </div>
                                )}

                                {/* PARTIAL RESERVED MARKER (Child is reserved) */}
                                {isPartiallyReserved && (
                                    <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-orange-400 rounded-lg pointer-events-none bg-orange-50/10">
                                        <div className="bg-orange-100 text-orange-600 rounded-full p-0.5 shadow-sm absolute top-1 right-1">
                                            <Lock className="w-3 h-3" />
                                        </div>
                                    </div>
                                )}

                                {/* FREE HOVER MARKER (Only in select mode) */}
                                {!isReserved && !isPartiallyReserved && mode === 'select' && (
                                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-green-500 rounded-lg pointer-events-none transition-colors" />
                                )}

                                {/* TOOLTIP */}
                                <div
                                    className={cn(
                                        "absolute -top-8 left-1/2 -translate-x-1/2 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50 shadow-lg flex items-center gap-1",
                                        isReserved ? "bg-red-600" : isPartiallyReserved ? "bg-orange-500" : "bg-black/80"
                                    )}
                                    style={{ transform: `translateX(-50%) scale(${1 / scale})`, transformOrigin: 'bottom center' }}
                                >
                                    {isReserved && <Lock className="w-3 h-3" />}
                                    {isPartiallyReserved && <span className="text-[10px]">(Partiel)</span>}
                                    <div className="font-bold">{el.customData.name}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {(!bounds.width && elements.length > 0) && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        Calcul des dimensions...
                    </div>
                )}
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent>
                    <SheetHeader>
                        <div className="flex items-center gap-2">
                            <SheetTitle>Réserver {selectedElement?.customData?.name}</SheetTitle>
                            {selectedElement?.isReserved && (
                                <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded">RÉSERVÉ</span>
                            )}
                        </div>
                        {selectedElement?.descendants?.length > 0 && !selectedElement?.isReserved && (
                            <SheetDescription className="text-orange-600 border-l-2 border-orange-400 pl-2 mt-1">
                                Attention : Cette réservation inclura automatiquement {selectedElement.descendants.length} sous-élément(s).
                            </SheetDescription>
                        )}
                        <SheetDescription>Détails de la réservation</SheetDescription>
                    </SheetHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="name" className="text-sm font-medium">Nom du client</label>
                            <Input
                                id="name"
                                value={formData.customerName}
                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                placeholder="Jean Dupont"
                                disabled={selectedElement?.isReserved}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="phone" className="text-sm font-medium">Téléphone</label>
                            <Input
                                id="phone"
                                value={formData.customerPhone}
                                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                placeholder="+261 34 ..."
                                disabled={selectedElement?.isReserved}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Date</label>
                                <Input
                                    type="date"
                                    value={format(formData.date, "yyyy-MM-dd")}
                                    onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
                                    disabled={selectedElement?.isReserved}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Heure</label>
                                <Input
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    disabled={selectedElement?.isReserved}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="notes" className="text-sm font-medium">Notes</label>
                            <Input
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Demandes spéciales..."
                                disabled={selectedElement?.isReserved}
                            />
                        </div>
                    </div>

                    <SheetFooter className="gap-2 sm:gap-0">
                        {selectedElement?.isReserved ? (
                            <Button variant="destructive" onClick={handleCancelReservation} className="w-full">
                                Libérer la place
                            </Button>
                        ) : (
                            <div className="flex gap-2 w-full justify-end">
                                <SheetClose asChild>
                                    <Button variant="outline">Annuler</Button>
                                </SheetClose>
                                <Button onClick={handleSaveReservation} disabled={selectedElement?.isReserved}>Confirmer</Button>
                            </div>
                        )}
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}
