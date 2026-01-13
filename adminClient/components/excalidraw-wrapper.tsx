"use client";

import { useEffect, useState, useCallback } from "react";
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

// debounce util
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
    let t: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
    };
}

export function ExcalidrawWrapper({ floorId }: ExcalidrawWrapperProps) {
    const [initialData, setInitialData] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
    const [selectedElement, setSelectedElement] = useState<ExcalidrawElement | null>(null);

    /* ---------------- LOAD DATA ---------------- */
    useEffect(() => {
        setIsLoaded(false);
        const stored = localStorage.getItem(`reserveo-floor-${floorId}`);
        setInitialData(stored ? JSON.parse(stored) : null);
        setIsLoaded(true);
    }, [floorId]);

    /* ---------------- SAVE DATA ---------------- */
    const saveData = useCallback(
        (elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
            localStorage.setItem(
                `reserveo-floor-${floorId}`,
                JSON.stringify({
                    elements,
                    appState: { ...appState, collaborators: [] },
                    files,
                })
            );
        },
        [floorId]
    );

    const debouncedSave = useCallback(debounce(saveData, 800), [saveData]);

    /* ---------------- UPDATE CUSTOM DATA ---------------- */
    const updateCustomData = (key: string, value: any) => {
        if (!excalidrawAPI || !selectedElement) return;

        excalidrawAPI.updateScene({
            elements: excalidrawAPI.getSceneElements().map((el: any) =>
                el?.id === selectedElement.id
                    ? {
                        ...el,
                        customData: { ...(el.customData || {}), [key]: value },
                    }
                    : el
            ),
        });
    };

    /* ---------------- ADD CHILD ---------------- */
    const addChildToSelected = (childId: string) => {
        if (!excalidrawAPI || !selectedElement) return;

        excalidrawAPI.updateScene({
            elements: excalidrawAPI.getSceneElements().map((el: any) =>
                el?.id === selectedElement.id
                    ? {
                        ...el,
                        customData: {
                            ...(el.customData || {}),
                            children: [...(el.customData?.children || []), childId],
                        },
                    }
                    : el
            ),
        });
    };

    /* ---------------- FOCUS ELEMENT ---------------- */
    const focusOnElement = (elementId: string) => {
        if (!excalidrawAPI) return;

        const attemptFocus = () => {
            const elements = excalidrawAPI.getSceneElements().filter(Boolean);
            const el = elements.find((e: any) => e?.id === elementId);
            if (!el) {
                setTimeout(attemptFocus, 50);
                return;
            }

            // Scroll uniquement, ne change pas la sélection !
            excalidrawAPI.scrollToContent({
                elements: [el],
                padding: 100,
                duration: 400,
            });
        };

        attemptFocus();
    };


    /* ---------------- NAMED ELEMENTS ---------------- */
    const namedElements: ExcalidrawElement[] = excalidrawAPI
        ? excalidrawAPI.getSceneElements().filter((el: ExcalidrawElement) => el?.customData?.name)
        : [];

    if (!isLoaded) return null;

    return (
        <div className="fixed inset-0 bg-white">
            {/* ----------- EXCALIDRAW ----------- */}
            <Excalidraw
                key={floorId}
                excalidrawAPI={(api) => setExcalidrawAPI(api)}
                initialData={initialData || undefined}
                onChange={(elements, appState, files) => {
                    debouncedSave(elements, appState, files);

                    const selectedIds = appState.selectedElementIds;
                    if (!selectedIds || Object.keys(selectedIds).length === 0) {
                        setSelectedElement(null);
                        return;
                    }

                    const id = Object.keys(selectedIds)[0];
                    const el = elements.filter(Boolean).find((e) => e?.id === id);

                    if (el && typeof el.type === "string" && ["rectangle", "ellipse", "diamond", "image"].includes(el.type)) {
                        setSelectedElement(el);
                    } else {
                        setSelectedElement(null);
                    }
                }}
                UIOptions={{
                    canvasActions: {
                        loadScene: false,
                        saveToActiveFile: false,
                        toggleTheme: true,
                    },
                }}
            />

            {/* ----------- PROPERTY PANEL ----------- */}
            {selectedElement && (
                <div className="absolute top-4 right-4 z-50 bg-white text-black border border-gray-300 rounded-lg shadow-lg p-4 w-64">
                    <h3 className="font-semibold mb-3">Propriétés</h3>

                    <label className="text-sm text-gray-700">Nom</label>
                    <input
                        className="w-full mb-2 px-2 py-1 border border-gray-400 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedElement.customData?.name || ""}
                        onChange={(e) => updateCustomData("name", e.target.value)}
                    />

                    <label className="text-sm text-gray-700">Prix</label>
                    <input
                        type="number"
                        className="w-full mb-2 px-2 py-1 border border-gray-400 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedElement.customData?.price || ""}
                        onChange={(e) => updateCustomData("price", Number(e.target.value))}
                    />

                    <label className="text-sm text-gray-700">Child of</label>
                    <input
                        className="w-full mb-2 px-2 py-1 border border-gray-400 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedElement.customData?.childOf || ""}
                        onChange={(e) => updateCustomData("childOf", e.target.value)}
                    />

                    {/* ----------- ADD CHILD PANEL ----------- */}
                    <h4 className="font-semibold mt-3">Ajouter un Child</h4>
                    <div className="max-h-32 overflow-y-auto border p-2 rounded">
                        {namedElements
                            .filter((el) => el.id !== selectedElement.id)
                            .map((el) => (
                                <div
                                    key={el.id}
                                    className="cursor-pointer p-1 mb-1 rounded hover:bg-blue-100"
                                    onClick={() => addChildToSelected(el.id)}
                                //onMouseEnter={() => focusOnElement(el.id)} // <-- juste scroll, pas de sélection
                                >
                                    {el.customData.name}
                                </div>
                            ))}

                    </div>
                </div>
            )}
        </div>
    );
}
