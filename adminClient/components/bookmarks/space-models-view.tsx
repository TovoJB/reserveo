"use client";

import * as React from "react";
import {
    Building2, Star, Lock, FileEdit, Search, Globe, Eye, EyeOff,
    MapPin, Layers, ChevronRight, Plus, ArrowRight, CheckCircle2,
    LayoutGrid, List, RefreshCw, Loader2, Sparkles, Users, Car,
    TreePine, Map
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSpaces } from "@/hooks/use-spaces";
import { usePublishSpace } from "@/hooks/use-spaces";
import { Space } from "@/types";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { ExcalidrawWrapper } from "@/components/excalidraw-wrapper";

// ─── Icon map for space types ─────────────────────────────────────────────────
const SPACE_TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    VENUE: { label: "Salle", icon: Building2, color: "bg-blue-500/10 text-blue-600" },
    FLOOR: { label: "Étage", icon: Layers, color: "bg-indigo-500/10 text-indigo-600" },
    PARKING: { label: "Parking", icon: Car, color: "bg-slate-500/10 text-slate-600" },
    ZONE: { label: "Zone", icon: Map, color: "bg-emerald-500/10 text-emerald-600" },
    AREA: { label: "Espace", icon: TreePine, color: "bg-green-500/10 text-green-600" },
    DESK: { label: "Bureau", icon: LayoutGrid, color: "bg-amber-500/10 text-amber-600" },
    ROOM: { label: "Salle", icon: Building2, color: "bg-violet-500/10 text-violet-600" },
    TABLE: { label: "Table", icon: Users, color: "bg-pink-500/10 text-pink-600" },
    CUSTOM: { label: "Personnalisé", icon: Building2, color: "bg-gray-500/10 text-gray-600" },
};

