"use client";

import * as React from "react";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { format, addHours, addMinutes, addDays, parse, isValid } from "date-fns";
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
    Search,
    Map,
    ArrowLeft,
    Ban,
    Trash2
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
import { useClientStore } from "@/store/client-store";
import { useTypesStore, getPricingPolicyLabel } from "@/store/types-store";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { ClientRestrictionDetails } from "@/mock-data/dashboard";

export function VisualBookingAdmin() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { groups } = useWorkgroupStore();
    const { reservations: storeReservations, addReservation, removeReservation, removeReservationById } = useBookingStore();
    const { reservationFields, openingHours, pricingPolicies } = useTypesStore();
    const { clients, updateClient } = useClientStore();

    // Restriction Mode params
    const isRestrictMode = searchParams.get("mode") === "restrict";
    const restrictClientId = searchParams.get("clientId");
    const targetClient = useMemo(() =>
        clients.find(c => c.id === restrictClientId)
        , [clients, restrictClientId]);

    const forbiddenPlaces = useMemo(() => {
        if (!targetClient || targetClient.restrictions === "none" || targetClient.restrictions === "all") {
            return [];
        }
        return (targetClient.restrictions as ClientRestrictionDetails).forbiddenPlaces || [];
    }, [targetClient]);

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

    // List of reservations for today or future for each element
    const reservationsByElement = React.useMemo(() => {
        const map: Record<string, any[]> = {};
        const todayStr = format(new Date(), "yyyy-MM-dd");

        Object.values(storeReservations).forEach(res => {
            if (res.floorId === floorId) {
                const resDate = res.date.split("T")[0];
                if (resDate >= todayStr) {
                    if (!map[res.elementId]) map[res.elementId] = [];
                    map[res.elementId].push(res);
                }
            }
        });
        return map;
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


    // Dynamic Form State
    const [formData, setFormData] = useState<any>({
        customerName: "",
        customerPhone: "",
        date: new Date(),
        time: format(new Date(), "HH:mm"),
        notes: "",
        customFields: {}, // Store custom field values here
        offer: "hour",
        exitTimeFree: format(addDays(new Date(), 0), "HH:mm") // Just placeholder
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
    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const stored = localStorage.getItem(`reserveo-floor-${floorId}`);
            if (stored) {
                const parsed = JSON.parse(stored);
                setElements(parsed.elements || []);
                setAppState(parsed.appState || {});
                setFiles(parsed.files || {});
            } else if (floorId === "default-plan") {
                const res = await fetch('/data/florplan1.excalidraw');
                const data = await res.json();
                setElements(data.elements || []);
                setAppState(data.appState || {});
                setFiles(data.files || []);
                localStorage.setItem(`reserveo-floor-${floorId}`, JSON.stringify(data));
            } else {
                setElements([]);
            }
        } catch (error) {
            console.error("Failed to load floor data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [floorId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleToggleRestriction = (elementId: string) => {
        if (!targetClient || !restrictClientId) return;

        const currentRestrictions = targetClient.restrictions;
        let details: ClientRestrictionDetails = { rules: [], forbiddenPlaces: [] };

        if (currentRestrictions === "all") {
            // If they are blocked for everything, maybe we don't need to toggle specific places, 
            // but for consistency let's assume they want to manage specific places
            details = { rules: [], forbiddenPlaces: [] };
        } else if (currentRestrictions !== "none") {
            if (Array.isArray(currentRestrictions)) {
                details = { rules: currentRestrictions, forbiddenPlaces: [] };
            } else {
                details = { ...currentRestrictions };
            }
        }

        const currentForbidden = details.forbiddenPlaces || [];
        const isAlreadyForbidden = currentForbidden.includes(elementId);

        const newForbidden = isAlreadyForbidden
            ? currentForbidden.filter(id => id !== elementId)
            : [...currentForbidden, elementId];

        updateClient(restrictClientId, {
            restrictions: {
                ...details,
                forbiddenPlaces: newForbidden
            }
        });
    };

    // Sync with editor changes
    useEffect(() => {
        const handleSync = (e: any) => {
            if (e.key === `reserveo-floor-${floorId}` || e.type === 'reserveo-list-update') {
                loadData();
            }
        };
        window.addEventListener('storage', handleSync);
        window.addEventListener('reserveo-list-update', handleSync);
        return () => {
            window.removeEventListener('storage', handleSync);
            window.removeEventListener('reserveo-list-update', handleSync);
        };
    }, [floorId, loadData]);

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

        if (isRestrictMode) {
            handleToggleRestriction(element.id);
            return;
        }

        // Check if any descendant is reserved
        const descendants = getDescendants(element.id, elements);
        // We consider it partially reserved if any descendant has at least one reservation
        const hasReservedChild = descendants.some(childId => (reservationsByElement[childId]?.length || 0) > 0);

        const resList = reservationsByElement[element.id] || [];
        const isReserved = resList.length > 0;

        setSelectedElement({
            ...element,
            isReserved,
            descendants,
            hasReservedChild,
            reservations: resList
        });

        setFormData({
            customerName: "",
            customerPhone: "",
            date: new Date(),
            time: format(new Date(), "HH:mm"),
            notes: "",
            customFields: { reservedBy: "Admin" },
            offer: pricingPolicies[0] || "hour",
            exitTimeFree: format(addDays(new Date(), 0), "HH:mm")
        });

        setIsSheetOpen(true);
    };

    const handleSaveReservation = () => {
        if (selectedElement) {
            const descendants = getDescendants(selectedElement.id, elements);
            const allIds = [selectedElement.id, ...descendants];

            const entryDateTime = parse(`${format(formData.date, "yyyy-MM-dd")} ${formData.time}`, "yyyy-MM-dd HH:mm", new Date());
            let exitDateTime = addHours(entryDateTime, 1);

            const unit = formData.offer || "hour";
            const dayMap: Record<string, string> = {
                "Monday": "Lundi", "Tuesday": "Mardi", "Wednesday": "Mercredi",
                "Thursday": "Jeudi", "Friday": "Vendredi", "Saturday": "Samedi", "Sunday": "Dimanche"
            };
            const storeDay = dayMap[format(formData.date, "eeee")] || "Lundi";
            const dayConfig = openingHours[storeDay];
            const closeTime = dayConfig?.closeTime || "22:00";
            const closeDateTime = parse(`${format(formData.date, "yyyy-MM-dd")} ${closeTime}`, "yyyy-MM-dd HH:mm", new Date());

            if (unit === "hour") exitDateTime = addHours(entryDateTime, 1);
            else if (unit === "half-day") {
                const midDay = parse(`${format(formData.date, "yyyy-MM-dd")} 14:00`, "yyyy-MM-dd HH:mm", new Date());
                exitDateTime = entryDateTime < midDay ? midDay : closeDateTime;
            } else if (unit === "day") exitDateTime = closeDateTime;
            else if (unit === "week") exitDateTime = addDays(closeDateTime, 7);
            else if (unit === "month") exitDateTime = addDays(closeDateTime, 30);
            else if (unit === "free") {
                exitDateTime = parse(`${format(formData.date, "yyyy-MM-dd")} ${formData.exitTimeFree}`, "yyyy-MM-dd HH:mm", new Date());
                if (exitDateTime > closeDateTime) { alert(`Fermeture à ${closeTime}`); exitDateTime = closeDateTime; }
                if (exitDateTime < entryDateTime) exitDateTime = addHours(entryDateTime, 1);
            }

            // --- TEMPORAL CONFLICT CHECK ---
            const hasConflict = allIds.some(id => {
                const existing = Object.values(storeReservations).filter(r => r.elementId === id);
                return existing.some(ex => {
                    const exEntry = parse(ex.entryTime || `${ex.date.split('T')[0]} ${ex.time}`, "yyyy-MM-dd HH:mm", new Date());
                    const exExit = ex.exitTime ? parse(ex.exitTime, "yyyy-MM-dd HH:mm", new Date()) : addHours(exEntry, 1);

                    // Overlap check: (StartA < EndB) && (EndA > StartB)
                    return (entryDateTime < exExit) && (exitDateTime > exEntry);
                });
            });

            if (hasConflict) {
                alert("Conflit de calendrier : Cet emplacement (ou l'un de ses enfants) est déjà réservé sur ce créneau horaire.");
                return;
            }

            formData.customFields.offer = unit;
            if (unit === "free") formData.customFields.exitTimeFree = formData.exitTimeFree;

            allIds.forEach(id => {
                const el = elements.find(e => e.id === id);
                addReservation({
                    id: `res-${Date.now()}-${id}`,
                    elementId: id,
                    elementName: el?.customData?.name || id,
                    elementType: el?.customData?.type || 'Place',
                    customerName: formData.customerName,
                    customerPhone: formData.customerPhone,
                    date: formData.date.toISOString(),
                    time: formData.time,
                    status: 'confirmed',
                    floorId: floorId,
                    relatedIds: allIds.filter(rid => rid !== id),
                    customFields: formData.customFields,
                    entryTime: format(entryDateTime, "yyyy-MM-dd HH:mm"),
                    exitTime: format(exitDateTime, "yyyy-MM-dd HH:mm")
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

    const handleCancelSpecificReservation = (resId: string) => {
        const resToRemove = storeReservations[resId];
        if (!resToRemove) return;

        // Remove the main one
        removeReservationById(resId);

        // Remove related ones (children/parent) if they were made together
        if (resToRemove.relatedIds?.length) {
            resToRemove.relatedIds.forEach(rid => {
                // We need to find the reservation ID for this floor-element that matches this group
                // In our current implementation, they share the same timestamp in their ID prefix
                // but it's safer to just delete by element if they are related.
                // However, removeReservation(floorId, elementId) removes ALL. 
                // Let's just find the specific related reservation records.
                Object.values(storeReservations).forEach(r => {
                    if (r.floorId === floorId && resToRemove.relatedIds?.includes(r.elementId) && r.time === resToRemove.time && r.date === resToRemove.date) {
                        removeReservationById(r.id);
                    }
                });
            });
        }

        // Update local state to reflect deletion immediately in the sheet
        if (selectedElement) {
            const updatedReservations = selectedElement.reservations.filter((r: any) => r.id !== resId);
            setSelectedElement({
                ...selectedElement,
                reservations: updatedReservations,
                isReserved: updatedReservations.length > 0
            });
        }
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
            {isRestrictMode && targetClient && (
                <div className="bg-amber-500 text-white px-6 py-2 flex items-center justify-between z-30 shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-1.5 rounded-full">
                            <Ban className="size-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider">Mode Restriction - Sélection Visuelle</p>
                            <p className="text-[10px] opacity-90">Client : <span className="font-bold">{targetClient.name}</span> • Cliquez sur les tables pour les interdire.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-white border-white/40 bg-white/10 h-7 px-3">
                            {forbiddenPlaces.length} Place(s) interdite(s)
                        </Badge>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 font-bold text-[10px] gap-2 shadow-sm"
                            onClick={() => router.push('/?view=clients')}
                        >
                            <Check className="size-3.5" /> TERMINER & QUITTER
                        </Button>
                    </div>
                </div>
            )}

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

                        const resList = reservationsByElement[el.id] || [];
                        const todayStr = format(new Date(), "yyyy-MM-dd");

                        const isReservedToday = resList.some(r => r.date.split('T')[0] === todayStr);
                        const hasFutureReservations = resList.some(r => r.date.split('T')[0] > todayStr);

                        const descendants = getDescendants(el.id, elements);
                        const hasReservedChild = descendants.some(childId => (reservationsByElement[childId]?.length || 0) > 0);
                        const isPartiallyReserved = !isReservedToday && !hasFutureReservations && hasReservedChild;

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
                                onClick={(e) => {
                                    if (el.customData?.isReservable !== false) {
                                        handleElementClick(el, e);
                                    }
                                }}
                            >
                                {/* THE SVG CONTENT */}
                                <div
                                    dangerouslySetInnerHTML={{ __html: svgContent }}
                                    className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:overflow-visible pointer-events-none drop-shadow-sm"
                                    style={{
                                        opacity: isReservedToday ? 0.5 : hasFutureReservations ? 0.8 : 1,
                                        filter: isReservedToday ? 'grayscale(100%) blur(0.5px)' : hasFutureReservations ? 'grayscale(30%)' : 'none'
                                    }}
                                />

                                {/* RESERVED TODAY MARKER (RED) */}
                                {isReservedToday && !isRestrictMode && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 border-2 border-red-500 rounded-lg pointer-events-none shadow-[inset_0_0_15px_rgba(239,68,68,0.2)]">
                                        <div className="bg-red-500 text-white rounded-full p-1 shadow-lg ring-2 ring-white">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                    </div>
                                )}

                                {/* FUTURE RESERVED MARKER (ORANGE) */}
                                {hasFutureReservations && !isReservedToday && !isRestrictMode && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-orange-500/10 border-2 border-orange-400 rounded-lg pointer-events-none border-dashed">
                                        <div className="bg-orange-400 text-white rounded-full p-1 shadow-md">
                                            <CalendarIcon className="w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                )}

                                {/* FORBIDDEN MARKER (Restriction Mode) */}
                                {isRestrictMode && (
                                    <div className={cn(
                                        "absolute inset-0 flex items-center justify-center rounded-lg pointer-events-none transition-all",
                                        forbiddenPlaces.includes(el.id)
                                            ? "bg-red-500/20 border-2 border-red-500"
                                            : "border-2 border-transparent group-hover:border-amber-400 group-hover:bg-amber-400/10"
                                    )}>
                                        {forbiddenPlaces.includes(el.id) && (
                                            <div className="bg-red-600 text-white rounded-full p-1 shadow-lg ring-2 ring-white">
                                                <Ban className="w-4 h-4" />
                                            </div>
                                        )}
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
                                {!isReservedToday && !hasFutureReservations && !isPartiallyReserved && mode === 'select' && (
                                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-green-500 rounded-lg pointer-events-none transition-colors" />
                                )}

                                {/* TOOLTIP */}
                                <div
                                    className={cn(
                                        "absolute -top-10 left-1/2 -translate-x-1/2 text-white text-[10px] px-2 py-1.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50 shadow-xl flex items-center gap-2 border border-white/20 backdrop-blur-md",
                                        isReservedToday ? "bg-red-600/95" : hasFutureReservations ? "bg-orange-500/95" : isPartiallyReserved ? "bg-amber-500/90" : "bg-slate-900/90"
                                    )}
                                    style={{ transform: `translateX(-50%) scale(${1 / scale})`, transformOrigin: 'bottom center' }}
                                >
                                    {isReservedToday ? <Lock className="w-3.5 h-3.5 animate-pulse" /> : hasFutureReservations ? <CalendarIcon className="w-3.5 h-3.5" /> : null}
                                    <div className="flex flex-col leading-tight">
                                        <div className="font-black flex items-center gap-1">
                                            {el.customData.name}
                                            {isReservedToday && <span className="text-[8px] bg-white/20 px-1 rounded">AUJOURD'HUI</span>}
                                        </div>
                                        {resList.length > 0 && (
                                            <div className="mt-1 flex flex-col gap-0.5 border-t border-white/10 pt-1">
                                                {resList.slice(0, 3).map(r => (
                                                    <div key={r.id} className="text-[9px] font-medium flex justify-between gap-3 italic opacity-90">
                                                        <span>{r.date.split('T')[0] === todayStr ? "Maintenant" : format(new Date(r.date), "dd/MM")}</span>
                                                        <span>{r.time}</span>
                                                    </div>
                                                ))}
                                                {resList.length > 3 && <div className="text-[8px] text-center opacity-70">+{resList.length - 3} autres...</div>}
                                            </div>
                                        )}
                                    </div>
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
                                <span className="text-xs font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded">DÉJÀ RÉSERVÉ</span>
                            )}
                        </div>
                        {selectedElement?.reservations?.length > 0 && (
                            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-3">
                                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                                    <div className="size-2 bg-orange-500 rounded-full animate-pulse" />
                                    <p className="font-extrabold text-slate-700 uppercase tracking-tight text-[10px]">Présence enregistrée ({selectedElement.reservations.length})</p>
                                </div>
                                {selectedElement.reservations.map((r: any) => (
                                    <div key={r.id} className="flex justify-between items-center py-2.5 border-t border-slate-200 last:border-0 text-slate-600 hover:bg-slate-100/50 px-1 -mx-1 rounded-md transition-colors">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-800">
                                                <User className="size-3 text-slate-400" />
                                                <span>{r.customerName || "Anonyme"}</span>
                                                <span className="text-[10px] font-normal text-slate-400">({r.customerPhone || "Pas de tel"})</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium ml-4">
                                                <span className="flex items-center gap-1">
                                                    <CalendarIcon className="size-2.5" />
                                                    {format(new Date(r.date), "dd MMMM yyyy", { locale: undefined })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="size-2.5" />
                                                    {r.time} - {r.exitTime?.split(' ')[1] || '...'}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100/50 rounded-full"
                                            onClick={() => handleCancelSpecificReservation(r.id)}
                                            title="Supprimer cette réservation"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {selectedElement?.descendants?.length > 0 && !selectedElement?.isReserved && (
                            <SheetDescription className="text-orange-600 border-l-2 border-orange-400 pl-2 mt-1">
                                Attention : Cette réservation inclura automatiquement {selectedElement.descendants.length} sous-élément(s).
                            </SheetDescription>
                        )}
                        <SheetDescription>Détails de la réservation</SheetDescription>
                    </SheetHeader>

                    <div className="grid gap-5 py-6">
                        {reservationFields.map((field) => {
                            // Unified handling for all fields
                            const isName = field.id === "customerName";
                            const isPhone = field.id === "phone";

                            const value = isName ? formData.customerName :
                                isPhone ? formData.customerPhone :
                                    formData.customFields[field.id] || "";

                            const handleChange = (val: string) => {
                                if (isName) setFormData({ ...formData, customerName: val });
                                else if (isPhone) setFormData({ ...formData, customerPhone: val });
                                else setFormData({
                                    ...formData,
                                    customFields: { ...formData.customFields, [field.id]: val }
                                });
                            };

                            return (
                                <div key={field.id} className="grid gap-2">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor={field.id} className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                            {field.name}
                                        </label>
                                        {field.isRequired && (
                                            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">OBLIGATOIRE</span>
                                        )}
                                    </div>
                                    <div className="relative group">
                                        <Input
                                            id={field.id}
                                            type={field.type === "number" ? "number" : "text"}
                                            value={value}
                                            onChange={(e) => handleChange(e.target.value)}
                                            placeholder={`Saisir ${field.name.toLowerCase()}...`}
                                            className={cn(
                                                "h-10 bg-muted/30 border-border/50 focus:bg-background transition-all",
                                                field.isRequired && !value && "border-red-200"
                                            )}
                                        />
                                        {field.type === "phone" && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                <Phone className="size-4" />
                                            </div>
                                        )}
                                        {field.isRequired && !value && (
                                            <div className="absolute -bottom-4 right-0 text-[9px] text-red-500 font-bold animate-pulse">
                                                Ce champ est requis
                                            </div>
                                        )}
                                    </div>
                                    {/* Explicitly skip OTP for admins as requested */}
                                    {field.type === "phone" && field.isConfirmationRequired && (
                                        <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                                            <Check className="size-3" /> Mode Admin : OTP ignoré
                                        </p>
                                    )}
                                </div>
                            );
                        })}

                        <div className="h-px bg-border my-2" />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Date de passage</label>
                                <Input
                                    type="date"
                                    value={format(formData.date, "yyyy-MM-dd")}
                                    onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
                                    className="h-10 bg-muted/30 border-border/50"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Heure prévue</label>
                                <Input
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="h-10 bg-muted/30 border-border/50"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Offre</label>
                                <Select
                                    value={formData.offer}
                                    onValueChange={(val) => setFormData({ ...formData, offer: val })}
                                >
                                    <SelectTrigger className="h-10 bg-muted/30 border-border/50">
                                        <SelectValue placeholder="Choisir une offre" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pricingPolicies.map((p: string) => (
                                            <SelectItem key={p} value={p}>
                                                {getPricingPolicyLabel(p)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {formData.offer === "free" && (
                                <div className="grid gap-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Heure de fin (Libre)</label>
                                    <Input
                                        type="time"
                                        value={formData.exitTimeFree}
                                        onChange={(e) => setFormData({ ...formData, exitTimeFree: e.target.value })}
                                        className="h-10 bg-muted/30 border-border/50"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="notes" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Notes & Commentaires</label>
                            <Input
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Demandes spéciales (ex: à côté de la fenêtre)..."
                                disabled={selectedElement?.isReserved}
                                className="h-10 bg-muted/30 border-border/50"
                            />
                        </div>
                    </div>

                    <SheetFooter>
                        <div className="flex gap-2 w-full justify-end">
                            <SheetClose asChild>
                                <Button variant="outline">Annuler</Button>
                            </SheetClose>
                            <Button onClick={handleSaveReservation}>Confirmer la réservation</Button>
                        </div>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div >
    );
}
