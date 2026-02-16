"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  // { title: "Search", icon: Search, shortcut: "/" },
  { title: "Gestion Clients", icon: UserPlus },
  { title: "Dashboard", icon: BarChart3, isActive: true, shortcut: "/" },
  { title: "Réservation Admin", icon: MousePointerClick },
  { title: "Liste des Réservations", icon: CheckSquare },
  { title: "Plan de Salle", icon: Globe },
  { title: "Modèles d'Espaces", icon: Layers },
  { title: "Calendrier", icon: Calendar },
  { title: "Equipes", icon: Users },
  { title: "Développement", icon: Code },
  { title: "Support", icon: Headphones },
  // { title: "Company", icon: Building },
];


import { useWorkgroupStore, WorkgroupItem } from "@/store/workgroup-store";

const iconMap: Record<string, React.ElementType> = {
  Globe,
  Folder,
  File,
  Megaphone,
  Code,
  Headphones,
  UserPlus,
};

export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const searchParams = useSearchParams();
  const currentViewId = searchParams?.get("id");

  const { groups, expandedItems, addItem, deleteItem, toggleItem, setExpandedItems } = useWorkgroupStore();

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [newItemName, setNewItemName] = React.useState("");
  const [newItemType, setNewItemType] = React.useState<'folder' | 'file'>('folder');
  const [selectedParentId, setSelectedParentId] = React.useState<string>("root");

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

  const handleAddItem = () => {
    if (!newItemName.trim()) return;

    const newItem: WorkgroupItem = {
      id: `${newItemName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name: newItemName,
      icon: newItemType === 'folder' ? 'Folder' : 'File',
      type: newItemType,
      children: newItemType === 'folder' ? [] : undefined,
      floorId: newItemType === 'file' ? `floor-${Date.now()}` : undefined
    };

    addItem(newItem, selectedParentId);

    // Reset and close
    setNewItemName("");
    setIsDialogOpen(false);
    // Auto expand the parent if not root
    if (selectedParentId !== "root" && !expandedItems.includes(selectedParentId)) {
      toggleItem(selectedParentId);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) return;
    deleteItem(itemId);
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
    const RawIcon = item.icon ? iconMap[item.icon as string] : File;
    const Icon = typeof RawIcon === 'function' || typeof RawIcon === 'object' ? RawIcon : File;
    const paddingLeft = level * 12;

    const ItemActions = () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 ml-auto opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 data-[state=open]:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="size-3" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="text-destructive focus:text-destructive cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteItem(item.id);
            }}
          >
            <Trash2 className="size-4 mr-2" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    if (isFolder) {
      return (
        <Collapsible
          key={item.id}
          open={isExpanded}
          onOpenChange={() => toggleItem(item.id)}
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                className="h-7 text-sm group pr-1"
                style={{ paddingLeft: `${8 + paddingLeft}px` }}
              >
                <Icon className="size-3.5" />
                <span className="flex-1 truncate">{item.name}</span>
                <div className="flex items-center gap-1 ml-auto">
                  <ItemActions />
                  {isExpanded ? (
                    <ChevronDown className="size-3 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="size-3 text-muted-foreground" />
                  )}
                </div>
              </SidebarMenuButton>
            </CollapsibleTrigger>
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
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          className="h-7 text-sm group pr-1"
          style={{ paddingLeft: `${8 + paddingLeft}px` }}
        >
          <div className="flex items-center w-full">
            <Link href={`/?view=plan&id=${item.id}`} className="flex items-center flex-1 min-w-0 gap-2 overflow-hidden">
              <Icon className="size-3.5 shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
            <ItemActions />
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar className="lg:border-r-0!" collapsible="icon" {...props}>
      <SidebarHeader className="px-2.5 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 w-full hover:bg-sidebar-accent rounded-md p-1 -m-1 transition-colors shrink-0">
              <div className="flex size-7 items-center justify-center rounded-lg bg-foreground text-background shrink-0">
                <span className="text-sm font-bold">S</span>
              </div>
              <div className="flex items-center gap-1 group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium">MadaEvent</span>
                <ChevronsUpDown className="size-3 text-muted-foreground" />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem>
              <Settings className="size-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <UserPlus className="size-4" />
              <span>Invite members</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
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
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      (item.title === "Dashboard" && !currentViewId && !searchParams?.get("view")) ||
                      (item.title === "Calendrier" && searchParams?.get("view") === "calendar") ||
                      (item.title === "Modèles d'Espaces" && searchParams?.get("view") === "bookmarks") ||
                      (item.title === "Gestion Clients" && searchParams?.get("view") === "clients") ||
                      (item.title === "Liste des Réservations" && searchParams?.get("view") === "tasks") ||
                      (item.title === "Plan de Salle" && searchParams?.get("view") === "bookings") ||
                      (item.title === "Réservation Admin" && searchParams?.get("view") === "admin-reservation") ||
                      (item.title === "Développement" && searchParams?.get("view") === "development") ||
                      (item.title === "Support" && searchParams?.get("view") === "support")
                    }
                    className="h-7"
                  >
                    <Link href={
                      item.title === "Dashboard" ? "/" :
                        item.title === "Calendrier" ? "/?view=calendar" :
                          item.title === "Modèles d'Espaces" ? "/?view=bookmarks" :
                            item.title === "Gestion Clients" ? "/?view=clients" :
                              item.title === "Liste des Réservations" ? "/?view=tasks" :
                                item.title === "Plan de Salle" ? "/?view=bookings" :
                                  item.title === "Réservation Admin" ? "/?view=admin-reservation" :
                                    item.title === "Développement" ? "/?view=development" :
                                      item.title === "Support" ? "/?view=support" : "#"
                    }>
                      <item.icon className="size-3.5" />
                      <span className="text-sm">{item.title}</span>
                      {'shortcut' in item && item.shortcut && (
                        <span className="ml-auto flex size-5 items-center justify-center rounded bg-muted text-[10px] font-medium text-muted-foreground">
                          {item.shortcut}
                        </span>
                      )}
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
        <div className="group/sidebar relative flex flex-col gap-2 rounded-lg border p-4 text-sm w-full bg-background">
          <div className="text-balance text-lg font-semibold leading-tight group-hover/sidebar:underline">
            hello
          </div>
          <div className="text-muted-foreground">
            besoin d aide contacte notre team
          </div>
          <Button size="sm" className="w-full" asChild>
            <Link href="/?view=support">
              contact admin
            </Link>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
