"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Search,
  Inbox,
  BarChart3,
  CheckSquare,
  Layers,
  Calendar,
  FileText,
  Users,
  Building,
  Globe,
  Folder,
  File,
  Megaphone,
  Code,
  Headphones,
  Plus,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Settings,
  UserPlus,
  LogOut,
  MousePointerClick,
  MoreHorizontal,
  Trash2,
  RefreshCw,
  CloudUpload,
  Car,
  Trees,
  Layout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { AlertTriangle } from "lucide-react";

const navItems = [
  { title: "Dashboard", icon: BarChart3 },
  { title: "Gestion Clients", icon: UserPlus },
  { title: "Réservation Admin", icon: MousePointerClick },
  { title: "Liste des Réservations", icon: CheckSquare },
  { title: "Plan de Salle", icon: Globe },
  { title: "Organisation", icon: Building },
  { title: "Mes Événements", icon: Calendar },
  { title: "Modèles d'Espaces", icon: Layers },
  { title: "Types & Paramètres", icon: Building },
  { title: "Calendrier", icon: Calendar },
  { title: "Equipes", icon: Users },
  { title: "Développement", icon: Code },
  { title: "Support", icon: Headphones },
];


import { useWorkgroupStore, WorkgroupItem } from "@/store/workgroup-store";
import { useDashboardStore } from "@/store/dashboard-store";
import { useAccountSync } from "@/hooks/use-account-sync";
import { useApi } from "@/hooks/use-api";

const iconMap: Record<string, React.ElementType> = {
  Globe,
  Folder,
  File,
  Megaphone,
  Code,
  Headphones,
  UserPlus,
  Layers,
  Car,
  Trees,
  Layout,
  Building,
};

