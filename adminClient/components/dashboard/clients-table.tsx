"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

import { useMemo, useState } from "react";
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
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { clients as initialClients, Client, ClientStatus, ClientRestriction } from "@/mock-data/dashboard";
import { useDashboardStore } from "@/store/dashboard-store";

type SortField = "name" | "email" | "lastInteraction" | "status" | "bookingCount";
type SortOrder = "asc" | "desc";

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
    active: { label: "Actif", color: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10", icon: Check },
    subscribed: { label: "Abonné", color: "border-blue-500/40 text-blue-400 bg-blue-500/10", icon: ShieldCheck },
    banned: { label: "Banni", color: "border-red-500/40 text-red-400 bg-red-500/10", icon: Ban },
  };

  const config = configs[status];

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
        <DropdownMenuItem onClick={() => onToggle("active")}>
          <Check className="size-4 mr-2 text-emerald-400" /> Actif
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggle("subscribed")}>
          <ShieldCheck className="size-4 mr-2 text-blue-400" /> Abonné
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggle("banned")}>
          <Ban className="size-4 mr-2 text-red-400" /> Banni
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RestrictionBadge({
  restriction,
  onToggle
}: {
  restriction: ClientRestriction;
  onToggle: (newRestriction: ClientRestriction) => void
}) {
  const configs: Record<ClientRestriction, { label: string, color: string }> = {
    none: { label: "Aucune", color: "bg-muted text-muted-foreground" },
    "tables-only": { label: "Tables uniquement", color: "bg-amber-500/10 text-amber-500 border-amber-500/40" },
    "chairs-only": { label: "Chaises uniquement", color: "bg-orange-500/10 text-orange-500 border-orange-500/40" },
    all: { label: "Tout restreindre", color: "bg-red-500/10 text-red-500 border-red-500/40" },
  };

  const config = configs[restriction];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className={`flex items-center px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-all ${config.color}`}
        >
          {config.label}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Restrictions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onToggle("none")}>Pas de restriction</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggle("tables-only")}>Tables seulement</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggle("chairs-only")}>Chaises seulement</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggle("all")}>Tout restreindre</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { useClientStore } from "@/store/client-store";

export function ClientsTable() {
  const {
    searchQuery,
    setSearchQuery,
  } = useDashboardStore();

  const { clients, addClient, updateClient, deleteClient } = useClientStore();
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
    updateClient(clientId, { status: newStatus });
  };

  const toggleRestriction = (clientId: string, newRestriction: ClientRestriction) => {
    updateClient(clientId, { restrictions: newRestriction });
  };

  const handleAddClient = () => {
    if (!newClientData.name) return;

    addClient({
      id: `client-${Date.now()}`,
      name: newClientData.name,
      email: newClientData.email || `${newClientData.name.toLowerCase().replace(/\s/g, '.')}@example.mg`,
      phone: newClientData.phone || "034 XX XXX XX",
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${newClientData.name}`,
      status: "active",
      restrictions: "none",
      bookingCount: 0,
      lastInteraction: "Just joined",
      socials: {},
      history: []
    });

    setNewClientData({ name: "", email: "", phone: "" });
    setIsAddClientOpen(false);
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
          comparison = a.lastInteraction.localeCompare(b.lastInteraction);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "bookingCount":
          comparison = a.bookingCount - b.bookingCount;
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3.5 border-b">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-2" />
          <h3 className="font-semibold text-lg tracking-tight">Lead Management</h3>
          <div className="h-5 w-px bg-border hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Rechercher (Nom, Email, Tel...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 w-[250px] text-sm bg-muted/50 border-border/50"
              />
            </div>

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
              <TableHead className="w-[180px]">Contact</TableHead>
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
            {paginatedClients.map((client) => (
              <TableRow key={client.id} className="border-border/50 group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedClients.includes(client.id)}
                      onCheckedChange={() => toggleSelectClient(client.id)}
                      className="border-border/50 bg-background/70"
                    />
                    <div className="relative">
                      <Avatar className="size-8">
                        <AvatarImage src={client.avatar} />
                        <AvatarFallback>{client.name[0]}</AvatarFallback>
                      </Avatar>
                      {client.status === "subscribed" && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full border-2 border-background p-0.5">
                          <ShieldCheck className="size-2 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{client.name}</span>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{client.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={client.status} onToggle={(s) => toggleStatus(client.id, s)} />
                </TableCell>
                <TableCell>
                  <RestrictionBadge restriction={client.restrictions} onToggle={(r) => toggleRestriction(client.id, r)} />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Phone className="size-3 text-muted-foreground" />
                      {client.phone}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                      {client.email.split('@')[0]}@...
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {client.socials.facebook && (
                      <div title="Facebook" className="size-7 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-colors cursor-pointer">
                        <Facebook className="size-3.5" />
                      </div>
                    )}
                    {client.socials.whatsapp && (
                      <div title="WhatsApp" className="size-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer">
                        <MessageCircle className="size-3.5" />
                      </div>
                    )}
                    {!client.socials.facebook && !client.socials.whatsapp && (
                      <span className="text-xs text-muted-foreground italic">Aucun</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">{client.lastInteraction}</span>
                    <span className="text-[10px] text-muted-foreground">{client.bookingCount} réservations au total</span>
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
                            {client.history.map((h, i) => (
                              <div key={h.id} className="relative pl-6 pb-6 border-l border-border last:pb-0">
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
                            ))}
                            {client.history.length === 0 && (
                              <p className="text-center py-12 text-sm text-muted-foreground">Aucun historique disponible.</p>
                            )}
                          </div>
                        </SheetContent>
                      </Sheet>
                      <DropdownMenuItem className="text-red-500" onClick={() => toggleStatus(client.id, "banned")}>
                        <Ban className="size-4 mr-2" />
                        Bannir le client
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
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
    </div>
  );
}
