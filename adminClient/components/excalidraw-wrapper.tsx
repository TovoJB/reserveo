"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";

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
}

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
    let t: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
    };
}

const PRICE_UNITS = [
    { value: "minute", label: "Minute" },
    { value: "hour", label: "Heure" },
    { value: "day", label: "Jour" },
    { value: "half_day", label: "Demi-journée" },
    { value: "full_day", label: "Journée" },
    { value: "week", label: "Semaine" },
    { value: "month", label: "Mois" },
    { value: "year", label: "Année" },
];

const DAYS = [
    { id: 1, label: "Lun" },
    { id: 2, label: "Mar" },
    { id: 3, label: "Mer" },
    { id: 4, label: "Jeu" },
    { id: 5, label: "Ven" },
    { id: 6, label: "Sam" },
    { id: 0, label: "Dim" },
];

export function ExcalidrawWrapper({ floorId }: ExcalidrawWrapperProps) {

    const [initialData, setInitialData] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
    const [selectedElement, setSelectedElement] = useState<ExcalidrawElement | null>(null);

    // État pour mémoriser la vue avant le survol
    const [initialView, setInitialView] = useState<{ scrollX: number, scrollY: number, zoom: any } | null>(null);

    /* ---------------- LOAD & SAVE ---------------- */
    useEffect(() => {
        setIsLoaded(false);
        const stored = localStorage.getItem(`reserveo-floor-${floorId}`);
        setInitialData(stored ? JSON.parse(stored) : null);
        setIsLoaded(true);
    }, [floorId]);

    const saveData = useCallback((elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
        const isVisualEffectActive = elements.some(el => el.opacity && el.opacity < 20);
        if (isVisualEffectActive) return;

        localStorage.setItem(`reserveo-floor-${floorId}`, JSON.stringify({
            elements,
            appState: { ...appState, collaborators: [] },
            files,
        }));
    }, [floorId]);

    const debouncedSave = useCallback(debounce(saveData, 1000), [saveData]);

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
        return allNamedElements.filter((el) => childIds.includes(el.id));
    }, [selectedElement, allNamedElements]);

    // Check if 'targetId' is a descendant of 'currentId' to prevent cycles
    const isDescendant = (currentId: string, targetId: string, visited = new Set<string>()): boolean => {
        if (visited.has(currentId)) return false;
        visited.add(currentId);

        const currentElement = allNamedElements.find(el => el.id === currentId);
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
                onChange={(elements, appState, files) => {
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

                        {selectedElement.type === "image" && (
                            <div>
                                <button
                                    onClick={handleRemoveBackground}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors text-xs font-semibold"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M7 21a4 4 0 0 1-4-4V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v12a4 4 0 0 1-4 4zm0 0h12a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2.343M11 7.343l1.657-1.343 1.657 1.343" />
                                    </svg>
                                    Retirer le fond (IA)
                                </button>
                            </div>
                        )}

                        <div className={`space-y-4 transition-all duration-200 ${!selectedElement.customData?.name?.trim() ? "opacity-30 pointer-events-none filter grayscale" : ""}`}>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-bold text-blue-600 uppercase block mb-1">Prix (Ar)</label>
                                    <input
                                        className="w-full px-2 py-1.5 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        type="number"
                                        value={selectedElement.customData?.price || ""}
                                        onChange={(e) => updateCustomData("price", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-blue-600 uppercase block mb-1">Unité</label>
                                    <select
                                        className="w-full px-2 py-1.5 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        value={selectedElement.customData?.priceUnit || "hour"}
                                        onChange={(e) => updateCustomData("priceUnit", e.target.value)}
                                    >
                                        {PRICE_UNITS.map((unit) => (
                                            <option key={unit.value} value={unit.value}>
                                                {unit.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-blue-600 uppercase block mb-1">Jours Ouvrables</label>
                                    <div className="flex flex-wrap gap-1">
                                        {DAYS.map((day) => {
                                            const isSelected = (selectedElement.customData?.workingDays || []).includes(day.id);
                                            return (
                                                <button
                                                    key={day.id}
                                                    onClick={() => {
                                                        const currentDays = selectedElement.customData?.workingDays || [];
                                                        const newDays = isSelected
                                                            ? currentDays.filter((d: number) => d !== day.id)
                                                            : [...currentDays, day.id];
                                                        updateCustomData("workingDays", newDays);
                                                    }}
                                                    className={`px-2 py-1 text-xs rounded border transition-colors ${isSelected
                                                        ? "bg-blue-600 text-white border-blue-600"
                                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    {day.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 border-t">
                                <label className="text-[10px] font-bold text-green-600 uppercase block mb-2">Enfants liés</label>

                                <div className="space-y-1 mb-3">
                                    {childrenList.map((child) => (
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
                                <div className="max-h-32 overflow-y-auto border rounded bg-gray-50 text-xs divide-y border-gray-200">
                                    {allNamedElements
                                        .filter(el =>
                                            el.id !== selectedElement.id &&
                                            !(selectedElement.customData?.children || []).includes(el.id) &&
                                            !isDescendant(el.id, selectedElement.id) // Prevent cycles: check if selectedElement is already a descendant of candidate el
                                        )
                                        .map(el => (
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