"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "@/mock-data/bookmarks";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExcalidrawWrapper } from "@/components/excalidraw-wrapper";
import { MapPin, ExternalLink, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function BookmarkDetail() {
    const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleOpen = (e: any) => {
            setSelectedBookmark(e.detail);
            setIsOpen(true);
        };

        window.addEventListener("open-bookmark-detail", handleOpen);
        return () => window.removeEventListener("open-bookmark-detail", handleOpen);
    }, []);

    if (!selectedBookmark) return null;

    const handleUseTemplate = () => {
        // Here you would implement the logic to copy the template to the user's current project/event
        alert(`Le modèle "${selectedBookmark.title}" a été appliqué !`);
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent side="right" className="w-full sm:max-w-3xl p-0 flex flex-col gap-0 border-l-0">
                <div className="flex flex-col h-full">
                    {/* Header Section */}
                    <div className="p-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <SheetHeader className="space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                                        {selectedBookmark.title}
                                        {selectedBookmark.isFavorite && (
                                            <Sparkles className="size-5 fill-yellow-400 text-yellow-400" />
                                        )}
                                    </SheetTitle>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="size-4" />
                                        <span className="text-sm">{selectedBookmark.location || "Antananarivo"}</span>
                                    </div>
                                </div>
                                <Button asChild variant="outline" size="sm" className="gap-2">
                                    <a href={selectedBookmark.url} target="_blank" rel="noopener noreferrer">
                                        Voir sur Maps
                                        <ExternalLink className="size-4" />
                                    </a>
                                </Button>
                            </div>

                            <SheetDescription className="text-base leading-relaxed">
                                {selectedBookmark.description}
                            </SheetDescription>

                            <div className="flex flex-wrap gap-2">
                                {selectedBookmark.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border-0">
                                        #{tag}
                                    </Badge>
                                ))}
                            </div>
                        </SheetHeader>
                    </div>

                    {/* Excalidraw View Section */}
                    <div className="flex-1 relative bg-muted/30 overflow-hidden">
                        <div className="absolute inset-0 z-0">
                            {selectedBookmark.floorId ? (
                                <ExcalidrawWrapper
                                    floorId={selectedBookmark.floorId}
                                    viewMode={true}
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground p-12 text-center bg-muted/10">
                                    <div className="max-w-md space-y-4">
                                        <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                                            <MapPin className="size-8" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-foreground">Aperçu non disponible</h3>
                                        <p className="text-sm">Le floorplan de cet espace n'a pas encore été numérisé dans la plateforme.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Overlay Controls */}
                        <div className="absolute bottom-6 left-6 right-6 z-10 flex items-center justify-between pointer-events-none">
                            <div className="px-3 py-1.5 rounded-full bg-background/80 backdrop-blur border text-[10px] font-medium text-muted-foreground pointer-events-auto shadow-sm">
                                Mode Aperçu : Interactif (Zoom & Déplacement)
                            </div>
                        </div>
                    </div>

                    {/* Footer Action */}
                    <div className="p-6 border-t bg-background">
                        <Button
                            className="w-full h-12 text-base font-semibold gap-3 shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all"
                            onClick={handleUseTemplate}
                        >
                            <CheckCircle2 className="size-5" />
                            Utiliser ce modèle d'espace
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
