"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import "@excalidraw/excalidraw/index.css";
import { useTypesStore, getPricingPolicyLabel } from "@/store/types-store";
import { cn } from "@/lib/utils";
import { Box, CloudCheck, CloudUpload, Loader2, Settings, X, PlusCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useSpacePlan, useSaveSpacePlan } from "@/hooks/use-space-plans";
import { useCreateSpace } from "@/hooks/use-spaces";
import { useWorkgroupStore } from "@/store/workgroup-store";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Types
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
    onFilesChange?: (files: Record<string, any>) => void;
    focusedElementId?: string | null;
}

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
    let t: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
    };
}

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6" />
    </svg>
);

export function ExcalidrawWrapper({ floorId, viewMode = false, onElementsChange, onFilesChange, focusedElementId }: ExcalidrawWrapperProps) {
    const router = useRouter();
    const { getToken } = useAuth();
    const [initialData, setInitialData] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
    const [selectedElement, setSelectedElement] = useState<ExcalidrawElement | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [initialView, setInitialView] = useState<{ scrollX: number, scrollY: number, zoom: any } | null>(null);

    // ── Change detection ────────────────────────────────────────────────────────
    // Stores a lightweight fingerprint of the last saved scene.
    // Only structural changes (element geometry, custom data) mark the plan as dirty.
    const savedSceneHash = useRef<string | null>(null);

    /** Compute a deterministic fingerprint that only covers meaningful data */
    const computeSceneHash = useCallback((elements: readonly any[]): string => {
        const sig = elements
            .filter(el => !el.isDeleted)
            .map(el => ({
                id: el.id,
                type: el.type,
                x: Math.round(el.x),
                y: Math.round(el.y),
                w: Math.round(el.width ?? 0),
                h: Math.round(el.height ?? 0),
                angle: el.angle,
                text: el.text,
                customData: el.customData,
                fileId: el.fileId,
            }))
            .sort((a, b) => a.id.localeCompare(b.id));
        return JSON.stringify(sig);
    }, []);

    const { emplacementTypes, pricingPolicies, openingHours } = useTypesStore();

    const onElementsChangeRef = useRef(onElementsChange);
    useEffect(() => {
        onElementsChangeRef.current = onElementsChange;
    }, [onElementsChange]);

    const onFilesChangeRef = useRef(onFilesChange);
    useEffect(() => {
        onFilesChangeRef.current = onFilesChange;
    }, [onFilesChange]);

    const spaceIdNumber = isNaN(parseInt(floorId)) ? null : parseInt(floorId);
    const { data: remoteData, isLoading: isRemoteLoading } = useSpacePlan(spaceIdNumber || floorId);
    const { mutate: saveToCloud, isPending: isSavingToCloud } = useSaveSpacePlan();

    const reconstructFiles = async (files: any) => {
        if (!files) return {};
        const reconstructed: any = {};
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';


        await Promise.all(Object.entries(files).map(async ([id, info]: [string, any]) => {
            if (info.firebaseUrl && !info.dataURL) {
                try {
                    // Use the PUBLIC proxy — works for both admins and anonymous clients
                    const proxyUrl = `${API_BASE}/public/space-plans/proxy-asset?url=${encodeURIComponent(info.firebaseUrl)}`;
                    const response = await fetch(proxyUrl);
                    if (!response.ok) throw new Error(`Proxy error ${response.status}`);
                    const blob = await response.blob();
                    const dataURL = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });
                    reconstructed[id] = { ...info, id, dataURL };
                } catch (e) {
                    console.warn(`[reconstructFiles] Could not load file ${id}:`, e);
                    reconstructed[id] = { ...info, id };
                }
            } else {
                reconstructed[id] = { ...info, id };
            }
        }));
        return reconstructed;
    };

    const loadFloorData = useCallback(async () => {
        if (remoteData) {
            const plan = remoteData.planData || remoteData;
            const reconstructedFiles = await reconstructFiles(plan.files);
            setInitialData({ ...plan, files: reconstructedFiles });
            // Stamp the saved hash so fresh loads don't mark as dirty
            savedSceneHash.current = computeSceneHash(plan.elements || []);
            setHasUnsavedChanges(false);
            if (onElementsChangeRef.current) {
                onElementsChangeRef.current(plan.elements || []);
            }
            if (onFilesChangeRef.current) {
                onFilesChangeRef.current(reconstructedFiles);
            }
            return;
        }

        const stored = localStorage.getItem(`reserveo-floor-${floorId}`);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.elements && parsed.elements.length > 0) {
                setInitialData(parsed);
                savedSceneHash.current = computeSceneHash(parsed.elements || []);
                setHasUnsavedChanges(false);
                if (onElementsChangeRef.current) {
                    onElementsChangeRef.current(parsed.elements || []);
                }
                if (onFilesChangeRef.current && parsed.files) {
                    onFilesChangeRef.current(parsed.files);
                }
                return;
            }
        }

        setInitialData(null);
        savedSceneHash.current = null;
        if (onElementsChangeRef.current) {
            onElementsChangeRef.current([]);
        }
    }, [floorId, remoteData, computeSceneHash]);

    useEffect(() => {
        const init = async () => {
            // Only show loader if we don't have data yet (first mount for this floor)
            if (!initialData) {
                setIsLoaded(false);
            }
            await loadFloorData();
            setIsLoaded(true);
        };
        init();
    }, [floorId, loadFloorData]);

    // Update Excalidraw files if they arrive later (e.g. after async reconstruction)
    useEffect(() => {
        if (excalidrawAPI && initialData?.files) {
            const filesArray = Object.values(initialData.files).filter((f: any) => f.dataURL);
            if (filesArray.length > 0) {
                excalidrawAPI.addFiles(filesArray);
                if (onFilesChangeRef.current) {
                    onFilesChangeRef.current(initialData.files);
                }
            }
        }
    }, [excalidrawAPI, initialData?.files]);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === `reserveo-floor-${floorId}` && e.newValue) {
                const parsed = JSON.parse(e.newValue);
                setInitialData(parsed);
                if (onElementsChangeRef.current) {
                    onElementsChangeRef.current(parsed.elements || []);
                }
                if (excalidrawAPI) {
                    excalidrawAPI.updateScene({ elements: parsed.elements || [] });
                }
            }
        };

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

        // ── Change detection: only mark dirty if the scene actually changed ──
        const currentHash = computeSceneHash(elements);
        const isDirty = savedSceneHash.current !== null
            ? currentHash !== savedSceneHash.current
            : elements.filter(el => !el.isDeleted).length > 0;

        // Enrichir les files depuis la mémoire Excalidraw
        const allFilesInMemory = excalidrawAPI?.getFiles() || {};
        const enrichedFiles: any = {};
        Object.entries({ ...allFilesInMemory, ...files }).forEach(([id, f]: [string, any]) => {
            enrichedFiles[id] = f;
        });

        localStorage.setItem(`reserveo-floor-${floorId}`, JSON.stringify({
            elements,
            appState: { ...appState, collaborators: [] },
            files: enrichedFiles,
        }));

        if (isLoaded && !isRemoteLoading) {
            setHasUnsavedChanges(isDirty);
        }

        window.dispatchEvent(new CustomEvent('reserveo-list-update', {
            detail: { floorId, elements: [...elements] }
        }));

        if (onElementsChangeRef.current) {
            onElementsChangeRef.current([...elements]);
        }
    }, [floorId, isLoaded, isRemoteLoading, excalidrawAPI, computeSceneHash]);

    const debouncedSave = useCallback(debounce(saveData, 1000), [saveData]);


    // NAVIGATION PROTECTION: Warn before leaving with unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = "Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter ?";
                return e.returnValue;
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasUnsavedChanges]);

    const [isInitDialogOpen, setIsInitDialogOpen] = useState(false);
    const [initFormData, setInitFormData] = useState({ name: "", type: "FLOOR" });
    const createSpace = useCreateSpace();
    const { groups, setGroups } = useWorkgroupStore();

    // Prepare name from workgroup if available
    useEffect(() => {
        if (floorId && !initFormData.name) {
            const findName = (items: any[]): string | null => {
                for (const item of items) {
                    if (item.id === floorId || item.floorId === floorId) return item.name;
                    if (item.children) {
                        const found = findName(item.children);
                        if (found) return found;
                    }
                }
                return null;
            };
            const name = findName(groups);
            if (name) setInitFormData(prev => ({ ...prev, name }));
        }
    }, [floorId, groups]);

    const handleManualSave = async (showNotification = true) => {
        if (!excalidrawAPI) return;

        // Si on n'a pas d'ID ou si le plan n'existe pas encore côté serveur
        if (!spaceIdNumber || (!initialData && !isRemoteLoading)) {
            if (showNotification) setIsInitDialogOpen(true);
            return;
        }

        const elements = excalidrawAPI.getSceneElements();
        const appState = excalidrawAPI.getAppState();
        const files = excalidrawAPI.getFiles();
        Object.entries(files).forEach(([id, f]: [string, any]) => {
            console.log(`[Client] File ${id}: hasDataURL=${!!f.dataURL}, hasFirebaseUrl=${!!f.firebaseUrl}`);
        });

        return new Promise((resolve, reject) => {
            saveToCloud({
                spaceId: spaceIdNumber,
                elements: [...elements],
                appState: { ...appState, collaborators: [] },
                files
            }, {
                onSuccess: () => {
                    setHasUnsavedChanges(false);
                    // Update the saved hash to reflect the just-saved state
                    if (excalidrawAPI) {
                        savedSceneHash.current = computeSceneHash(excalidrawAPI.getSceneElements());
                    }
                    if (showNotification) alert("Plan enregistré sur le serveur !");
                    resolve(true);
                },
                onError: (error) => {
                    console.error("Save error:", error);
                    if (showNotification) alert("Erreur lors de l'enregistrement. Veuillez réessayer.");
                    reject(error);
                }
            });
        });
    };

    const handleInitSpace = async () => {
        if (!excalidrawAPI) return;
        try {
            // 1. Créer le Space
            const newSpace = await createSpace.mutateAsync({
                name: initFormData.name,
                spaceType: initFormData.type,
                status: "PUBLISHED"
            });

            // 2. Sauvegarder le Plan pour ce nouveau Space
            const elements = excalidrawAPI.getSceneElements();
            const appState = excalidrawAPI.getAppState();
            const files = excalidrawAPI.getFiles();

            await saveToCloud({
                spaceId: newSpace.id,
                elements: [...elements],
                appState: { ...appState, collaborators: [] },
                files
            });

            // 3. Mettre à jour le store Workgroup pour lier ce fichier à l'ID réel
            const updateWorkgroup = (items: any[]): any[] => {
                return items.map(item => {
                    if (item.id === floorId || item.floorId === floorId) {
                        return { ...item, floorId: String(newSpace.id) };
                    }
                    if (item.children) {
                        return { ...item, children: updateWorkgroup(item.children) };
                    }
                    return item;
                });
            };
            setGroups(updateWorkgroup(groups));

            setHasUnsavedChanges(false);
            setIsInitDialogOpen(false);
            alert("Espace initialisé et plan enregistré !");

            // 4. Rediriger vers l'URL avec le nouvel ID
            router.push(`/dashboard?id=${newSpace.id}`);
        } catch (error) {
            console.error("Init space error:", error);
            alert("Erreur lors de l'initialisation de l'espace.");
        }
    };

    const handleQuit = async () => {
        if (hasUnsavedChanges) {
            const confirmQuit = window.confirm("Vous avez des modifications non enregistrées.\n\nCliquez sur OK pour SAUVEGARDER et quitter.\nCliquez sur ANNULER pour ignorer les changements et quitter.");

            if (confirmQuit) {
                // User wants to save before quitting
                const saved = await handleManualSave(false);
                if (saved) router.push("/dashboard");
            } else {
                // Secondary check: Did they mean "ignore changes" or just "don't leave"?
                // Actually, standard window.confirm only has OK/Cancel.
                // Let's use a more explicit check or just allow "Cancel" to mean stay in many UIs.
                // But the user specifically asked to prevent and apply.

                const ignoreChanges = window.confirm("Voulez-vous vraiment QUITTER SANS SAUVEGARDER ? (Vos modifications cloud seront perdues)");
                if (ignoreChanges) {
                    router.push("/dashboard");
                }
            }
        } else {
            router.push("/dashboard");
        }
    };

    const focusOnElement = useCallback((elementId: string) => {
        if (!excalidrawAPI) return;
        const appState = excalidrawAPI.getAppState();
        if (!initialView) {
            setInitialView({ scrollX: appState.scrollX, scrollY: appState.scrollY, zoom: appState.zoom });
        }
        const allElements = excalidrawAPI.getSceneElements();
        const target = allElements.find((e: any) => e?.id === elementId);
        if (!target) return;
        excalidrawAPI.scrollToContent(target, { padding: 150, animate: true, duration: 400 });
        excalidrawAPI.updateScene({
            elements: allElements.map((el: any) => ({ ...el, opacity: el.id === elementId ? 100 : 15 }))
        });
    }, [excalidrawAPI, initialView]);

    const resetFocus = useCallback(() => {
        if (!excalidrawAPI) return;
        excalidrawAPI.updateScene({ elements: excalidrawAPI.getSceneElements().map((el: any) => ({ ...el, opacity: 100 })) });
        if (initialView) {
            excalidrawAPI.updateScene({
                appState: { scrollX: initialView.scrollX, scrollY: initialView.scrollY, zoom: initialView.zoom, shouldCacheIgnoreZoom: false }
            });
            setInitialView(null);
        } else {
            excalidrawAPI.scrollToContent(excalidrawAPI.getSceneElements(), { padding: 100, animate: true, duration: 400 });
        }
    }, [excalidrawAPI, initialView]);

    useEffect(() => {
        if (!excalidrawAPI || !focusedElementId) return;
        focusOnElement(focusedElementId);
    }, [focusedElementId, excalidrawAPI, focusOnElement]);

    useEffect(() => {
        if (excalidrawAPI && isLoaded && initialData) {
            const timer = setTimeout(() => {
                const elements = excalidrawAPI.getSceneElements();
                if (elements.length > 0) {
                    excalidrawAPI.scrollToContent(elements, { padding: 150, animate: true });
                }
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [excalidrawAPI, floorId, isLoaded, initialData]);

    const updateSceneElements = (callback: (el: any) => any) => {
        if (!excalidrawAPI) return;
        excalidrawAPI.updateScene({ elements: excalidrawAPI.getSceneElements().map(callback) });
    };

    const addChildToSelected = (childId: string) => {
        if (!selectedElement) return;
        const currentChildren = selectedElement.customData?.children || [];
        if (currentChildren.includes(childId)) return;
        updateSceneElements((el) => el.id === selectedElement.id ? { ...el, customData: { ...el.customData, children: [...currentChildren, childId] } } : el);
        resetFocus();
    };

    const removeChildFromSelected = (childId: string) => {
        if (!selectedElement) return;
        updateSceneElements((el) => el.id === selectedElement.id ? { ...el, customData: { ...el.customData, children: (el.customData?.children || []).filter((id: string) => id !== childId) } } : el);
        resetFocus();
    };

    const updateCustomData = (key: string, value: any) => {
        if (!selectedElement) return;
        updateSceneElements((el) => el.id === selectedElement.id ? { ...el, customData: { ...(el.customData || {}), [key]: value } } : el);
    };

    const allNamedElements = useMemo(() => excalidrawAPI ? excalidrawAPI.getSceneElements().filter((el: any) => el?.customData?.name) : [], [excalidrawAPI, selectedElement]);
    const childrenList = useMemo(() => {
        const childIds = selectedElement?.customData?.children || [];
        return allNamedElements.filter((el: any) => childIds.includes(el.id));
    }, [selectedElement, allNamedElements]);

    const isDescendant = (currentId: string, targetId: string, visited = new Set<string>()): boolean => {
        if (visited.has(currentId)) return false;
        visited.add(currentId);
        const currentElement = allNamedElements.find((el: any) => el.id === currentId);
        if (!currentElement) return false;
        const children = currentElement.customData?.children || [];
        if (children.includes(targetId)) return true;
        return children.some((childId: string) => isDescendant(childId, targetId, visited));
    };

    const [showProperties, setShowProperties] = useState(false);

    if (!isLoaded || isRemoteLoading) {
        return (
            <div className="fixed inset-0 bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="size-10 animate-spin text-blue-600" />
                    <p className="text-sm font-medium text-muted-foreground">Chargement du plan...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-white">
            <Excalidraw
                key={floorId}
                excalidrawAPI={(api) => setExcalidrawAPI(api)}
                initialData={initialData || undefined}
                viewModeEnabled={viewMode}
                onChange={(elements, appState, files) => {
                    if (viewMode) return;
                    debouncedSave(elements, appState, files);
                    const selectedIds = appState.selectedElementIds;
                    const id = Object.keys(selectedIds || {})[0];
                    const el = elements.find((e) => e?.id === id);
                    setSelectedElement(el && ["rectangle", "ellipse", "diamond", "image"].includes(el.type) ? el : null);
                }}
                renderTopRightUI={() => (
                    <div className="flex items-center gap-2 p-2">
                        {/* Properties Toggle */}
                        {selectedElement && (
                            <button
                                onClick={() => setShowProperties(!showProperties)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                    showProperties ? "bg-blue-600 text-white shadow-inner" : "bg-white border text-gray-700 hover:bg-gray-50 shadow-sm"
                                )}
                            >
                                <Settings className="size-3.5" />
                                <span>{showProperties ? "FERMER" : "CONFIGURER L'OBJET"}</span>
                            </button>
                        )}

                        {/* Save Button */}
                        {!viewMode && hasUnsavedChanges && (
                            <button
                                onClick={() => handleManualSave(true)}
                                disabled={isSavingToCloud || createSpace.isPending}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-all animate-in fade-in zoom-in-95 disabled:bg-slate-300"
                            >
                                {isSavingToCloud || createSpace.isPending ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                    <CloudUpload className="size-3.5" />
                                )}
                                <span>{isSavingToCloud || createSpace.isPending ? "ENREGISTREMENT..." : "ENREGISTRER"}</span>
                            </button>
                        )}

                        {/* Quit Button */}
                        <button
                            onClick={handleQuit}
                            className="flex items-center justify-center size-8 rounded-lg bg-white border text-gray-400 hover:text-red-600 hover:border-red-200 shadow-sm transition-all"
                            title="Quitter"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                )}
            />

            {/* Properties Panel (Collab/Sidebar style) */}
            {selectedElement && showProperties && (
                <div className="absolute top-16 right-4 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 w-72 max-h-[80vh] overflow-y-auto animate-in fade-in slide-in-from-right-4">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b">
                        <div className="flex items-center gap-2">
                            <Box className="size-4 text-blue-600" />
                            <h3 className="font-bold text-sm">Propriétés de l'objet</h3>
                        </div>
                        <button onClick={() => setShowProperties(false)} className="text-slate-400 hover:text-slate-600">
                            <X className="size-4" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nom / Numéro</label>
                            <input
                                className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                                value={selectedElement.customData?.name || ""}
                                onChange={(e) => updateCustomData("name", e.target.value)}
                                placeholder="Ex: Table 12, VIP..."
                                autoFocus
                            />
                        </div>

                        <div className="p-3 rounded-xl border bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Box className="size-3.5 text-slate-400" />
                                <span className="text-xs font-bold">Objet Réservable</span>
                            </div>
                            <Checkbox
                                id="isReservable"
                                checked={selectedElement.customData?.isReservable !== false}
                                onCheckedChange={(checked) => updateCustomData("isReservable", !!checked)}
                            />
                        </div>

                        {selectedElement.customData?.isReservable !== false && (
                            <div className="space-y-4 pt-2 border-t border-slate-100">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Type d'emplacement</label>
                                    <input
                                        className="w-full px-2 py-1.5 border rounded bg-white text-sm"
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
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Tarification (Prix en Ar)</label>
                                    <div className="space-y-2">
                                        {pricingPolicies.filter(p => p !== "free").map((policy) => (
                                            <div key={policy} className="flex items-center gap-2">
                                                <span className="text-[10px] w-24 text-slate-600">{getPricingPolicyLabel(policy)}</span>
                                                <input
                                                    className="flex-1 px-2 py-1 border rounded bg-white text-xs text-right"
                                                    type="number"
                                                    value={selectedElement.customData?.prices?.[policy] || ""}
                                                    onChange={(e) => {
                                                        const newPrices = { ...(selectedElement.customData?.prices || {}) };
                                                        if (e.target.value === "") delete newPrices[policy];
                                                        else newPrices[policy] = e.target.value;
                                                        updateCustomData("prices", newPrices);
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Ouvert le</label>
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
                                                        "px-1.5 py-1 text-[9px] font-bold rounded border transition-colors",
                                                        isSelected ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-400 border-slate-200"
                                                    )}
                                                    disabled={!config.isOpen}
                                                >
                                                    {day.slice(0, 3).toUpperCase()}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-slate-100">
                                    <label className="text-[10px] font-bold text-green-600 uppercase block mb-2">Enfants liés (Liaison)</label>
                                    <div className="space-y-1 mb-2">
                                        {childrenList.map((child: any) => (
                                            <div
                                                key={child.id}
                                                className="flex items-center justify-between bg-green-50 p-1.5 rounded border border-green-100 text-[10px] transition-all"
                                                onMouseEnter={() => focusOnElement(child.id)}
                                                onMouseLeave={resetFocus}
                                            >
                                                <span className="truncate flex-1 font-medium italic">🔗 {child.customData?.name}</span>
                                                <button
                                                    onClick={() => removeChildFromSelected(child.id)}
                                                    className="ml-2 p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        ))}
                                        {childrenList.length === 0 && (
                                            <p className="text-[10px] text-slate-400 italic">Aucune liaison active.</p>
                                        )}
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="🔍 Lier un objet (recherche)..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-2 py-1.5 text-xs border rounded bg-white focus:ring-1 focus:ring-blue-500 outline-none mb-1"
                                    />
                                    <div className="max-h-24 overflow-y-auto border rounded bg-slate-50 text-[10px] divide-y overflow-x-hidden">
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
                                                    className="p-1.5 hover:bg-blue-50 cursor-pointer flex justify-between items-center group transition-all"
                                                    onClick={() => addChildToSelected(el.id)}
                                                    onMouseEnter={() => focusOnElement(el.id)}
                                                    onMouseLeave={resetFocus}
                                                >
                                                    <span className="truncate">{el.customData?.name}</span>
                                                    <span className="text-[8px] text-blue-500 font-bold opacity-0 group-hover:opacity-100">+ LIER</span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Initialization Dialog */}
            <Dialog open={isInitDialogOpen} onOpenChange={setIsInitDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <PlusCircle className="size-5 text-blue-600" />
                            Initialiser l'espace cloud
                        </DialogTitle>
                        <DialogDescription>
                            Ce plan n'est pas encore enregistré sur le serveur. Veuillez configurer l'espace correspondant pour pouvoir le sauvegarder.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom de l'espace</Label>
                            <Input
                                id="name"
                                value={initFormData.name}
                                onChange={(e) => setInitFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Ex: Étage 1, Zone VIP..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Type d'espace</Label>
                            <Select
                                value={initFormData.type}
                                onValueChange={(val) => setInitFormData(prev => ({ ...prev, type: val }))}
                            >
                                <SelectTrigger id="type">
                                    <SelectValue placeholder="Choisir un type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FLOOR">Étage / Plan entier</SelectItem>
                                    <SelectItem value="ZONE">Zone spécifique</SelectItem>
                                    <SelectItem value="ROOM">Salle</SelectItem>
                                    <SelectItem value="RESTAURANT">Restaurant / Salle à manger</SelectItem>
                                    <SelectItem value="EVENT">Espace Événementiel</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsInitDialogOpen(false)}
                            disabled={createSpace.isPending}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleInitSpace}
                            disabled={!initFormData.name || createSpace.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {createSpace.isPending ? "Création..." : "Initialiser & Enregistrer"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}