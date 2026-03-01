"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import { Loader2 } from "lucide-react";
import { useSpacePlan } from "@/hooks/use-space-plans";

const Excalidraw = dynamic(
    () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
    { ssr: false }
);

interface ExcalidrawWrapperProps {
    floorId: string;
    onElementSelect?: (element: any | null) => void;
    selectedElementId?: string | null;
}

export function ExcalidrawWrapper({ floorId, onElementSelect, selectedElementId }: ExcalidrawWrapperProps) {
    const [initialData, setInitialData] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);

    const { data: remoteData, isLoading: isRemoteLoading } = useSpacePlan(floorId);

    const reconstructFiles = async (files: any) => {
        if (!files) return {};
        const reconstructed: any = {};
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

        await Promise.all(Object.entries(files).map(async ([id, info]: [string, any]) => {
            if (info.firebaseUrl && !info.dataURL) {
                try {
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
                    reconstructed[id] = { ...info, id };
                }
            } else {
                reconstructed[id] = { ...info, id };
            }
        }));
        return reconstructed;
    };

    useEffect(() => {
        const load = async () => {
            if (remoteData) {
                const plan = remoteData.planData || remoteData;
                const files = await reconstructFiles(plan.files);
                setInitialData({ ...plan, files });
                setIsLoaded(true);
            }
        };
        load();
    }, [remoteData]);

    useEffect(() => {
        if (excalidrawAPI && initialData?.files) {
            const filesArray = Object.values(initialData.files).filter((f: any) => f.dataURL);
            if (filesArray.length > 0) {
                excalidrawAPI.addFiles(filesArray);
            }
        }
    }, [excalidrawAPI, initialData?.files]);

    // Focus / Highlight logic
    useEffect(() => {
        if (!excalidrawAPI || !isLoaded) return;

        const elements = excalidrawAPI.getSceneElements();
        if (selectedElementId) {
            excalidrawAPI.updateScene({
                elements: elements.map((el: any) => ({
                    ...el,
                    opacity: el.id === selectedElementId ? 100 : 30
                }))
            });
            const target = elements.find((el: any) => el.id === selectedElementId);
            if (target) {
                excalidrawAPI.scrollToContent(target, { padding: 100, animate: true });
            }
        } else {
            excalidrawAPI.updateScene({
                elements: elements.map((el: any) => ({ ...el, opacity: 100 }))
            });
        }
    }, [selectedElementId, excalidrawAPI, isLoaded]);

    if (isRemoteLoading || !isLoaded) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                <Loader2 className="size-8 animate-spin" />
                <p className="text-sm">Chargement du plan interactif...</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative">
            <Excalidraw
                excalidrawAPI={(api) => setExcalidrawAPI(api)}
                initialData={initialData}
                viewModeEnabled={true}
                onChange={(elements, appState) => {
                    const selectedIds = appState.selectedElementIds;
                    const id = Object.keys(selectedIds || {})[0];
                    if (id && onElementSelect) {
                        const el = elements.find(e => e.id === id);
                        if (el && el.customData?.isReservable !== false) {
                            onElementSelect(el);
                        } else {
                            onElementSelect(null);
                        }
                    } else if (onElementSelect && Object.keys(selectedIds || {}).length === 0) {
                        // Keep current selection if nothing new is clicked? 
                        // Or deselect? Let's say click background = deselect.
                        // Actually Excalidraw in viewMode handles selection differently.
                    }
                }}
            />
        </div>
    );
}