export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const searchParams = useSearchParams();
  const { signOut } = useClerk();
  const currentViewId = searchParams?.get("id");

  const { groups, expandedItems, addItem, deleteItem, toggleItem, setExpandedItems, setGroups } = useWorkgroupStore();
  const { workspaceType } = useDashboardStore();
  const { me } = useAccountSync();

  // Professional Delete Modal States
  const [itemToDelete, setItemToDelete] = React.useState<WorkgroupItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const hasDraftProfile = React.useMemo(() => {
    if (!me?.onboardingData) return false;
    try {
      const parsed = typeof me.onboardingData === "string" ? JSON.parse(me.onboardingData) : me.onboardingData;
      return parsed?.isComplete === false;
    } catch {
      return false;
    }
  }, [me]);

  const filteredNavItems = navItems.map(item => {
    if (item.title === "Organisation") {
      return {
        ...item,
        title: groups.length > 0 ? "Organisation" : "Initialisation d'organisation",
      };
    }
    return item;
  }).filter(item => {
    if (item.title === "Mes Événements") {
      return workspaceType === "event";
    }
    return true;
  });

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [newItemName, setNewItemName] = React.useState("");
  const [newItemType, setNewItemType] = React.useState<'folder' | 'file'>('folder');
  const [selectedParentId, setSelectedParentId] = React.useState<string>("root");

  const [isSyncing, setIsSyncing] = React.useState(false);
  const api = useApi();

  const handleFetchWorkgroups = async () => {
    setIsSyncing(true);
    try {
      const response = await api.get("/workgroups");
      if (response.data && response.data.data) {
        setGroups(response.data.data);
      }
    } catch (error) {
      console.error("Fetch failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePushWorkgroups = async () => {
    setIsSyncing(true);
    try {
      const response = await api.put("/workgroups/bulk", { items: groups });
      if (response.data && response.data.data) {
        setGroups(response.data.data);
      }
      alert("Arborescence sauvegardée sur le serveur !");
    } catch (error) {
      console.error("Sync failed:", error);
      alert("Échec de la sauvegarde.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Helper to find all potential parent folders (folders that can contain other items)
  const getAllFolders = (items: WorkgroupItem[], depth = 0): { id: string, name: string, level: number }[] => {
    let folders: { id: string, name: string, level: number }[] = [];
    items.forEach(item => {
      // If it has children or is conceptually a folder, add it
      if (item.children || item.type === 'folder' || !item.type) {
        folders.push({ id: item.id, name: item.name, level: depth });
        if (item.children) {
          folders = [...folders, ...getAllFolders(item.children, depth + 1)];
        }
      }
    });
    return folders;
  };

  const handleAddItem = async () => {
    if (!newItemName.trim()) return;

    setIsSyncing(true);
    try {
      // Map name to icon automatically based on name or type
      let defaultIcon = newItemType === 'folder' ? 'Folder' : 'File';

      const parentId = selectedParentId === "root" ? null : parseInt(selectedParentId);

      const response = await api.post("/workgroups", {
        name: newItemName,
        type: newItemType,
        parentId: isNaN(parentId as any) ? null : parentId,
        icon: defaultIcon
      });

      if (response.data && response.data.data) {
        // Refresh full tree to get real IDs and associations
        await handleFetchWorkgroups();
      }

      // Reset and close
      setNewItemName("");
      setIsDialogOpen(false);

      // Auto expand the parent if not root
      if (selectedParentId !== "root" && !expandedItems.includes(selectedParentId)) {
        toggleItem(selectedParentId);
      }
    } catch (error) {
      console.error("Create item failed:", error);
      alert("Erreur lors de la création de l'élément.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteItem = (item: WorkgroupItem) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    const itemId = itemToDelete.id;

    try {
      // Note: For elements not synched with server yet, this might fail with 404
      await api.delete(`/workgroups/${itemId}`);

      // Optimistic delete only after server success or handled error
      deleteItem(itemId);
      setIsDeleteDialogOpen(false);
    } catch (e) {
      console.error("Failed to delete workgroup item on server:", e);
      // Even if server fails, if it's 404 we can delete locally
      deleteItem(itemId);
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  const renderWorkgroupItem = (
    item: WorkgroupItem,
    level: number = 0
  ) => {
    const hasChildren = item.children && item.children.length > 0;
    // Also treat empty folders as having potential children if we want to show them as expandable, 
    // but for now let's rely on 'children' array existence or type 'folder'
    const isFolder = item.type === 'folder' || (!item.type && item.children);

    const isExpanded = expandedItems.includes(item.id);
    const isActive = currentViewId === item.id;

    // Support both PascalCase and lowercase icon names
    const iconName = item.icon || (item.type === 'file' ? 'File' : 'Folder');
    const RawIcon = iconMap[iconName] || iconMap[iconName.charAt(0).toUpperCase() + iconName.slice(1)] || File;
    const Icon = RawIcon;
    const paddingLeft = level * 12;

    const ItemActions = () => (
      <Button
        variant="ghost"
        size="icon"
        className="size-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteItem(item);
        }}
      >
        <Trash2 className="size-3" />
        <span className="sr-only">Supprimer</span>
      </Button>
    );

    const WarningIndicator = () => item.hasWarning ? (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertTriangle className="size-3 text-orange-500 animate-pulse shrink-0" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{item.warningMessage || "Cet élément nécessite votre attention"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : null;

    if (isFolder) {
      return (
        <Collapsible
          key={item.id}
          open={isExpanded}
          onOpenChange={() => toggleItem(item.id)}
        >
          <SidebarMenuItem className="relative group/menu-item">
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                className="h-7 text-sm group pr-8"
                style={{ paddingLeft: `${8 + paddingLeft}px` }}
              >
                <Icon className="size-3.5 shrink-0" />
                <span className="flex-1 truncate">{item.name}</span>
                <div className="flex items-center gap-1.5 ml-2">
                  <WarningIndicator />
                  {isExpanded ? (
                    <ChevronDown className="size-3 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="size-3 text-muted-foreground" />
                  )}
                </div>
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <SidebarMenuAction
              showOnHover
              className="peer-data-[active=true]:bg-sidebar-accent"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteItem(item);
              }}
            >
              <Trash2 className="size-3.5" />
              <span className="sr-only">Supprimer</span>
            </SidebarMenuAction>
            <CollapsibleContent>
              <SidebarMenuSub className="mr-0 pr-0">
                {item.children?.map((child) => (
                  <SidebarMenuSubItem key={child.id}>
                    {renderWorkgroupItem(
                      child,
                      level + 1
                    )}
                  </SidebarMenuSubItem>
                ))}
                {(!item.children || item.children.length === 0) && (
                  <div className="text-[10px] text-muted-foreground py-1 px-4 italic" style={{ paddingLeft: `${24 + paddingLeft}px` }}>
                    Vide
                  </div>
                )}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      );
    }

    // File Item
    return (
      <SidebarMenuItem key={item.id} className="relative group/menu-item">
        <SidebarMenuButton
          asChild
          isActive={isActive}
          className="h-7 text-sm group pr-8"
          style={{ paddingLeft: `${8 + paddingLeft}px` }}
        >
          <Link href={`/dashboard?view=plan&id=${item.id}`} className="flex items-center flex-1 min-w-0 gap-2">
            <Icon className="size-3.5 shrink-0" />
            <span className="flex-1 truncate">{item.name}</span>
            <div className="flex items-center gap-1.5 ml-2">
              <WarningIndicator />
            </div>
          </Link>
        </SidebarMenuButton>
        <SidebarMenuAction
          showOnHover
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteItem(item);
          }}
        >
          <Trash2 className="size-3.5" />
          <span className="sr-only">Supprimer</span>
        </SidebarMenuAction>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar className="lg:border-r-0!" collapsible="icon" {...props}>
      <SidebarHeader className="px-2.5 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 w-full hover:bg-sidebar-accent rounded-md p-1 -m-1 transition-colors shrink-0 relative group/profile">
              <div className="flex size-7 items-center justify-center rounded-lg bg-foreground text-background shrink-0">
                <span className="text-sm font-bold">S</span>
              </div>
              {hasDraftProfile && (
                <div className="absolute -top-1 -right-1 size-3 bg-orange-500 rounded-full border-2 border-sidebar animate-premium-pulse z-20" />
              )}
              <div className="flex items-center gap-1 group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium">MadaEvent</span>
                <ChevronsUpDown className="size-3 text-muted-foreground" />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/dashboard?view=profile" className="flex items-center gap-2 cursor-pointer justify-between w-full">
                <div className="flex items-center gap-2">
                  <Building className="size-4" />
                  <span>Mon Profil</span>
                </div>
                {hasDraftProfile && (
                  <Badge variant="secondary" className="text-[9px] bg-orange-500/10 text-orange-600 border-orange-500/20 animate-pulse">
                    À remplir
                  </Badge>
                )}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={groups.length > 0 ? "/dashboard?view=organization" : "/dashboard?view=organization-setup"} className="flex items-center gap-2 cursor-pointer">
                <Globe className="size-4" />
                <span>{groups.length > 0 ? "Organisation" : "Initialisation d'organisation"}</span>
              </Link>
            </DropdownMenuItem>
            {workspaceType === "event" && (
              <DropdownMenuItem asChild>
                <Link href="/dashboard?view=events" className="flex items-center gap-2 cursor-pointer">
                  <Calendar className="size-4" />
                  <span>Mes Événements</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>
              <Settings className="size-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <UserPlus className="size-4" />
              <span>Invite members</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={() => signOut()}
            >
              <LogOut className="size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarContent className="px-2.5">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      (item.title === "Dashboard" && !searchParams?.get("view")) ||
                      (item.title === "Calendrier" && searchParams?.get("view") === "calendar") ||
                      (item.title === "Modèles d'Espaces" && searchParams?.get("view") === "bookmarks") ||
                      (item.title === "Types & Paramètres" && searchParams?.get("view") === "types") ||
                      (item.title === "Gestion Clients" && searchParams?.get("view") === "clients") ||
                      (item.title === "Liste des Réservations" && searchParams?.get("view") === "tasks") ||
                      (item.title === "Plan de Salle" && searchParams?.get("view") === "bookings") ||
                      (item.title === "Réservation Admin" && searchParams?.get("view") === "admin-reservation") ||
                      (item.title === "Développement" && searchParams?.get("view") === "development") ||
                      (item.title === "Support" && searchParams?.get("view") === "support") ||
                      (item.title === "Equipes" && searchParams?.get("view") === "teams") ||
                      (item.title === "Organisation" && searchParams?.get("view") === "organization") ||
                      (item.title === "Initialisation d'organisation" && searchParams?.get("view") === "organization-setup") ||
                      (item.title === "Mes Événements" && searchParams?.get("view") === "events")
                    }
                    className="h-7"
                  >
                    <Link href={
                      item.title === "Dashboard" ? "/dashboard" :
                        item.title === "Calendrier" ? "/dashboard?view=calendar" :
                          item.title === "Modèles d'Espaces" ? "/dashboard?view=bookmarks" :
                            item.title === "Types & Paramètres" ? "/dashboard?view=types" :
                              item.title === "Gestion Clients" ? "/dashboard?view=clients" :
                                item.title === "Liste des Réservations" ? "/dashboard?view=tasks" :
                                  item.title === "Plan de Salle" ? "/dashboard?view=bookings" :
                                    item.title === "Réservation Admin" ? "/dashboard?view=admin-reservation" :
                                      item.title === "Développement" ? "/dashboard?view=development" :
                                        item.title === "Support" ? "/dashboard?view=support" :
                                          item.title === "Equipes" ? "/dashboard?view=teams" :
                                            item.title === "Organisation" ? "/dashboard?view=organization" :
                                              item.title === "Initialisation d'organisation" ? "/dashboard?view=organization-setup" :
                                                item.title === "Mes Événements" ? "/dashboard?view=events" : "#"
                    }>
                      <item.icon className="size-3.5" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="p-0 mt-4">
          <SidebarGroupLabel className="flex items-center justify-between px-0 h-6">
            <span className="text-[10px] font-medium tracking-wider text-muted-foreground">
              Workgroups
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className={cn("size-5", isSyncing && "animate-spin")}
                onClick={handleFetchWorkgroups}
                title="Actualiser depuis le serveur"
                disabled={isSyncing}
              >
                <RefreshCw className="size-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-5"
                onClick={handlePushWorkgroups}
                title="Sauvegarder sur le serveur"
                disabled={isSyncing}
              >
                <CloudUpload className="size-3" />
              </Button>
              <Button variant="ghost" size="icon" className="size-5">
                <Search className="size-3" />
              </Button>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-5">
                    <Plus className="size-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer un nouvel élément</DialogTitle>
                    <DialogDescription>
                      Ajoutez un nouveau dossier d'événement ou un plan de salle.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label htmlFor="type" className="text-sm font-medium">Type</label>
                      <Select value={newItemType} onValueChange={(v: any) => setNewItemType(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="folder">Dossier (Événement/Groupe)</SelectItem>
                          <SelectItem value="file">Plan Excalidraw</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="name" className="text-sm font-medium">Nom</label>
                      <Input
                        id="name"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder={newItemType === 'folder' ? "Ex: Mariage VIP" : "Ex: Rez-de-chaussée"}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="parent" className="text-sm font-medium">Emplacement (Parent)</label>
                      <Select value={selectedParentId} onValueChange={setSelectedParentId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Racine" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="root">-- Racine (Défaut) --</SelectItem>
                          {getAllFolders(groups).map((folder) => (
                            <SelectItem key={folder.id} value={folder.id}>
                              {Array(folder.level).fill(0).map((_, i) => (
                                <span key={i} className="opacity-30">&nbsp;&nbsp;--&nbsp;</span>
                              ))}
                              {folder.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                    <Button onClick={handleAddItem} disabled={!newItemName.trim()}>Créer</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {groups.map((item) => renderWorkgroupItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-2.5 pb-3 group-data-[collapsible=icon]:hidden">
        {/* Placeholder removed */}
      </SidebarFooter>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              Confirmation de suppression
            </DialogTitle>
            <DialogDescription className="pt-2">
              Êtes-vous sûr de vouloir supprimer <strong>{itemToDelete?.name}</strong> ?
              <br /><br />
              <span className="text-destructive font-medium">
                Attention : Cette action est irréversible et supprimera également tous les sous-éléments (étages, zones, tables) rattachés à cet espace.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex sm:justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Suppression..." : "Supprimer tout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