const STATUS_CONFIG = {
    PUBLISHED: { label: "Publié", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    DRAFT: { label: "Brouillon", color: "bg-amber-100 text-amber-700 border-amber-200" },
    PRIVATE: { label: "Privé", color: "bg-violet-100 text-violet-700 border-violet-200" },
    MAINTENANCE: { label: "Maintenance", color: "bg-red-100 text-red-700 border-red-200" },
    ARCHIVED: { label: "Archivé", color: "bg-gray-100 text-gray-500 border-gray-200" },
};

// ─── Space Card ───────────────────────────────────────────────────────────────
function SpaceCard({ space, onSelect, onPublish, isPublishing }: {
    space: Space;
    onSelect: (space: Space) => void;
    onPublish: (id: number) => void;
    isPublishing: boolean;
}) {
    const typeConfig = SPACE_TYPE_CONFIG[space.spaceType] || SPACE_TYPE_CONFIG.CUSTOM;
    const statusConfig = STATUS_CONFIG[space.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.DRAFT;
    const Icon = typeConfig.icon;
    const isPublished = space.status === "PUBLISHED";
    const childCount = (space as any).childSpaces?.length || 0;

    return (
        <div
            className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-200 cursor-pointer flex flex-col"
            onClick={() => onSelect(space)}
        >
            {/* Top gradient bar */}
            <div className={cn("h-1 w-full", isPublished ? "bg-gradient-to-r from-emerald-400 to-teal-500" : "bg-gradient-to-r from-amber-300 to-orange-400")} />

            <div className="p-5 flex-1 flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className={cn("p-2.5 rounded-xl", typeConfig.color)}>
                        <Icon className="size-5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className={cn("text-[10px] font-medium px-2 py-0.5 border", statusConfig.color)}>
                            {statusConfig.label}
                        </Badge>
                        {(space as any).isFavorite && (
                            <Star className="size-4 fill-yellow-400 text-yellow-400" />
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-1 group-hover:text-blue-700 transition-colors">
                        {space.name}
                    </h3>
                    {space.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                            {space.description}
                        </p>
                    )}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-gray-400">
                    {(space.city || space.address) && (
                        <span className="flex items-center gap-1">
                            <MapPin className="size-3" />
                            {space.city || space.address}
                        </span>
                    )}
                    {childCount > 0 && (
                        <span className="flex items-center gap-1">
                            <Layers className="size-3" />
                            {childCount} plan{childCount > 1 ? "s" : ""} lié{childCount > 1 ? "s" : ""}
                        </span>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="px-5 pb-4 flex items-center justify-between gap-2 border-t border-gray-50 pt-3">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs gap-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-0"
                    onClick={(e) => { e.stopPropagation(); onSelect(space); }}
                >
                    Voir les plans
                    <ChevronRight className="size-3" />
                </Button>
                <Button
                    size="sm"
                    variant={isPublished ? "outline" : "default"}
                    className={cn(
                        "h-8 text-xs gap-1.5 font-medium",
                        isPublished
                            ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                    )}
                    disabled={isPublishing}
                    onClick={(e) => {
                        e.stopPropagation();
                        onPublish(space.id);
                    }}
                >
                    {isPublishing ? (
                        <Loader2 className="size-3 animate-spin" />
                    ) : isPublished ? (
                        <><EyeOff className="size-3" /> Dépublier</>
                    ) : (
                        <><Globe className="size-3" /> Publier</>
                    )}
                </Button>
            </div>
        </div>
    );
}

// ─── Space Detail Sheet ───────────────────────────────────────────────────────
function SpaceDetailSheet({ space, onClose }: { space: Space | null; onClose: () => void }) {
    const [activeChildId, setActiveChildId] = React.useState<number | null>(null);
    const children: Space[] = (space as any)?.childSpaces || [];
    const currentPlanSpaceId = activeChildId || space?.id;

    React.useEffect(() => {
        setActiveChildId(null);
    }, [space?.id]);

    if (!space) return null;

    const typeConfig = SPACE_TYPE_CONFIG[space.spaceType] || SPACE_TYPE_CONFIG.CUSTOM;
    const Icon = typeConfig.icon;

    return (
        <Sheet open={!!space} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-4xl p-0 flex flex-col gap-0">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b bg-white shrink-0">
                        <SheetHeader>
                            <div className="flex items-center gap-3 mb-1">
                                <div className={cn("p-2 rounded-xl", typeConfig.color)}>
                                    <Icon className="size-5" />
                                </div>
                                <SheetTitle className="text-xl font-bold">{space.name}</SheetTitle>
                                <Badge variant="outline" className={cn("text-[10px] ml-auto", STATUS_CONFIG[space.status as keyof typeof STATUS_CONFIG]?.color)}>
                                    {STATUS_CONFIG[space.status as keyof typeof STATUS_CONFIG]?.label || space.status}
                                </Badge>
                            </div>
                            {space.description && (
                                <SheetDescription className="text-sm leading-relaxed">
                                    {space.description}
                                </SheetDescription>
                            )}
                        </SheetHeader>

                        {/* Child Spaces Tabs */}
                        {children.length > 0 && (
                            <div className="mt-4">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Plans liés</p>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setActiveChildId(null)}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                                            !activeChildId
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                                        )}
                                    >
                                        <Building2 className="size-3" />
                                        Vue ensemble ({children.length + 1} niveaux)
                                    </button>
                                    {children.map((child) => {
                                        const childConfig = SPACE_TYPE_CONFIG[child.spaceType] || SPACE_TYPE_CONFIG.CUSTOM;
                                        const ChildIcon = childConfig.icon;
                                        return (
                                            <button
                                                key={child.id}
                                                onClick={() => setActiveChildId(child.id)}
                                                className={cn(
                                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                                                    activeChildId === child.id
                                                        ? "bg-blue-600 text-white border-blue-600"
                                                        : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                                                )}
                                            >
                                                <ChildIcon className="size-3" />
                                                {child.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Plan View */}
                    <div className="flex-1 relative bg-gray-50 overflow-hidden">
                        {currentPlanSpaceId ? (
                            <ExcalidrawWrapper
                                floorId={String(currentPlanSpaceId)}
                                viewMode={true}
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                Aucun plan disponible
                            </div>
                        )}

                        {/* Overlay badge */}
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                            <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur border text-[10px] font-medium text-gray-500 shadow-sm">
                                {activeChildId
                                    ? `Plan : ${children.find(c => c.id === activeChildId)?.name || ""}`
                                    : "Vue d'ensemble"}
                                {" "}— Mode aperçu interactif
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-5 border-t bg-white shrink-0">
                        <Button
                            className="w-full h-11 text-sm font-semibold gap-2 bg-blue-600 hover:bg-blue-700"
                            onClick={onClose}
                        >
                            <CheckCircle2 className="size-4" />
                            Utiliser cet espace pour un événement
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

// ─── Main Page Component ───────────────────────────────────────────────────────
export function SpaceModelsView() {
    const { data: spaces = [], isLoading, refetch } = useSpaces(true);
    const { mutate: publishSpace, isPending: isPublishing, variables: publishingId } = usePublishSpace();

    const [search, setSearch] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState<"all" | "PUBLISHED" | "DRAFT" | "PRIVATE">("all");
    const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
    const [selectedSpace, setSelectedSpace] = React.useState<Space | null>(null);

    // Stats
    const totalSpaces = spaces.length;
    const favorites = spaces.filter((s: any) => s.isFavorite).length;
    const privateCount = spaces.filter(s => s.status === "PRIVATE").length;
    const draftCount = spaces.filter(s => s.status === "DRAFT").length;

    // Filter root-level spaces (no parent) — only show root spaces in the card grid
    const rootSpaces = React.useMemo(() => {
        return spaces.filter(s => !(s as any).parentSpaceId);
    }, [spaces]);

    const filtered = React.useMemo(() => {
        return rootSpaces.filter(s => {
            const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
                (s.description || "").toLowerCase().includes(search.toLowerCase());
            const matchStatus = statusFilter === "all" || s.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [rootSpaces, search, statusFilter]);

    const statCards = [
        { label: "Total Espaces", value: totalSpaces, icon: Building2, color: "text-blue-600 bg-blue-50" },
        { label: "Coups de Cœur", value: favorites, icon: Sparkles, color: "text-yellow-600 bg-yellow-50" },
        { label: "Privés", value: privateCount, icon: Lock, color: "text-violet-600 bg-violet-50" },
        { label: "Brouillons", value: draftCount, icon: FileEdit, color: "text-amber-600 bg-amber-50" },
    ];

    return (
        <div className="flex flex-col h-full bg-gray-50/50 overflow-hidden">
            {/* Stats Bar */}
            <div className="px-6 py-5 bg-white border-b shrink-0">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Modèles d'Espaces</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Gérez et publiez vos plans d'espaces pour les événements
                        </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => refetch()} className="gap-2">
                        <RefreshCw className="size-3.5" />
                        Actualiser
                    </Button>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.label} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className={cn("p-2 rounded-lg", stat.color)}>
                                    <Icon className="size-4" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                                    <p className="text-[11px] text-gray-400 leading-none mt-0.5">{stat.label}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Toolbar */}
            <div className="px-6 py-3 bg-white border-b shrink-0 flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                        placeholder="Rechercher un espace..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9 bg-gray-50 border-gray-200 text-sm"
                    />
                </div>

                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                    {(["all", "PUBLISHED", "DRAFT", "PRIVATE"] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={cn(
                                "px-3 py-1 rounded-md text-xs font-medium transition-all",
                                statusFilter === s
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {s === "all" ? "Tous" : STATUS_CONFIG[s]?.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-1 ml-auto">
                    <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setViewMode("grid")}
                    >
                        <LayoutGrid className="size-4" />
                    </Button>
                    <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setViewMode("list")}
                    >
                        <List className="size-4" />
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
                {isLoading ? (
                    <div className="flex items-center justify-center h-48 text-gray-400 gap-3">
                        <Loader2 className="size-6 animate-spin" />
                        <span className="text-sm">Chargement des espaces...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-4 text-center">
                        <div className="p-4 bg-gray-100 rounded-2xl">
                            <Building2 className="size-8 text-gray-400" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold text-gray-700">Aucun espace trouvé</p>
                            <p className="text-sm text-gray-400">
                                {search ? "Essayez une autre recherche" : "Créez votre premier espace dans la barre latérale"}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className={cn(
                        viewMode === "grid"
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                            : "flex flex-col gap-3"
                    )}>
                        {filtered.map((space) => (
                            <SpaceCard
                                key={space.id}
                                space={space}
                                onSelect={setSelectedSpace}
                                onPublish={(id) => publishSpace(id)}
                                isPublishing={isPublishing && publishingId === space.id}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Sheet */}
            <SpaceDetailSheet
                space={selectedSpace}
                onClose={() => setSelectedSpace(null)}
            />
        </div>
    );
}
