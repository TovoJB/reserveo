"use client";

import React, { useState } from "react";
import {
    Building,
    Layers,
    Car,
    Trees,
    Plus,
    Trash2,
    Edit2,
    MoreVertical,
    ChevronRight,
    Loader2,
    Layout,
    AlertTriangle,
    Globe,
    CheckCircle,
    Lock,
    Wrench,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { useApi } from "@/hooks/use-api";
import { useSpaces } from "@/hooks/use-spaces";
import { useWorkgroupStore } from "@/store/workgroup-store";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function OrganizationView() {
    const api = useApi();
    const { data: spaces, isLoading, refetch } = useSpaces(true); // hierarchical=true
    const { setGroups, groups, deleteItem } = useWorkgroupStore();

    // Helper to find workgroup items by floorId
    const findItemsByFloorId = (items: any[], targetFloorId: string): string[] => {
        let foundIds: string[] = [];
        for (const item of items) {
            if (item.floorId === targetFloorId) {
                foundIds.push(item.id);
            }
            if (item.children) {
                foundIds = [...foundIds, ...findItemsByFloorId(item.children, targetFloorId)];
            }
        }
        return foundIds;
    };

    const syncWorkgroups = async () => {
        try {
            const wgResponse = await api.get("/workgroups");
            if (wgResponse.data && wgResponse.data.data) {
                setGroups(wgResponse.data.data);
            }
        } catch (error) {
            console.error("Error syncing workgroups:", error);
        }
    };

    const [isAddingSpace, setIsAddingSpace] = useState(false);
    const [isEditingSpace, setIsEditingSpace] = useState<any>(null);
    const [targetParentId, setTargetParentId] = useState<number | null>(null);
    const [newSpaceData, setNewSpaceData] = useState({ name: "", type: "FLOOR" });
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState<number | null>(null);

    // Professional Delete Modal States
    const [itemToDelete, setItemToDelete] = useState<{ id: number, name: string, hasChildren: boolean } | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteParentToo, setDeleteParentToo] = useState(false);

    const handleAddSpace = async () => {
        const parentId = targetParentId || rootSpace?.id;
        if (!newSpaceData.name || !parentId) return;

        // Logical icon mapping
        const iconMap: Record<string, string> = {
            'FLOOR': 'Layers',
            'ZONE': 'Layout',
            'PARKING': 'Car',
            'AREA': 'Trees'
        };

        try {
            setIsCreating(true);
            await api.post("/spaces", {
                name: newSpaceData.name,
                spaceType: newSpaceData.type,
                parentSpaceId: parentId,
                icon: iconMap[newSpaceData.type] || 'Folder',
                status: "DRAFT"
            });
            setIsAddingSpace(false);
            setNewSpaceData({ name: "", type: "FLOOR" });
            setTargetParentId(null);
            refetch();
            syncWorkgroups();
        } catch (error) {
            console.error("Error adding space:", error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdateSpace = async () => {
        if (!isEditingSpace || !isEditingSpace.name) return;
        try {
            await api.put(`/spaces/${isEditingSpace.id}`, {
                name: isEditingSpace.name
            });
            setIsEditingSpace(null);
            refetch();
            syncWorkgroups();
        } catch (error) {
            console.error("Error updating space:", error);
        }
    };

    const handleUpdateStatus = async (id: number, status: string) => {
        setStatusUpdating(id);
        try {
            await api.put(`/spaces/${id}`, {
                status: status
            });
            refetch();
            syncWorkgroups();
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setStatusUpdating(null);
        }
    };

    const handleDeleteSpace = (id: number, spaceName: string, hasChildren: boolean) => {
        setItemToDelete({ id, name: spaceName, hasChildren });
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteSpace = async () => {
        if (!itemToDelete) return;

        const { id } = itemToDelete;
        setIsDeleting(id);
        try {
            await api.delete(`/spaces/${id}${deleteParentToo ? '?withParent=true' : ''}`);

            // Proactively remove from local workgroup store to avoid ghost items
            const itemIdsToDelete = findItemsByFloorId(groups, id.toString());
            itemIdsToDelete.forEach(itemId => deleteItem(itemId));

            refetch();
            syncWorkgroups();
            setIsDeleteDialogOpen(false);
        } catch (error) {
            console.error("Error deleting space:", error);
        } finally {
            setIsDeleting(null);
            setItemToDelete(null);
            setDeleteParentToo(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    const rootSpace = spaces?.[0]; // Usually we have only one root for an organization currently

    if (!rootSpace) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
                <Building className="size-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-bold">Aucune organisation trouvée</h2>
                <p className="text-muted-foreground mb-6">Initialisez d'abord votre structure.</p>
                <Button onClick={() => window.location.href = "/dashboard?view=organization-setup"}>
                    Initialiser maintenant
                </Button>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                        <Building className="size-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-black tracking-tight">{rootSpace.name}</h1>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center outline-none">
                                        {rootSpace.status === 'PUBLISHED' && (
                                            <Badge className="bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20 px-2 py-0 h-5 text-[10px] font-bold">
                                                <Globe className="size-3 mr-1" /> Publié
                                            </Badge>
                                        )}
                                        {rootSpace.status === 'DRAFT' && (
                                            <Badge className="bg-slate-100 text-slate-500 border-slate-200 px-2 py-0 h-5 text-[10px] font-bold uppercase tracking-wider">
                                                Brouillon
                                            </Badge>
                                        )}
                                        {rootSpace.status === 'PRIVATE' && (
                                            <Badge className="bg-red-50 text-red-600 border-red-100 px-2 py-0 h-5 text-[10px] font-bold uppercase tracking-wider">
                                                <Lock className="size-3 mr-1" /> Privé
                                            </Badge>
                                        )}
                                        {rootSpace.status === 'MAINTENANCE' && (
                                            <Badge className="bg-amber-50 text-amber-600 border-amber-100 px-2 py-0 h-5 text-[10px] font-bold uppercase tracking-wider">
                                                <Wrench className="size-3 mr-1" /> Maintenance
                                            </Badge>
                                        )}
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(rootSpace.id, 'DRAFT')}>Passer en Brouillon</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(rootSpace.id, 'PUBLISHED')} className="text-green-600 font-bold">Rendre Public (Publier)</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(rootSpace.id, 'PRIVATE')} className="text-red-600">Mettre en Privé</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(rootSpace.id, 'MAINTENANCE')} className="text-amber-600">Mode Maintenance</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <p className="text-sm text-muted-foreground">Configuration de votre bâtiment et de ses niveaux.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {rootSpace.status === 'DRAFT' && (
                        <Button
                            variant="default"
                            size="sm"
                            className={cn("bg-green-600 hover:bg-green-700", statusUpdating === rootSpace.id && "animate-undulation")}
                            onClick={() => handleUpdateStatus(rootSpace.id, 'PUBLISHED')}
                            disabled={statusUpdating === rootSpace.id}
                        >
                            <Globe className="size-3.5 mr-2" />
                            {statusUpdating === rootSpace.id ? "Publication..." : "Publier l'organisation"}
                        </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setIsEditingSpace(rootSpace)}>
                        <Edit2 className="size-3.5 mr-2" /> Modifier le nom
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteSpace(rootSpace.id, rootSpace.name, (rootSpace.childSpaces?.length || 0) > 0)}
                    >
                        <Trash2 className="size-3.5 mr-2" /> Supprimer toute l'organisation
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Structure Column */}
                <Card className="lg:col-span-2 border-none shadow-sm bg-card/60 backdrop-blur">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Layers className="size-4 text-primary" />
                            Arborescence Physique
                        </CardTitle>
                        <CardDescription>Gérez vos étages et zones de service.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            {rootSpace.childSpaces?.length === 0 && (
                                <div className="text-center py-10 border-2 border-dashed rounded-xl border-slate-100 italic text-slate-400">
                                    Aucun sous-espace défini.
                                </div>
                            )}

                            {rootSpace.childSpaces?.map((space: any) => (
                                <div
                                    key={space.id}
                                    className="group flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:border-primary/20 hover:shadow-md transition-all animate-in slide-in-from-left-2"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "size-10 rounded-lg flex items-center justify-center",
                                            space.spaceType === 'FLOOR' ? "bg-blue-50 text-blue-600" :
                                                space.spaceType === 'PARKING' ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600"
                                        )}>
                                            {space.spaceType === 'FLOOR' ? <Layers className="size-5" /> :
                                                space.spaceType === 'PARKING' ? <Car className="size-5" /> : <Trees className="size-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{space.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-[9px] uppercase tracking-wider py-0 px-1">
                                                    {space.spaceType}
                                                </Badge>
                                                {space.status === 'DRAFT' && (
                                                    <span className="text-[10px] text-orange-500 font-bold flex items-center gap-1">
                                                        <span className="size-1.5 rounded-full bg-orange-500 animate-pulse" /> Brouillon
                                                    </span>
                                                )}
                                                {space.status === 'PRIVATE' && (
                                                    <span className="text-[10px] text-red-600 font-bold flex items-center gap-1">
                                                        <Lock className="size-2.5" /> Privé
                                                    </span>
                                                )}
                                                {space.status === 'MAINTENANCE' && (
                                                    <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                                                        <Wrench className="size-2.5" /> Maintenance
                                                    </span>
                                                )}
                                                {space.status === 'PUBLISHED' && (
                                                    <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                                                        <CheckCircle className="size-2.5" /> Publié
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={cn("h-8 px-2 flex items-center gap-1.5", statusUpdating === space.id && "animate-undulation")}
                                                    disabled={statusUpdating === space.id}
                                                >
                                                    {space.status === 'PUBLISHED' ? <Globe className="size-3.5 text-green-600" /> :
                                                        space.status === 'PRIVATE' ? <Lock className="size-3.5 text-red-600" /> :
                                                            space.status === 'MAINTENANCE' ? <Wrench className="size-3.5 text-amber-600" /> :
                                                                <Globe className="size-3.5 text-slate-400" />}
                                                    <span className={cn("text-xs font-bold uppercase",
                                                        space.status === 'PUBLISHED' ? "text-green-600" :
                                                            space.status === 'PRIVATE' ? "text-red-600" :
                                                                space.status === 'MAINTENANCE' ? "text-amber-600" :
                                                                    "text-slate-500"
                                                    )}>
                                                        {space.status === 'DRAFT' ? 'Publier' :
                                                            space.status === 'PRIVATE' ? 'Privé' :
                                                                space.status === 'MAINTENANCE' ? 'Mainten.' : 'Public'}
                                                    </span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleUpdateStatus(space.id, 'DRAFT')}>Brouillon</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleUpdateStatus(space.id, 'PUBLISHED')} className="text-green-600 font-bold">Public (Publié)</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleUpdateStatus(space.id, 'PRIVATE')} className="text-red-600">Privé / Masqué</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleUpdateStatus(space.id, 'MAINTENANCE')} className="text-amber-600">Maintenance</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        {space.childSpaces && space.childSpaces.length > 0 && (
                                            <Badge variant="secondary" className="bg-orange-50 text-orange-600 border-orange-100 flex items-center gap-1">
                                                <AlertTriangle className="size-3" />
                                                {space.childSpaces.length}
                                            </Badge>
                                        )}
                                        {/* <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 text-slate-400 hover:text-primary"
                                            title="Ajouter un sous-espace"
                                            onClick={() => {
                                                setTargetParentId(space.id);
                                                setIsAddingSpace(true);
                                            }}
                                        >
                                            <Plus className="size-4" />
                                        </Button> */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 text-slate-400 hover:text-blue-600"
                                            onClick={() => setIsEditingSpace(space)}
                                        >
                                            <Edit2 className="size-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 text-slate-400 hover:text-red-600"
                                            disabled={isDeleting === space.id}
                                            onClick={() => handleDeleteSpace(space.id, space.name, (space.childSpaces?.length || 0) > 0)}
                                        >
                                            {isDeleting === space.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            className="w-full h-12 border-dashed border-2 hover:bg-primary/5 hover:border-primary/20 transition-all font-bold"
                            onClick={() => {
                                setTargetParentId(rootSpace.id);
                                setIsAddingSpace(true);
                            }}
                        >
                            <Plus className="size-4 mr-2" /> Ajouter un étage ou une zone
                        </Button>
                    </CardContent>
                </Card>

                {/* Info Card Column */}
                <div className="space-y-6">
                    <Card className="border-none shadow-sm bg-primary text-primary-foreground overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Layout className="size-24 scale-150 rotate-12" />
                        </div>
                        <CardHeader>
                            <CardTitle>Conseil</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm font-medium leading-relaxed opacity-90">
                            Chaque espace physique (étage, terrasse) peut avoir son propre plan au sol.
                            Une fois vos espaces créés ici, ils apparaîtront dans votre barre latérale sous "Workgroups".
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-card/60 backdrop-blur">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Résumé</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-slate-500">Sous-espaces</span>
                                <span className="font-bold">{rootSpace.childSpaces?.length || 0}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-slate-500">Étages</span>
                                <span className="font-bold">
                                    {rootSpace.childSpaces?.filter((s: any) => s.spaceType === 'FLOOR').length || 0}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Dialogs */}
            <Dialog open={isAddingSpace} onOpenChange={setIsAddingSpace}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {targetParentId && targetParentId !== rootSpace?.id ? "Ajouter un sous-espace" : "Ajouter un nouvel espace"}
                        </DialogTitle>
                        <DialogDescription>
                            {targetParentId && targetParentId !== rootSpace?.id ?
                                `Ajout d'un élément à l'intérieur de "${spaces?.find(s => s.id === targetParentId || s.childSpaces?.some((cs: any) => cs.id === targetParentId))?.name || 'l\'élément sélectionné'}"` :
                                "Générez un nouvel étage ou une zone principale pour votre organisation."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold">Nom</label>
                            <Input
                                placeholder="Ex: Étage 3, Jardin, Rooftop..."
                                value={newSpaceData.name}
                                onChange={(e) => setNewSpaceData(p => ({ ...p, name: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold">Type</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: 'FLOOR', label: 'Étage', icon: Layers },
                                    { id: 'ZONE', label: 'Terrasse / Zone', icon: Layout },
                                    { id: 'PARKING', label: 'Parking', icon: Car },
                                    { id: 'AREA', label: 'Espace Vert', icon: Trees },
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setNewSpaceData(p => ({ ...p, type: t.id }))}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-3 border rounded-xl text-[10px] font-bold transition-all",
                                            newSpaceData.type === t.id ? "bg-primary text-white shadow-md border-primary" : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                                        )}
                                    >
                                        <t.icon className="size-4" />
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddingSpace(false)}>Annuler</Button>
                        <Button onClick={handleAddSpace} disabled={!newSpaceData.name || isCreating} className={cn(isCreating && "animate-undulation cursor-wait")}>
                            {isCreating ? (
                                <span className="flex items-center gap-2">
                                    Création en cours...
                                </span>
                            ) : "Créer l'espace"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!isEditingSpace} onOpenChange={(open) => !open && setIsEditingSpace(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier l'espace</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold">Nouveau nom</label>
                            <Input
                                value={isEditingSpace?.name || ""}
                                onChange={(e) => setIsEditingSpace((p: any) => ({ ...p, name: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditingSpace(null)}>Annuler</Button>
                        <Button onClick={handleUpdateSpace}>Enregistrer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Professional Delete Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="size-5" />
                            Confirmation de suppression
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            Êtes-vous sûr de vouloir supprimer l'espace <strong>{itemToDelete?.name}</strong> ?
                            <br /><br />
                            {itemToDelete?.hasChildren && (
                                <span className="text-destructive font-medium block mb-4">
                                    Attention : Cet espace contient des sous-éléments. La suppression sera RÉCURSIVE et effacera TOUT le contenu rattaché.
                                </span>
                            )}

                            <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                                <input
                                    type="checkbox"
                                    id="deleteParent"
                                    checked={deleteParentToo}
                                    onChange={(e) => setDeleteParentToo(e.target.checked)}
                                    className="accent-primary"
                                />
                                <label htmlFor="deleteParent" className="text-xs font-semibold cursor-pointer">
                                    Supprimer également l'élément PARENT de cet espace ?
                                </label>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex sm:justify-end gap-2 pt-4">
                        <Button
                            variant="secondary"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={!!isDeleting}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeleteSpace}
                            disabled={!!isDeleting}
                            className={cn(isDeleting && "animate-undulation cursor-wait")}
                        >
                            {isDeleting ? "Suppression..." : "Supprimer tout"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
