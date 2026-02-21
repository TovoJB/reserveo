"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import { useTypesStore, getPricingPolicyLabel } from "@/store/types-store";
import { cn } from "@/lib/utils";
import { Box } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// Types simplifiés
type ExcalidrawElement = any;
type AppState = any;
type BinaryFiles = any;



const Excalidraw = dynamic(
    () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
    { ssr: false }
);

interface ExcalidrawWrapperProps {
    floorId: string;
    viewMode?: boolean;
    onElementsChange?: (elements: any[]) => void;
    focusedElementId?: string | null;
}

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
    let t: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
    };
}


export function ExcalidrawWrapper({ floorId, viewMode = false, onElementsChange, focusedElementId }: ExcalidrawWrapperProps) {

    const [initialData, setInitialData] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
    const [selectedElement, setSelectedElement] = useState<ExcalidrawElement | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const { emplacementTypes, pricingPolicies, openingHours } = useTypesStore();

    // État pour mémoriser la vue avant le survol
    const [initialView, setInitialView] = useState<{ scrollX: number, scrollY: number, zoom: any } | null>(null);

    useEffect(() => {
        setSearchTerm("");
    }, [selectedElement?.id]);

    // Utiliser une ref pour onElementsChange pour éviter les boucles infinies
    const onElementsChangeRef = useRef(onElementsChange);
    useEffect(() => {
        onElementsChangeRef.current = onElementsChange;
    }, [onElementsChange]);

    /* ---------------- LOAD & SAVE ---------------- */
    const loadFloorData = useCallback(async () => {
        const stored = localStorage.getItem(`reserveo-floor-${floorId}`);
        let hasData = false;

        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.elements && parsed.elements.length > 0) {
                setInitialData(parsed);
                if (onElementsChangeRef.current) {
                    onElementsChangeRef.current(parsed.elements);
                }
                hasData = true;
            }
        }

        if (!hasData && floorId === "default-plan") {
            try {
                const res = await fetch('/data/florplan1.excalidraw');
                const data = await res.json();
                setInitialData(data);
                if (onElementsChangeRef.current) {
                    onElementsChangeRef.current(data.elements || []);
                }
                localStorage.setItem(`reserveo-floor-${floorId}`, JSON.stringify(data));
            } catch (err) {
                console.error("Failed to fetch default plan:", err);
            }
        } else if (!hasData) {
            setInitialData(null);
            if (onElementsChangeRef.current) {
                onElementsChangeRef.current([]);
            }
        }
    }, [floorId]);

    useEffect(() => {
        const init = async () => {
            setIsLoaded(false);
            await loadFloorData();
            setIsLoaded(true);
        };
        init();
    }, [floorId, loadFloorData]);

    // Écouter les changements du localStorage depuis d'autres onglets uniquement
    useEffect(() => {
        // Événement pour les changements dans d'autres onglets
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === `reserveo-floor-${floorId}` && e.newValue) {
                const parsed = JSON.parse(e.newValue);
                setInitialData(parsed);
                if (onElementsChangeRef.current) {
                    onElementsChangeRef.current(parsed.elements || []);
                }
                // Mettre à jour la scène Excalidraw si l'API est disponible
                if (excalidrawAPI) {
                    excalidrawAPI.updateScene({
                        elements: parsed.elements || []
                    });
                }
            }
        };

        // Événement personnalisé pour mettre à jour SEULEMENT la liste (pas la scène Excalidraw)
        // Cela évite les boucles infinies en viewMode
        const handleListUpdate = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail.floorId === floorId && viewMode) {
                const { elements } = customEvent.detail;
                if (onElementsChangeRef.current) {
                    onElementsChangeRef.current(elements);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('reserveo-list-update', handleListUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('reserveo-list-update', handleListUpdate);
        };
    }, [floorId, excalidrawAPI, viewMode]);


    const saveData = useCallback((elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
        const isVisualEffectActive = elements.some(el => el.opacity && el.opacity < 20);
        if (isVisualEffectActive) return;

        const data = {
            elements,
            appState: { ...appState, collaborators: [] },
            files,
        };

        localStorage.setItem(`reserveo-floor-${floorId}`, JSON.stringify(data));

        // Émettre un événement pour mettre à jour les listes dans les vues en viewMode
        window.dispatchEvent(new CustomEvent('reserveo-list-update', {
            detail: { floorId, elements: [...elements] }
        }));

        if (onElementsChangeRef.current) {
            onElementsChangeRef.current([...elements]);
        }
    }, [floorId]);

    const debouncedSave = useCallback(debounce(saveData, 1000), [saveData]);

    // Handle external focus
    const lastFocusedIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (!excalidrawAPI || !focusedElementId || focusedElementId === lastFocusedIdRef.current) return;

        lastFocusedIdRef.current = focusedElementId;
        focusOnElement(focusedElementId);

        // Reset focus after animation/delay if needed, or keep it. 
        // For now, let's keep the highlight until focusedElementId changes or is cleared?
        // Actually, the original focusOnElement sets opacity on others to 15. 
        // We might want to clear that when focusedElementId becomes null.
    }, [focusedElementId, excalidrawAPI]);

    useEffect(() => {
        if (!excalidrawAPI) return;
        if (focusedElementId === null && lastFocusedIdRef.current !== null) {
            resetFocus();
            lastFocusedIdRef.current = null;
        }
    }, [focusedElementId, excalidrawAPI]);

    /**
     * Forcer le zoom initial pour tout voir au chargement d'un étage
     * Cela règle le problème du zoom "trop grand" (trop près) au départ.
     */
    useEffect(() => {
        if (excalidrawAPI && isLoaded && initialData) {
            const timer = setTimeout(() => {
                const elements = excalidrawAPI.getSceneElements();
                if (elements.length > 0) {
                    excalidrawAPI.scrollToContent(elements, {
                        padding: 150, // On augmente le padding pour dézoomer davantage et tout voir
                        animate: true,
                    });
                }
            }, 600); // Un léger délai pour laisser Excalidraw charger les données dans la scène
            return () => clearTimeout(timer);
        }
    }, [excalidrawAPI, floorId, isLoaded, initialData]);


    const handleRemoveBackground = async () => {
        const elements = excalidrawAPI.getSceneElements();
        const selectedElements = elements.filter((el: any) => el.isSelected);

        // Logique pour traiter l'image sélectionnée ici
        console.log("Traitement de :", selectedElements);
    };

    /* ---------------- LOGIQUE DES ELEMENTS ---------------- */
    const updateSceneElements = (callback: (el: any) => any) => {
        if (!excalidrawAPI) return;
        excalidrawAPI.updateScene({
            elements: excalidrawAPI.getSceneElements().map(callback)
        });
    };

    const addChildToSelected = (childId: string) => {
        if (!selectedElement) return;
        const currentChildren = selectedElement.customData?.children || [];
        if (currentChildren.includes(childId)) return;

        updateSceneElements((el) =>
            el.id === selectedElement.id
                ? { ...el, customData: { ...el.customData, children: [...currentChildren, childId] } }
                : el
        );
        resetFocus();
    };

    const removeChildFromSelected = (childId: string) => {
        if (!selectedElement) return;
        updateSceneElements((el) =>
            el.id === selectedElement.id
                ? { ...el, customData: { ...el.customData, children: (el.customData?.children || []).filter((id: string) => id !== childId) } }
                : el
        );
        resetFocus();
    };

    const updateCustomData = (key: string, value: any) => {
        if (!selectedElement) return;
        updateSceneElements((el) =>
            el.id === selectedElement.id ? { ...el, customData: { ...(el.customData || {}), [key]: value } } : el
        );
    };

    /* ---------------- FOCUS ET RESTAURATION FLUIDE ---------------- */
    const focusOnElement = (elementId: string) => {
        if (!excalidrawAPI) return;

        const appState = excalidrawAPI.getAppState();
        // Sauvegarde de la vue initiale une seule fois au début du survol
        if (!initialView) {
            setInitialView({
                scrollX: appState.scrollX,
                scrollY: appState.scrollY,
                zoom: appState.zoom
            });
        }

        const allElements = excalidrawAPI.getSceneElements();
        const target = allElements.find((e: any) => e?.id === elementId);
        if (!target) return;

        // Zoom fluide sur la cible
        excalidrawAPI.scrollToContent(target, { padding: 150, animate: true, duration: 400 });

        // Effet visuel
        excalidrawAPI.updateScene({
            elements: allElements.map((el: any) => ({
                ...el,
                opacity: el.id === elementId ? 100 : 15
            }))
        });
    };

    const resetFocus = () => {
        if (!excalidrawAPI) return;

        // 1. Restaurer l'opacité immédiatement
        excalidrawAPI.updateScene({
            elements: excalidrawAPI.getSceneElements().map((el: any) => ({
                ...el,
                opacity: 100
            }))
        });

        // 2. Retour fluide à la position initiale
        if (initialView) {
            excalidrawAPI.updateScene({
                appState: {
                    scrollX: initialView.scrollX,
                    scrollY: initialView.scrollY,
                    zoom: initialView.zoom,
                    shouldCacheIgnoreZoom: false // Assure une transition propre
                }
            });
            setInitialView(null);
        } else {
            // Si pas de vue initiale, on dézoome pour tout voir de manière fluide
            excalidrawAPI.scrollToContent(excalidrawAPI.getSceneElements(), {
                padding: 100,
                animate: true,
                duration: 400
            });
        }
    };

    /* ---------------- HELPERS ---------------- */
    const allNamedElements = useMemo(() => {
        return excalidrawAPI ? excalidrawAPI.getSceneElements().filter((el: any) => el?.customData?.name) : [];
    }, [excalidrawAPI, selectedElement]); // Depend on selectedElement to refresh when structure changes

    const childrenList = useMemo(() => {
        const childIds = selectedElement?.customData?.children || [];
        return allNamedElements.filter((el: any) => childIds.includes(el.id));
    }, [selectedElement, allNamedElements]);

    // Check if 'targetId' is a descendant of 'currentId' to prevent cycles
    const isDescendant = (currentId: string, targetId: string, visited = new Set<string>()): boolean => {
        if (visited.has(currentId)) return false;
        visited.add(currentId);

        const currentElement = allNamedElements.find((el: any) => el.id === currentId);
        if (!currentElement) return false;

        const children = currentElement.customData?.children || [];
        if (children.includes(targetId)) return true;

        return children.some((childId: string) => isDescendant(childId, targetId, visited));
    };




    if (!isLoaded) return null;

    return (
        <div className="fixed inset-0 bg-white">

            <Excalidraw
                key={floorId}
                excalidrawAPI={(api) => setExcalidrawAPI(api)}
                initialData={initialData || undefined}
                viewModeEnabled={viewMode}
                onChange={(elements, appState, files) => {
                    // En viewMode, ne rien faire (pas de sauvegarde, pas de notification)
                    if (viewMode) return;

                    debouncedSave(elements, appState, files);
                    const selectedIds = appState.selectedElementIds;
                    const id = Object.keys(selectedIds || {})[0];
                    const el = elements.find((e) => e?.id === id);
                    setSelectedElement(el && ["rectangle", "ellipse", "diamond", "image"].includes(el.type) ? el : null);
                }}
            />

            {selectedElement && (
                <div className="absolute top-4 right-4 z-50 bg-white text-black border border-gray-300 rounded-lg shadow-2xl p-4 w-72 overflow-y-auto max-h-[90vh]">
                    <h3 className="font-bold mb-3 border-b pb-2 flex items-center justify-between text-sm">
                        Élément sélectionné
                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-400 font-mono italic">
                            {selectedElement.id.slice(0, 5)}
                        </span>
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-blue-600 uppercase block mb-1">Nom</label>
                            <input
                                className="w-full px-2 py-1.5 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                value={selectedElement.customData?.name || ""}
                                onChange={(e) => updateCustomData("name", e.target.value)}
                                autoFocus={!selectedElement.customData?.name}
                                placeholder="Nom requis..."
                            />
                        </div>

                        <div className="pt-2">
                            <div className="flex items-center justify-between p-3 rounded-xl border bg-slate-50/50 hover:bg-slate-50 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "size-8 rounded-lg flex items-center justify-center transition-colors",
                                        (selectedElement.customData?.isReservable !== false)
                                            ? "bg-emerald-100 text-emerald-600"
                                            : "bg-slate-200 text-slate-500"
                                    )}>
                                        <Box className="size-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-tight">Objet Réservable</p>
                                        <p className="text-[9px] text-muted-foreground italic">
                                            {(selectedElement.customData?.isReservable !== false) ? "Actif pour réservation" : "Objet de décor"}
                                        </p>
                                    </div>
                                </div>
                                <Checkbox
                                    id="isReservable"
                                    checked={selectedElement.customData?.isReservable !== false}
                                    onCheckedChange={(checked) => updateCustomData("isReservable", !!checked)}
                                    className="data-[state=checked]:bg-emerald-500 border-emerald-200"
                                />
                            </div>
                        </div>

                        <div className={`space-y-4 transition-all duration-300 ${(!selectedElement.customData?.name?.trim() || selectedElement.customData?.isReservable === false) ? "opacity-30 pointer-events-none filter grayscale overflow-hidden" : ""}`}>
                            <div>
                                <label className="text-[10px] font-bold text-blue-600 uppercase block mb-1">Type d'emplacement</label>
                                <div className="space-y-2">
                                    <input
                                        className="w-full px-2 py-1.5 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        list="emplacement-types"
                                        value={selectedElement.customData?.type || ""}
                                        onChange={(e) => updateCustomData("type", e.target.value)}
                                        placeholder="Chaise, Table, etc..."
                                    />
                                    <datalist id="emplacement-types">
                                        {emplacementTypes.map((t) => (
                                            <option key={t.id} value={t.name} />
                                        ))}
                                    </datalist>
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                        {emplacementTypes.slice(0, 5).map((t) => (
                                            <button
                                                key={t.id}
                                                onClick={() => updateCustomData("type", t.name)}
                                                className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${selectedElement.customData?.type === t.name
                                                    ? "bg-blue-600 border-blue-600 text-white"
                                                    : "bg-white border-gray-200 text-gray-500 hover:border-blue-400"
                                                    }`}
                                            >
                                                {t.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="p-2 border border-blue-100 bg-blue-50/30 rounded-lg">
                                    <label className="text-[10px] font-bold text-blue-600 uppercase block mb-3">Tarification (Options Actives)</label>
                                    <div className="space-y-2">
                                        {pricingPolicies.map((policy) => {
                                            const prices = selectedElement.customData?.prices || {};
                                            // Handle legacy data visually
                                            const legacyPrice = (selectedElement.customData?.priceUnit === policy || (!selectedElement.customData?.priceUnit && policy === "hour")) ? selectedElement.customData?.price : "";
                                            const val = prices[policy] !== undefined ? prices[policy] : legacyPrice;

                                            if (policy === "free") return null;

                                            return (
                                                <div key={policy} className="flex items-center gap-2">
                                                    <span className="text-[10px] font-semibold w-24 truncate text-slate-600" title={getPricingPolicyLabel(policy)}>
                                                        {getPricingPolicyLabel(policy)}
                                                    </span>
                                                    <div className="relative flex-1">
                                                        <input
                                                            className="w-full pl-2 pr-6 py-1.5 border border-slate-200 rounded-md bg-white focus:ring-2 focus:ring-blue-500 outline-none text-xs transition-shadow"
                                                            type="number"
                                                            placeholder="Non défini"
                                                            value={val || ""}
                                                            onChange={(e) => {
                                                                const newPrices = { ...(selectedElement.customData?.prices || {}) };
                                                                if (e.target.value === "") {
                                                                    delete newPrices[policy];
                                                                } else {
                                                                    newPrices[policy] = e.target.value;
                                                                }
                                                                updateCustomData("prices", newPrices);

                                                                // Sync legacy field for backwards compatibility if needed
                                                                if (Object.keys(newPrices).length === 1 || policy === selectedElement.customData?.priceUnit) {
                                                                    updateCustomData("price", e.target.value);
                                                                    updateCustomData("priceUnit", policy);
                                                                }
                                                            }}
                                                        />
                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">Ar</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {(Object.values(selectedElement.customData?.prices || {}).some(val => val !== undefined && val !== "") || selectedElement.customData?.price) && (
                                        <div className="mt-3 pt-2 border-t border-blue-100 flex flex-col gap-1">
                                            <span className="text-[9px] font-bold text-blue-700 mb-1">Aperçu :</span>
                                            {pricingPolicies.filter(p => p !== "free").map(p => {
                                                const pValue = selectedElement.customData?.prices?.[p] || ((selectedElement.customData?.priceUnit === p || (!selectedElement.customData?.priceUnit && p === "hour")) ? selectedElement.customData?.price : undefined);
                                                if (!pValue) return null;
                                                return (
                                                    <div key={p} className="flex justify-between items-center text-[10px] text-blue-800">
                                                        <span>{getPricingPolicyLabel(p)} :</span>
                                                        <span className="font-mono font-bold bg-white px-1 rounded">{pValue} Ar</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-blue-600 uppercase block mb-1">Jours Ouvrables</label>
                                    <div className="flex flex-wrap gap-1">
                                        {Object.entries(openingHours).map(([day, config]) => {
                                            const isSelected = (selectedElement.customData?.workingDays || []).includes(day);
                                            return (
                                                <button
                                                    key={day}
                                                    onClick={() => {
                                                        const currentDays = selectedElement.customData?.workingDays || [];
                                                        const newDays = isSelected
                                                            ? currentDays.filter((d: string) => d !== day)
                                                            : [...currentDays, day];
                                                        updateCustomData("workingDays", newDays);
                                                    }}
                                                    className={cn(
                                                        "px-2 py-1 text-[10px] rounded border transition-colors",
                                                        isSelected
                                                            ? "bg-blue-600 text-white border-blue-600"
                                                            : !config.isOpen
                                                                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                                    )}
                                                    disabled={!config.isOpen}
                                                >
                                                    {day.slice(0, 3)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-[9px] text-muted-foreground mt-1 italic">
                                        Seules les jounées cochées dans Paramètres sont activables.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-2 border-t">
                                <label className="text-[10px] font-bold text-green-600 uppercase block mb-2">Enfants liés</label>

                                <div className="space-y-1 mb-3">
                                    {childrenList.map((child: any) => (
                                        <div
                                            key={child.id}
                                            className="flex items-center justify-between bg-green-50 p-1.5 rounded border border-green-100 text-xs transition-all hover:shadow-sm"
                                            onMouseEnter={() => focusOnElement(child.id)}
                                            onMouseLeave={resetFocus}
                                        >
                                            <span className="truncate flex-1 font-medium">🔗 {child.customData.name}</span>
                                            <button
                                                onClick={() => removeChildFromSelected(child.id)}
                                                className="ml-2 p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded transition-colors"
                                            >
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    ))}
                                    {childrenList.length === 0 && (
                                        <p className="text-[10px] text-gray-400 italic">Aucun élément lié.</p>
                                    )}
                                </div>

                                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Lier un nouvel élément</label>
                                <div className="mb-2">
                                    <input
                                        type="text"
                                        placeholder="🔍 Rechercher..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-2 py-1 text-xs border rounded bg-white focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-gray-300"
                                    />
                                </div>
                                <div className="max-h-32 overflow-y-auto border rounded bg-gray-50 text-xs divide-y border-gray-200">
                                    {allNamedElements
                                        .filter((el: any) => {
                                            const matchesSearch = !searchTerm || (el.customData?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
                                            return matchesSearch &&
                                                el.id !== selectedElement.id &&
                                                !(selectedElement.customData?.children || []).includes(el.id) &&
                                                !isDescendant(el.id, selectedElement.id);
                                        })
                                        .map((el: any) => (
                                            <div
                                                key={el.id}
                                                className="p-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center group transition-all"
                                                onClick={() => addChildToSelected(el.id)}
                                                onMouseEnter={() => focusOnElement(el.id)}
                                                onMouseLeave={resetFocus}
                                            >
                                                <span className="truncate">{el.customData.name}</span>
                                                <span className="text-[9px] text-blue-500 font-bold opacity-0 group-hover:opacity-100">+ LIER</span>
                                            </div>
                                        ))}
                                    {allNamedElements.length <= 1 && (
                                        <div className="p-4 text-center text-[10px] text-gray-400">
                                            Nommez d'autres éléments pour les lier ici.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6" />
    </svg>
);