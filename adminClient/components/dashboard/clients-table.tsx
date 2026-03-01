"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Upload,
  PieChart,
  Check,
  X,
  User,
  Mail,
  Activity,
  ArrowUp,
  ArrowDown,
  Facebook,
  Phone,
  Target,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  Share2,
  Ban,
  ShieldCheck,
  History,
  QrCode,
  MessageCircle,
  Plus,
  Info,
  Calendar,
  Copy,
  ClipboardPaste,
  Database,
  Table as TableIcon,
  Map as MapIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { type Client, type ClientStatus, type ClientRestriction, type RestrictionRule, type RestrictionOperator, type ClientRestrictionDetails } from "@/types";
import { useDashboardStore } from "@/store/dashboard-store";
import { useTypesStore } from "@/store/types-store";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useClients,
  useUpdateClientStatus,
  useUpdateClientRestrictions,
  useDeleteClient,
  useRemoveClientRelationship,
  useInviteClient,
  useSendInvitation,
  type BackendClient,
} from "@/hooks/use-clients";
import { RefreshCw, Wifi, WifiOff, Send, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";


type SortField = "name" | "email" | "lastInteraction" | "status" | "bookingCount";
type SortOrder = "asc" | "desc";

function getRestrictionDetails(r: ClientRestriction): ClientRestrictionDetails {
  if (r === "none" || r === "all") return { rules: [], forbiddenPlaces: [] };
  if (Array.isArray((r as ClientRestrictionDetails).rules)) {
    return r as ClientRestrictionDetails;
  }
  return {
    rules: (r as any)?.rules ?? [],
    forbiddenPlaces: (r as any)?.forbiddenPlaces ?? [],
  };
}

function computeBookingQuota(restriction: ClientRestriction, bookingCount: number) {
  const details = getRestrictionDetails(restriction);

  const limitedRules = details.rules.filter(
    (rule: RestrictionRule) => rule.operator === "max" || rule.operator === "equal"
  );

  if (!limitedRules.length) {
    return { current: bookingCount, max: null as number | null };
  }

  const max = limitedRules.reduce(
    (acc, rule) => Math.max(acc, rule.value ?? 0),
    0
  );

  if (!max || max <= 0) {
    return { current: bookingCount, max: null as number | null };
  }

  const current = Math.min(bookingCount, max);
  return { current, max };
}

function getSortIcon(
  sortField: SortField,
  sortOrder: SortOrder,
  field: SortField
) {
  if (sortField !== field) return <ArrowUpDown className="size-3" />;
  return sortOrder === "asc" ? (
    <ArrowUp className="size-3" />
  ) : (
    <ArrowDown className="size-3" />
  );
}

function StatusBadge({
  status,
  onToggle
}: {
  status: ClientStatus;
  onToggle: (newStatus: ClientStatus) => void
}) {
  const configs: Record<ClientStatus, { label: string, color: string, icon: any }> = {
    ACTIVE: { label: "Actif", color: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10", icon: Check },
    SUBSCRIBED: { label: "Abonné", color: "border-blue-500/40 text-blue-400 bg-blue-500/10", icon: ShieldCheck },
    BANNED: { label: "Banni", color: "border-red-500/40 text-red-400 bg-red-500/10", icon: Ban },
    PENDING: { label: "Invité", color: "border-amber-500/40 text-amber-400 bg-amber-500/10", icon: Clock },
    UNVERIFIED: { label: "Non vérifié", color: "border-slate-500/40 text-slate-400 bg-slate-500/10", icon: User },
  };

  const config = configs[status] || configs.ACTIVE;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border w-fit cursor-pointer hover:opacity-80 transition-all ${config.color}`}
        >
          <config.icon className="size-3.5" />
          <span className="text-sm font-medium">{config.label}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Changer le statut</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onToggle("ACTIVE")}>
          <Check className="size-4 mr-2 text-emerald-400" /> Actif
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggle("SUBSCRIBED")}>
          <ShieldCheck className="size-4 mr-2 text-blue-400" /> Abonné
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggle("BANNED")}>
          <Ban className="size-4 mr-2 text-red-400" /> Banni
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { VisualRestrictionSelector } from "./visual-restriction-selector";

function RestrictionBadge({
  restriction,
  clientId,
  onToggle
}: {
  restriction: ClientRestriction;
  clientId: string;
  onToggle: (newRestriction: ClientRestriction) => void
}) {
  const { emplacementTypes } = useTypesStore();
  const [isVisualSelectorOpen, setIsVisualSelectorOpen] = useState(false);

  const [newRule, setNewRule] = useState<RestrictionRule>({
    type: emplacementTypes[0]?.name || "",
    operator: "max",
    value: 1
  });

  useEffect(() => {
    // Select first type if available and currently empty or "chaise"
    if (emplacementTypes.length > 0 && (!newRule.type || newRule.type === "chaise")) {
      setNewRule((prev) => ({ ...prev, type: emplacementTypes[0].name }));
    }
  }, [emplacementTypes, newRule.type]);

  const getDetails = (r: ClientRestriction): ClientRestrictionDetails => {
    if (r === "none" || r === "all") return { rules: [], forbiddenPlaces: [] };
    if (Array.isArray(r)) return { rules: r, forbiddenPlaces: [] };
    return {
      rules: r?.rules ?? [],
      forbiddenPlaces: r?.forbiddenPlaces ?? []
    };
  };

  const details = getDetails(restriction);

  const addRule = () => {
    const currentRules = details.rules;
    const existingIndex = currentRules.findIndex((r: RestrictionRule) => r.type === newRule.type && r.operator === newRule.operator);

    let updatedRules = [...currentRules];
    if (existingIndex > -1) {
      updatedRules[existingIndex] = newRule;
    } else {
      updatedRules.push(newRule);
    }

    onToggle({ ...details, rules: updatedRules });
  };

  const removeRule = (index: number) => {
    const updatedRules = details.rules.filter((_: RestrictionRule, i: number) => i !== index);
    onToggle({ ...details, rules: updatedRules });
  };

  const toggleForbiddenPlace = (elementId: string) => {
    const current = details.forbiddenPlaces;
    const updated = current.includes(elementId)
      ? current.filter((id: string) => id !== elementId)
      : [...current, elementId];

    onToggle({ ...details, forbiddenPlaces: updated });
  };

  const renderSummary = () => {
    if (restriction === "none") return "Aucune";
    if (restriction === "all") return "Tout Bloqué";

    const ruleCount = details.rules.length;
    const placeCount = details.forbiddenPlaces.length;

    if (ruleCount === 0 && placeCount === 0) return "Aucune";
    if (ruleCount > 0 && placeCount > 0) return `${ruleCount} R / ${placeCount} P`;
    if (ruleCount > 0) return `${ruleCount} règle(s)`;
    return `${placeCount} place(s) interdite(s)`;
  };

  const color = restriction === "none" ? "bg-muted text-muted-foreground" :
    restriction === "all" ? "bg-red-500/10 text-red-500 border-red-500/40" :
      "bg-amber-500/10 text-amber-500 border-amber-500/40";

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <div
            className={`flex items-center px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-all ${color}`}
          >
            {renderSummary()}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Gestion des Restrictions</h4>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => onToggle("none")}>Reset</Button>
                <Button variant="destructive" size="sm" className="h-7 text-[10px]" onClick={() => onToggle("all")}>Tout Bloquer</Button>
              </div>
            </div>

            <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 space-y-2">
              <p className="text-[10px] font-bold text-primary uppercase flex items-center justify-between">
                Sélecteur de Places
                {details.forbiddenPlaces.length > 0 && (
                  <Badge variant="secondary" className="bg-primary/20 text-primary border-none pointer-events-none text-[9px]">
                    {details.forbiddenPlaces.length} Sélectionnée(s)
                  </Badge>
                )}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-semibold gap-2 border-primary/30 hover:bg-primary/5"
                onClick={() => {
                  window.location.href = `/dashboard?view=admin-reservation&mode=restrict&clientId=${clientId}`;
                }}
              >
                <MapIcon className="size-3.5" />
                Choisir sur le Plan
              </Button>
            </div>

            {details.rules.length > 0 && (
              <div className="space-y-2 py-2 border-y">
                {details.rules.map((rule: RestrictionRule, idx: number) => (
                  <div key={idx} className="flex items-center justify-between bg-muted/30 p-2 rounded-lg text-xs">
                    <div className="flex flex-col">
                      <span className="font-bold text-primary uppercase text-[9px]">{rule.type}</span>
                      <span className="text-sm font-medium">
                        {rule.operator === "max" ? "Maximum" : rule.operator === "min" ? "Minimum" : "Exactement"} : {rule.value}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive opacity-50 hover:opacity-100" onClick={() => removeRule(idx)}>
                      <X className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3 bg-muted/50 p-3 rounded-xl border border-dashed border-primary/20">
              <p className="text-[10px] font-bold text-primary uppercase">Quantité limite par Type</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground">Objet</label>
                  <Select value={newRule.type} onValueChange={(v) => setNewRule({ ...newRule, type: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {emplacementTypes.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground">Condition</label>
                  <Select value={newRule.operator} onValueChange={(v: any) => setNewRule({ ...newRule, operator: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="max">Maximum (≤)</SelectItem>
                      <SelectItem value="min">Minimum (≥)</SelectItem>
                      <SelectItem value="equal">Égal (=)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] text-muted-foreground">Qté</label>
                  <Input
                    type="number"
                    className="h-8 text-xs"
                    value={newRule.value}
                    onChange={(e) => setNewRule({ ...newRule, value: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-end">
                  <Button size="sm" className="h-8 text-[11px] px-4 font-bold" onClick={addRule}>
                    <Plus className="size-3.5 mr-1" /> AJOUTER
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <VisualRestrictionSelector
        open={isVisualSelectorOpen}
        onOpenChange={setIsVisualSelectorOpen}
        forbiddenPlaces={details.forbiddenPlaces}
        onTogglePlace={toggleForbiddenPlace}
      />
    </>
  );
}

import { useClientStore } from "@/store/client-store";

export function ClientsTable() {
  const {
    searchQuery,
    setSearchQuery,
  } = useDashboardStore();

  // ── Backend data ──────────────────────────────────────────────
  const { data: backendClients, isLoading, isError, refetch } = useClients();
  const updateStatusMutation = useUpdateClientStatus();
  const updateRestrictionsMutation = useUpdateClientRestrictions();
  const deleteClientMutation = useDeleteClient();
  const removeRelationshipMutation = useRemoveClientRelationship();
  const inviteClientMutation = useInviteClient();
  const sendInvitationMutation = useSendInvitation();

  // Map backend status → local status
  const mapBackendStatus = (s: BackendClient["status"] | string): ClientStatus => {
    if (s === "BANNED") return "BANNED";
    if (s === "SUBSCRIBED") return "SUBSCRIBED";
    if (s === "PENDING") return "PENDING";
    if (s === "UNVERIFIED") return "UNVERIFIED";
    return "ACTIVE";
  };

  // Map backend client → local Client format
  const mapBackendClient = (c: any): Client => {
    let parsedRestrictions: any = c.restrictions || "none";
    if (typeof parsedRestrictions === "string" && parsedRestrictions !== "none" && parsedRestrictions !== "all") {
      try {
        parsedRestrictions = JSON.parse(parsedRestrictions);
      } catch (e) {
        console.warn("Failed to parse client restrictions", parsedRestrictions);
      }
    }

    // Backend mapping might include relationshipStatus from junction table
    const status = mapBackendStatus(c.relationshipStatus || c.status);

    return {
      id: String(c.id),
      name: (c.profile?.firstName ? `${c.profile.firstName} ${c.profile.lastName || ''}` : '') || c.name || c.email,
      avatar: c.profile?.avatarUrl || c.avatar || `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(c.email)}`,
      email: c.email,
      phone: c.phone || "—",
      socials: c.socials || {},
      status: status,
      relationshipStatus: status,
      relationshipId: c.relationshipId,
      restrictions: parsedRestrictions,
      lastInteraction: c.lastInteraction || "—",
      bookingCount: c.bookingCount || 0,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      history: []
    };
  };

  const { user } = useUser();
  const isLive = !isError && !!backendClients;

  // 1. Listen for real-time updates to Clients (invitation acceptance, etc.)
  useEffect(() => {
    if (!user?.uuid) return;

    console.log(`[Realtime] Organizer Listening for client updates for ${user.uuid}`);
    const unsubscribe = onSnapshot(
      collection(db, `organizations/${user.uuid}/clients`),
      (snapshot) => {
        if (!snapshot.empty) {
          // Check if there was an actual modification (not first load)
          const changes = snapshot.docChanges();
          if (changes.length > 0 && changes.some(c => c.type === 'modified' || c.type === 'added' || c.type === 'removed')) {
            console.log("[Realtime] Client list modified, refetching...");
            refetch();
          }
        }
      },
      (err) => console.error("Firestore Clients listener error:", err)
    );

    return () => unsubscribe();
  }, [user?.uuid, refetch]);

  const clients: Client[] = useMemo(() => {
    if (backendClients) {
      return backendClients.map(mapBackendClient);
    }
    return [];
  }, [backendClients]);
  // ─────────────────────────────────────────────────────────────

  const [copiedRestriction, setCopiedRestriction] = useState<ClientRestriction | null>(null);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [qrMode, setQrMode] = useState(false);

  // New Client Form State
  const [newClientData, setNewClientData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const toggleStatus = (clientId: string, newStatus: ClientStatus) => {
    const backendId = parseInt(clientId);
    if (!isNaN(backendId)) {
      updateStatusMutation.mutate({ id: backendId, status: newStatus as any });
    }
  };

  const toggleRestriction = (clientId: string, newRestriction: ClientRestriction) => {
    const backendId = parseInt(clientId);
    if (!isNaN(backendId)) {
      updateRestrictionsMutation.mutate({
        id: backendId,
        restrictions: JSON.stringify(newRestriction),
      });
    }
  };

  const handleDeleteClient = (clientId: string) => {
    if (!confirm("Supprimer ce client ?")) return;
    const backendId = parseInt(clientId);
    if (!isNaN(backendId)) {
      deleteClientMutation.mutate(backendId);
    }
  };

  const handleAddClient = async () => {
    if (!newClientData.email) {
      alert("L'email est requis");
      return;
    }

    if (isLive) {
      try {
        await inviteClientMutation.mutateAsync({
          email: newClientData.email,
          firstName: newClientData.name.split(' ')[0] || '',
          lastName: newClientData.name.split(' ').slice(1).join(' ') || ''
        });
        setIsAddClientOpen(false);
        setNewClientData({ name: "", email: "", phone: "" });
      } catch (err: any) {
        alert(err.message || "Erreur lors de l'invitation");
      }
    }
  };

  const handleSendInvitation = async (relationshipId: number) => {
    try {
      await sendInvitationMutation.mutateAsync(relationshipId);
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'envoi");
    }
  };

  const handleRemoveRelationship = async (relationshipId: number) => {
    if (confirm("Êtes-vous sûr de vouloir retirer ce client de votre liste ?")) {
      try {
        await removeRelationshipMutation.mutateAsync(relationshipId);
      } catch (err: any) {
        alert(err.message || "Erreur lors de la suppression");
      }
    }
  };

  const filteredAndSortedClients = useMemo(() => {
    const result = clients.filter((client) => {
      const matchesSearch =
        searchQuery === "" ||
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone.includes(searchQuery);

      return matchesSearch;
    });

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "email":
          comparison = a.email.localeCompare(b.email);
          break;
        case "lastInteraction":
          comparison = (a.lastInteraction || "").localeCompare(b.lastInteraction || "");
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "bookingCount":
          comparison = (a.bookingCount || 0) - (b.bookingCount || 0);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [clients, searchQuery, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedClients.length / itemsPerPage);
  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedClients.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedClients, currentPage, itemsPerPage]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const toggleSelectAll = () => {
    if (selectedClients.length === paginatedClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(paginatedClients.map((c) => c.id));
    }
  };

  const toggleSelectClient = (id: string) => {
    setSelectedClients((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedClients([]);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
    setSelectedClients([]);
  };

  return (
    <div className="w-full h-full flex flex-col bg-card text-card-foreground overflow-hidden">
      {/* Header - Simplified to only filters/actions as main header is centralized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3.5 border-b">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Rechercher (Nom, Email, Tel...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 w-[250px] text-sm bg-muted/50 border-border/50"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 gap-1.5 border-primary/30 text-primary hover:bg-primary/5">
                  <Upload className="size-3.5" />
                  Importer
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Source d'importation</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.location.href = '/?view=clients-import'} className="cursor-pointer">
                  <Database className="size-4 mr-2 text-emerald-500" />
                  Google Forms (Automatique)
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer opacity-50">
                  <TableIcon className="size-4 mr-2 text-blue-500" />
                  Fichier CSV / Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
              <SheetTrigger asChild>
                <Button size="sm" className="h-8 gap-1.5 bg-primary text-primary-foreground">
                  <Plus className="size-3.5" />
                  Nouveau Client
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Ajouter un nouveau client</SheetTitle>
                  <SheetDescription>
                    Créez un profil client manuellement ou via scanner QR.
                  </SheetDescription>
                </SheetHeader>

                <div className="flex gap-4 border-b my-6 p-1 bg-muted rounded-lg">
                  <Button
                    variant={!qrMode ? "secondary" : "ghost"}
                    className="flex-1 text-xs h-8"
                    onClick={() => setQrMode(false)}
                  >
                    Manuel
                  </Button>
                  <Button
                    variant={qrMode ? "secondary" : "ghost"}
                    className="flex-1 text-xs h-8"
                    onClick={() => setQrMode(true)}
                  >
                    Scanner QR
                  </Button>
                </div>

                {!qrMode ? (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase text-muted-foreground">Nom Complet</label>
                      <Input
                        placeholder="Ex: Jean Rakoto"
                        value={newClientData.name}
                        onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase text-muted-foreground">Email</label>
                      <Input
                        placeholder="jean@example.mg"
                        type="email"
                        value={newClientData.email}
                        onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase text-muted-foreground">Téléphone</label>
                      <Input
                        placeholder="034 XX XXX XX"
                        value={newClientData.phone}
                        onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-4 py-12 bg-muted/30 rounded-xl border border-dashed">
                    <div className="size-48 bg-white p-4 rounded-xl border-4 border-primary/20 flex items-center justify-center relative overflow-hidden group cursor-pointer">
                      <QrCode className="size-32 text-slate-800 drop-shadow-sm" />
                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-bold text-primary bg-background px-3 py-1 rounded-full shadow-sm">SIMULER SCAN</span>
                      </div>
                    </div>
                    <p className="text-sm text-center text-muted-foreground px-8">
                      Générez un QR Code pour que le client s'inscrive via son application Reserveo.
                    </p>
                    <Button variant="outline" className="gap-2">
                      <Upload className="size-4" />
                      Charger une image
                    </Button>
                  </div>
                )}

                <SheetFooter className="mt-8">
                  <Button className="w-full" onClick={handleAddClient}>Confirmer l'ajout</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Actions tools */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 bg-muted/50 border-border/50">
                <Sparkles className="size-3.5" />
                <span className="text-sm">Ask AI</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Segmenter les clients</DropdownMenuItem>
              <DropdownMenuItem>Analyser le taux de bannissement</DropdownMenuItem>
              <DropdownMenuItem>Prédire les abonnements</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-8 w-px bg-border mx-1 hidden sm:block" />
          <ThemeToggle />
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/30 sticky top-0 z-10">
              <TableHead className="w-[200px]">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={
                      selectedClients.length === paginatedClients.length &&
                      paginatedClients.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                    className="border-border/50 bg-background/70"
                  />
                  <button
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                    onClick={() => toggleSort("name")}
                  >
                    <span>Client</span>
                    {getSortIcon(sortField, sortOrder, "name")}
                  </button>
                </div>
              </TableHead>
              <TableHead className="w-[120px]">Statut</TableHead>
              <TableHead className="w-[150px]">Restrictions</TableHead>
              <TableHead className="w-[160px]">Quota Réservations</TableHead>
              <TableHead className="w-[150px]">Téléphone</TableHead>
              <TableHead className="w-[200px]">Email</TableHead>
              <TableHead className="w-[140px]">Réseaux</TableHead>
              <TableHead className="w-[160px]">
                <button
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                  onClick={() => toggleSort("lastInteraction")}
                >
                  <Activity className="size-3.5" />
                  <span>Dernière activité</span>
                  {getSortIcon(sortField, sortOrder, "lastInteraction")}
                </button>
              </TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-[400px] text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <RefreshCw className="size-8 text-primary animate-spin opacity-50" />
                    <p className="text-sm text-muted-foreground">Chargement des clients...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-[400px] text-center">
                  <div className="flex flex-col items-center justify-center space-y-3 opacity-60">
                    <User className="size-12 text-muted-foreground/30" />
                    <div>
                      <p className="text-lg font-bold">Aucun client</p>
                      <p className="text-sm text-muted-foreground">Commencez par inviter un client ou importez vos données.</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedClients.map((client) => {
                const quota = computeBookingQuota(client.restrictions, client.bookingCount || 0);
                return (
                  <TableRow key={client.id} className="border-border/50 group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedClients.includes(client.id)}
                          onCheckedChange={() => toggleSelectClient(client.id)}
                          className="border-border/50 bg-background/70 z-10"
                        />
                        <Sheet>
                          <SheetTrigger asChild>
                            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity flex-1 ml-1 pl-1">
                              <div className="relative">
                                <Avatar className="size-8">
                                  <AvatarImage src={client.avatar} />
                                  <AvatarFallback>{client.name[0]}</AvatarFallback>
                                </Avatar>
                                {client.status === "SUBSCRIBED" && (
                                  <div className="absolute -top-1 -right-1 size-3 bg-blue-500 rounded-full border-2 border-background" />
                                )}
                              </div>
                              <div className="flex flex-col text-left">
                                <span className="font-medium text-sm">{client.name}</span>
                                <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{client.email}</span>
                              </div>
                            </div>
                          </SheetTrigger>
                          <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
                            <SheetHeader className="mb-6">
                              <div className="flex flex-col items-center justify-center pt-6 pb-2">
                                <Avatar className="size-24 shadow-sm border-4 border-background mb-4">
                                  <AvatarImage src={client.avatar} />
                                  <AvatarFallback className="text-3xl">{client.name[0]}</AvatarFallback>
                                </Avatar>
                                <SheetTitle className="text-2xl">{client.name}</SheetTitle>
                              </div>
                            </SheetHeader>
                            <SheetDescription asChild>
                              <div className="space-y-6 text-foreground/90">
                                {/* General Info */}
                                <div className="space-y-3">
                                  <h3 className="font-semibold text-sm tracking-tight text-foreground border-b pb-2 flex items-center gap-2">
                                    <User className="size-4" /> Informations Générales
                                  </h3>
                                  <div className="grid grid-cols-2 gap-4 text-xs bg-muted/30 p-4 rounded-xl">
                                    <div className="space-y-1">
                                      <span className="text-muted-foreground flex items-center gap-1"><Mail className="size-3" /> Email</span>
                                      <span className="font-medium break-all">{client.email}</span>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-muted-foreground flex items-center gap-1"><Phone className="size-3" /> Téléphone</span>
                                      <span className="font-medium">{client.phone}</span>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-muted-foreground flex items-center gap-1"><Activity className="size-3" /> Statut</span>
                                      <div className="-ml-1"><StatusBadge status={client.status} onToggle={(s) => toggleStatus(client.id, s)} /></div>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-muted-foreground flex items-center gap-1"><Calendar className="size-3" /> Dernière act.</span>
                                      <span className="font-medium">{client.lastInteraction ?? "N/A"}</span>
                                    </div>
                                  </div>
                                  {(client.history || []).length === 0 && (
                                    <div className="text-center py-8">
                                      <History className="size-8 text-slate-200 mx-auto mb-2" />
                                      <p className="text-xs font-bold text-slate-400 italic">Aucune réservation passée</p>
                                    </div>
                                  )}
                                  {/* Restrictions Info */}
                                  <div className="space-y-3">
                                    <h3 className="font-semibold text-sm tracking-tight text-foreground border-b pb-2 flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <ShieldCheck className="size-4 text-amber-500" />
                                        <span>Restrictions Appliquées</span>
                                      </div>
                                      <div className="scale-[0.80] origin-right"><RestrictionBadge restriction={client.restrictions} clientId={client.id} onToggle={(r) => toggleRestriction(client.id, r)} /></div>
                                    </h3>
                                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
                                      {client.restrictions === "none" ? (
                                        <div className="flex items-center gap-2 opacity-70">
                                          <Check className="size-4" /> Ce client n'a aucune restriction. Tout est autorisé.
                                        </div>
                                      ) : client.restrictions === "all" ? (
                                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium">
                                          <Ban className="size-4" /> Ce client est bloqué de toute réservation.
                                        </div>
                                      ) : (
                                        <div className="space-y-3">
                                          {((client.restrictions as any).rules || []).length > 0 && (
                                            <div>
                                              <p className="font-semibold mb-1 uppercase tracking-wider text-[10px] opacity-70">Règles de quantité :</p>
                                              <ul className="list-disc pl-5 space-y-1">
                                                {(client.restrictions as any).rules?.map((rule: any, idx: number) => (
                                                  <li key={idx}>
                                                    <span className="font-bold">{rule.type}</span> : {rule.operator === "max" ? "Max" : rule.operator === "min" ? "Min" : "Exact."} {rule.value} place(s)
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                          {((client.restrictions as any).forbiddenPlaces || []).length > 0 && (
                                            <div>
                                              <p className="font-semibold mb-1 uppercase tracking-wider text-[10px] opacity-70">Lieux interdits :</p>
                                              <div className="flex items-center gap-2 font-medium">
                                                <Ban className="size-3.5 opacity-70" /> {((client.restrictions as any).forbiddenPlaces || []).length} emplacement(s) sur le plan.
                                              </div>
                                            </div>
                                          )}
                                          {!((client.restrictions as any).rules || []).length && !((client.restrictions as any).forbiddenPlaces || []).length && (
                                            <span className="opacity-70 italic">Restrictions personnalisées appliquées.</span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Socials */}
                                  <div className="space-y-3">
                                    <h3 className="font-semibold text-sm tracking-tight text-foreground border-b pb-2 flex items-center gap-2">
                                      <Share2 className="size-4" /> Réseaux Sociaux
                                    </h3>
                                    <div className="flex gap-2 text-xs">
                                      {client.socials?.facebook ? (
                                        <Button variant="outline" size="sm" className="flex-1 h-9 rounded-xl gap-2 hover:bg-slate-50 border-slate-100" asChild>
                                          <a href={client.socials?.facebook || "#"} target="_blank" rel="noopener noreferrer">
                                            <Facebook className="size-4 text-blue-600" />
                                            <span className="text-xs font-bold">Facebook</span>
                                          </a>
                                        </Button>
                                      ) : null}
                                      {client.socials?.whatsapp ? (
                                        <Button variant="outline" size="sm" className="flex-1 h-9 rounded-xl gap-2 hover:bg-emerald-50 border-slate-100" asChild>
                                          <a href={`https://wa.me/${client.socials?.whatsapp?.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer">
                                            <MessageCircle className="size-4 text-emerald-600" />
                                            <span className="text-xs font-bold">WhatsApp</span>
                                          </a>
                                        </Button>
                                      ) : null}
                                      {!client.socials?.facebook && !client.socials?.whatsapp && (
                                        <div className="text-muted-foreground italic px-2 py-1">Aucun compte social lié.</div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Stats */}
                                  <div className="space-y-3">
                                    <h3 className="font-semibold text-sm tracking-tight text-foreground border-b pb-2 flex items-center gap-2">
                                      <Target className="size-4" /> Statistiques
                                    </h3>
                                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center justify-between">
                                      <span className="text-sm font-medium text-foreground">Nombre de réservations</span>
                                      <Badge variant="default" className="text-sm px-3">{client.bookingCount ?? 0}</Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </SheetDescription>
                          </SheetContent>
                        </Sheet>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="relative group/status w-fit">
                        <StatusBadge status={client.status} onToggle={(s) => toggleStatus(client.id, s)} />
                        {client.status === "UNVERIFIED" && client.relationshipId && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/status:opacity-100 transition-all duration-200 bg-primary rounded-lg shadow-lg">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-full w-full text-[10px] font-black text-primary-foreground gap-1.5 hover:bg-primary hover:text-white"
                              onClick={() => handleSendInvitation(client.relationshipId!)}
                            >
                              <Send className="size-3" />
                              INVITER
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <RestrictionBadge restriction={client.restrictions} clientId={client.id} onToggle={(r) => toggleRestriction(client.id, r)} />
                    </TableCell>
                    <TableCell>
                      {quota.max ? (
                        <div className="space-y-1">
                          <div className="w-full bg-muted/60 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${(quota.current / quota.max) * 100}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                            <span>{quota.current} / {quota.max}</span>
                            <span>réservations</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">Illimité</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Phone className="size-3 text-muted-foreground" />
                        {client.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Mail className="size-3 text-muted-foreground" />
                        <span className="truncate max-w-[180px]">{client.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {client.socials?.facebook && (
                          <div title="Facebook" className="size-7 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-colors cursor-pointer">
                            <Facebook className="size-3.5" />
                          </div>
                        )}
                        {client.socials?.whatsapp && (
                          <div title="WhatsApp" className="size-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer">
                            <MessageCircle className="size-3.5" />
                          </div>
                        )}
                        {!client.socials?.facebook && !client.socials?.whatsapp && (
                          <span className="text-xs text-muted-foreground italic">Aucun</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium">{client.lastInteraction ?? "N/A"}</span>
                        <span className="text-[10px] text-muted-foreground">{client.bookingCount ?? 0} réservations au total</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Info className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Actions rapide</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setCopiedRestriction(client.restrictions)}>
                            <Copy className="size-4 mr-2" />
                            Copier Restrictions
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={!copiedRestriction}
                            onClick={() => copiedRestriction && toggleRestriction(client.id, copiedRestriction)}
                          >
                            <ClipboardPaste className="size-4 mr-2" />
                            Coller Restrictions
                          </DropdownMenuItem>
                          {client.status === "UNVERIFIED" && (
                            <DropdownMenuItem
                              className="text-primary font-bold"
                              onClick={() => client.relationshipId && handleSendInvitation(client.relationshipId)}
                            >
                              <Send className="size-4 mr-2" />
                              Envoyer l'invitation
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <Sheet>
                            <SheetTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <History className="size-4 mr-2" />
                                Historique Complet
                              </DropdownMenuItem>
                            </SheetTrigger>
                            <SheetContent side="right" className="sm:max-w-lg overflow-auto">
                              <SheetHeader>
                                <SheetTitle className="flex items-center gap-2">
                                  <History className="size-5" />
                                  Historique: {client.name}
                                </SheetTitle>
                              </SheetHeader>
                              <div className="py-6 space-y-6">
                                <div className="pt-4 border-t">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-4">Historique des réservations</p>
                                  <div className="space-y-3">
                                    {(client.history || []).map((h, i) => (
                                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100/50">
                                        <div className="flex gap-4">
                                          <div className="relative pl-6 pb-6 border-l border-border last:pb-0">
                                            <div className="absolute left-[-5px] top-0 size-2.5 rounded-full bg-primary" />
                                            <div className="flex flex-col gap-1">
                                              <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold">{h.space}</span>
                                                <Badge variant={h.status === "completed" ? "secondary" : "destructive"} className="text-[9px] h-4">
                                                  {h.status}
                                                </Badge>
                                              </div>
                                              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                <Calendar className="size-3" />
                                                {h.date}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                    {client.history?.length === 0 && (
                                      <p className="text-center py-12 text-sm text-muted-foreground">Aucun historique disponible.</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </SheetContent>
                          </Sheet>
                          <DropdownMenuItem className="text-red-500" onClick={() => toggleStatus(client.id, "BANNED")}>
                            <Ban className="size-4 mr-2" />
                            Bannir le client
                          </DropdownMenuItem>

                          {client.relationshipId && (
                            <DropdownMenuItem
                              className="text-red-600 font-semibold"
                              onClick={() => handleRemoveRelationship(client.relationshipId!)}
                            >
                              <X className="size-4 mr-2" />
                              Retirer de ma liste
                            </DropdownMenuItem>
                          )}

                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer / Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Affichage de {(currentPage - 1) * itemsPerPage + 1} à{" "}
            {Math.min(
              currentPage * itemsPerPage,
              filteredAndSortedClients.length
            )}{" "}
            sur {filteredAndSortedClients.length} clients
          </span>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Afficher</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger className="h-8 w-[70px] bg-muted/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="size-4" />
          </Button>

          <div className="flex items-center gap-1 mx-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="icon"
                  className="size-8"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div >
  );
}
