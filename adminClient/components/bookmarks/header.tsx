import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  LayoutGrid,
  List,
  Plus,
  SlidersHorizontal,
  ArrowUpDown,
  Github,
  Check,
} from "lucide-react";
import { useBookmarksStore } from "@/store/bookmarks-store";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { tags as allTags, collections } from "@/mock-data/bookmarks";

import { useWorkgroupStore, WorkgroupItem } from "@/store/workgroup-store";

interface BookmarksHeaderProps {
  title?: string;
}

const sortOptions = [
  { value: "date-newest", label: "Plus récent" },
  { value: "date-oldest", label: "Plus ancien" },
  { value: "alpha-az", label: "Alphabétique (A-Z)" },
  { value: "alpha-za", label: "Alphabétique (Z-A)" },
] as const;

const filterOptions = [
  { value: "all", label: "Tous les espaces" },
  { value: "favorites", label: "Coups de coeur" },
  { value: "with-tags", label: "Avec tags" },
  { value: "without-tags", label: "Sans tags" },
] as const;

export function BookmarksHeader({ title = "Modèles d'Espaces" }: BookmarksHeaderProps) {
  const {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filterType,
    setFilterType,
    addBookmark,
  } = useBookmarksStore();

  const { groups } = useWorkgroupStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    location: "",
    collectionId: "public",
    tags: [] as string[],
    eventType: "",
    floorId: "",
  });

  const eventTypes = [
    { id: "marriage", label: "Mariage", icon: "💍" },
    { id: "conference", label: "Conférence", icon: "🎤" },
    { id: "coworking", label: "Coworking", icon: "💻" },
    { id: "cocktail", label: "Cocktail", icon: "🍸" },
    { id: "birthday", label: "Anniversaire", icon: "🎂" },
    { id: "corporate", label: "Entreprise", icon: "🏢" },
  ];

  // Extraction récursive de tous les plans (fichiers) créés par l'utilisateur
  const getUserPlans = (items: WorkgroupItem[]): { id: string, name: string }[] => {
    let plans: { id: string, name: string }[] = [];
    items.forEach(item => {
      if (item.type === 'file' && item.floorId) {
        plans.push({ id: item.floorId, name: item.name });
      }
      if (item.children) {
        plans = [...plans, ...getUserPlans(item.children)];
      }
    });
    return plans;
  };

  const userPlans = getUserPlans(groups);

  const handleCreate = () => {
    addBookmark({
      title: formData.title,
      description: formData.description,
      url: formData.url,
      location: formData.location,
      collectionId: formData.collectionId,
      tags: formData.tags,
      floorId: formData.floorId,
      favicon: "",
    } as any);
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      title: "",
      description: "",
      url: "",
      location: "",
      collectionId: "public",
      tags: [],
      eventType: "",
      floorId: "",
    });
  };

  const toggleTag = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(t => t !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  const currentSort = sortOptions.find((opt) => opt.value === sortBy);
  const currentFilter = filterOptions.find((opt) => opt.value === filterType);

  return (
    <header className="w-full border-b">
      <div className="flex items-center justify-end h-14 px-4 gap-2">

        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-9 w-64 h-9"
            />
          </div>

          <div className="flex items-center border rounded-md p-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn("rounded-sm", viewMode === "grid" && "bg-muted")}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn("rounded-sm", viewMode === "list" && "bg-muted")}
              onClick={() => setViewMode("list")}
            >
              <List className="size-4" />
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <ArrowUpDown className="size-4" />
                <span className="hidden lg:inline">{currentSort?.label}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Trier par
              </DropdownMenuLabel>
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className="flex items-center justify-between"
                >
                  {option.label}
                  {sortBy === option.value && <Check className="size-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "hidden sm:flex",
                  filterType !== "all" && "border-primary text-primary"
                )}
              >
                <SlidersHorizontal className="size-4" />
                <span className="hidden lg:inline">
                  {filterType !== "all" ? currentFilter?.label : "Filtrer"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Filtrer par
              </DropdownMenuLabel>
              {filterOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setFilterType(option.value)}
                  className="flex items-center justify-between"
                >
                  {option.label}
                  {filterType === option.value && <Check className="size-4" />}
                </DropdownMenuItem>
              ))}
              {filterType !== "all" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setFilterType("all")}
                    className="text-muted-foreground"
                  >
                    Réinitialiser
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="hidden sm:flex text-xs">
                <Plus className="size-4" />
                Ajouter un Espace
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {step === 1 ? "Quel type d'événement ?" : "Détails de l'espace"}
                </DialogTitle>
                <DialogDescription>
                  {step === 1
                    ? "Choisissez le type d'événement principal pour cet espace."
                    : "Remplissez les informations pour créer votre nouvel espace."}
                </DialogDescription>
              </DialogHeader>

              {step === 1 ? (
                <div className="grid grid-cols-2 gap-3 py-4">
                  {eventTypes.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          eventType: event.id,
                          tags: prev.tags.includes(event.id) ? prev.tags : [...prev.tags, event.id]
                        }));
                        setStep(2);
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all hover:bg-accent",
                        formData.eventType === event.id ? "border-primary bg-primary/5" : "border-muted"
                      )}
                    >
                      <span className="text-2xl mb-2">{event.icon}</span>
                      <span className="font-medium text-sm">{event.label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Nom de l'espace</Label>
                    <Input
                      id="title"
                      placeholder="Ex: Espace Cristal"
                      value={formData.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Racontez l'histoire de ce lieu..."
                      value={formData.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="location">Emplacement</Label>
                      <Input
                        id="location"
                        placeholder="Ex: Ivato, Antananarivo"
                        value={formData.location}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="privacy">Confidentialité</Label>
                      <Select
                        value={formData.collectionId}
                        onValueChange={(v) => setFormData({ ...formData, collectionId: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">🌍 Public</SelectItem>
                          <SelectItem value="prive">🔒 Privé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-4 p-3 bg-muted/30 rounded-lg border border-primary/10">
                    <div className="grid gap-2">
                      <Label htmlFor="floor" className="text-xs font-bold text-primary uppercase">
                        Plan de l'événement (Source)
                      </Label>
                      <Select
                        value={formData.floorId}
                        onValueChange={(v) => setFormData({ ...formData, floorId: v })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Sélectionnez un événement..." />
                        </SelectTrigger>
                        <SelectContent>
                          {userPlans.length > 0 ? (
                            userPlans.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                ✨ {p.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-xs text-muted-foreground italic">
                              Aucun plan trouvé dans vos événements.
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-muted-foreground italic">
                        Le nouvel espace sera basé sur le plan de l'événement sélectionné.
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="url">Coordonnées Map (URL)</Label>
                    <Input
                      id="url"
                      placeholder="https://maps.google.com/..."
                      value={formData.url}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, url: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Tags & Équipements</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {allTags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant={formData.tags.includes(tag.id) ? "default" : "outline"}
                          className="cursor-pointer transition-all"
                          onClick={() => toggleTag(tag.id)}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className={step === 1 ? "hidden" : "flex"}>
                <Button variant="ghost" onClick={() => setStep(1)}>Retour</Button>
                <Button
                  onClick={handleCreate}
                  disabled={!formData.title.trim()}
                >
                  Créer l'Espace
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Separator orientation="vertical" className="h-5 hidden sm:block" />

          <ThemeToggle />

          <Button variant="ghost" size="icon" asChild>
            <Link
              href="https://github.com/ln-dev7/square-ui"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="size-5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
