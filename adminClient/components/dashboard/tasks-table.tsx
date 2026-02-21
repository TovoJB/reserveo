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
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Check,
  X,
  Mail,
  Activity,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  Share2,
  Timer,
  Calendar,
  CreditCard,
  Users,
  Layout,
  Clock,
  Send,
  MoreHorizontal,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { format, isSameDay, parseISO, differenceInMinutes, differenceInHours, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Trash2, Eye, UserCheck, ShieldAlert, Zap } from "lucide-react";
import { useClientStore } from "@/store/client-store";
import { useBookingStore, Reservation as StoreReservation } from "@/store/booking-store";
import { useTypesStore, getPricingPolicyLabel } from "@/store/types-store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  useReservations,
  useUpdateReservationStatus,
  useDeleteReservation,
  type Reservation as BackendReservation,
} from "@/hooks/use-reservations";

// Simulated localized Booking types
export type BookingStatus = "confirmed" | "pending" | "cancelled";

export interface Booking {
  id: string;
  clientName: string;
  avatar: string;
  email: string;
  status: BookingStatus;
  entryTime: string;
  exitTime: string;
  isPaid: boolean;
  paymentMethod?: string;
  space: string;
  eventName: string;
  details?: string;
  createdAt: string;
  backendId?: number;
}

// Map backend status → local status
function mapStatus(s: BackendReservation["status"]): BookingStatus {
  if (s === "CONFIRMED" || s === "ARRIVED") return "confirmed";
  if (s === "CANCELLED") return "cancelled";
  return "pending";
}

// Map backend reservation → local Booking
function mapReservation(r: BackendReservation): Booking {
  const date = r.startDate ? r.startDate.split("T")[0] : "2026-01-01";
  const entry = r.startTime ? `${date} ${r.startTime}` : `${date} 00:00`;
  const exit = r.endTime ? `${date} ${r.endTime}` : `${date} 23:59`;
  return {
    id: String(r.id),
    backendId: r.id,
    clientName: r.customerName,
    avatar: `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(r.customerName)}`,
    email: r.customerPhone, // backend doesn't have email on reservation
    status: mapStatus(r.status),
    entryTime: entry,
    exitTime: exit,
    isPaid: r.status === "COMPLETED" || r.status === "ARRIVED",
    space: r.space?.name ?? `Space #${r.spaceId}`,
    eventName: r.space?.name ?? "—",
    createdAt: r.createdAt ?? new Date().toISOString(),
  };
}

// Map store reservation → local Booking
function mapStoreReservation(r: StoreReservation): Booking {
  const date = r.date.split("T")[0];
  const entry = r.entryTime ? r.entryTime : `${date} ${r.time}`;
  const exit = r.exitTime ? r.exitTime : `${date} ${r.time}`; // fallback
  const offer = r.customFields?.offer || "";
  const offerLabel = offer ? getPricingPolicyLabel(offer) : "";

  return {
    id: r.id,
    clientName: r.customerName,
    avatar: `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(r.customerName)}`,
    email: r.customerPhone,
    status: r.status as BookingStatus,
    entryTime: entry,
    exitTime: exit,
    isPaid: false, // fallback
    space: r.elementName ? `${r.elementName} (${r.elementType || "Place"})` : r.elementId,
    eventName: offerLabel || r.floorId,
    details: r.customFields?.reservedBy ? `Réservé par ${r.customFields.reservedBy}` : undefined,
    createdAt: new Date().toISOString(),
  };
}

const FALLBACK_BOOKINGS: Booking[] = [
  {
    id: "b1",
    clientName: "Sarah Rakoto",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=sarah",
    email: "sarah.r@example.mg",
    status: "confirmed",
    entryTime: `${format(new Date(), "yyyy-MM-dd")} 19:30`,
    exitTime: `${format(new Date(), "yyyy-MM-dd")} 22:30`,
    isPaid: true,
    paymentMethod: "Orange Money",
    space: "T01",
    eventName: "Restaurant",
    details: "Anniversaire surprise",
    createdAt: format(subDays(new Date(), 1), "yyyy-MM-dd HH:mm:ss")
  },
  {
    id: "b2",
    clientName: "James Andria",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=james",
    email: "james.a@gmail.com",
    status: "pending",
    entryTime: `${format(new Date(), "yyyy-MM-dd")} 20:00`,
    exitTime: `${format(new Date(), "yyyy-MM-dd")} 23:30`,
    isPaid: false,
    space: "T02",
    eventName: "Terrasse",
    createdAt: format(new Date(), "yyyy-MM-dd HH:mm:ss")
  },
  {
    id: "b3",
    clientName: "Daniela Lala",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=daniela",
    email: "daniela.l@outlook.com",
    status: "cancelled",
    entryTime: "2026-02-14 12:00",
    exitTime: "2026-02-14 14:00",
    isPaid: false,
    space: "chaise5",
    eventName: "etage:2",
    createdAt: "2026-02-10 09:00:00"
  }
];



type SortField = "name" | "entryTime" | "status" | "space" | "eventName";
type SortOrder = "asc" | "desc";

function BookingStatusBadge({
  status,
  onToggle
}: {
  status: BookingStatus;
  onToggle: (s: BookingStatus) => void
}) {
  const configs: Record<BookingStatus, { label: string, color: string, icon: any }> = {
    confirmed: { label: "Confirmé", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/40", icon: Check },
    pending: { label: "En attente", color: "bg-amber-500/10 text-amber-500 border-amber-500/40", icon: Clock },
    cancelled: { label: "Annulé", color: "bg-red-500/10 text-red-500 border-red-500/40", icon: X },
  };

  const config = configs[status];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold cursor-pointer hover:opacity-80 transition-all ${config.color}`}>
          <config.icon className="size-3" />
          {config.label}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Changer le statut</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onToggle("confirmed")}>Confirmé</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggle("pending")}>Mettre en attente</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggle("cancelled")}>Annuler</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TasksTable() {
  const { clients } = useClientStore();

  // ── Backend data ──────────────────────────────────────────────
  const { data: backendReservations, isLoading, isError, refetch } = useReservations();
  const updateStatusMutation = useUpdateReservationStatus();
  const deleteMutation = useDeleteReservation();

  // Map backend → local format, fallback to mock if unavailable
  const [localBookings, setLocalBookings] = useState<Booking[]>(FALLBACK_BOOKINGS);
  const { reservations: storeReservations } = useBookingStore();

  const bookings: Booking[] = useMemo(() => {
    let list: Booking[] = [];
    if (backendReservations && backendReservations.length > 0) {
      list = backendReservations.map(mapReservation);
    } else {
      list = [...localBookings];
    }

    // Merge store reservations if not already present (checking by id)
    const existingIds = new Set(list.map(b => b.id));
    Object.values(storeReservations).forEach(res => {
      if (!existingIds.has(res.id)) {
        list.push(mapStoreReservation(res));
      }
    });

    return list;
  }, [backendReservations, localBookings, storeReservations]);

  const isLive = !isError && !!backendReservations;
  // ─────────────────────────────────────────────────────────────

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("entryTime");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const filteredAndSortedBookings = useMemo(() => {
    const result = bookings.filter((b) => {
      const bDate = parseISO(b.entryTime.replace(" ", "T"));
      const isSameDate = isSameDay(bDate, selectedDate);
      const matchesSearch = b.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.space.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.eventName.toLowerCase().includes(searchQuery.toLowerCase());
      return isSameDate && matchesSearch;
    });

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name": comparison = a.clientName.localeCompare(b.clientName); break;
        case "entryTime": comparison = (a.entryTime ?? "").localeCompare(b.entryTime ?? ""); break;
        case "status": comparison = a.status.localeCompare(b.status); break;
        case "space": comparison = a.space.localeCompare(b.space); break;
        case "eventName": comparison = a.eventName.localeCompare(b.eventName); break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [bookings, searchQuery, sortField, sortOrder, selectedDate]);

  // Dates with bookings for calendar markers
  const datesWithBookings = useMemo(() => {
    return bookings.map(b => parseISO(b.entryTime.replace(" ", "T")));
  }, [bookings]);



  const totalPages = Math.ceil(filteredAndSortedBookings.length / itemsPerPage);
  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedBookings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedBookings, currentPage, itemsPerPage]);

  // Map local BookingStatus → backend status
  const toBackendStatus = (s: BookingStatus): BackendReservation["status"] => {
    if (s === "confirmed") return "CONFIRMED";
    if (s === "cancelled") return "CANCELLED";
    return "PENDING";
  };

  const toggleStatus = (id: string, s: BookingStatus) => {
    const booking = bookings.find(b => b.id === id);
    if (booking?.backendId) {
      updateStatusMutation.mutate({ id: booking.backendId, status: toBackendStatus(s) });
    } else {
      setLocalBookings(prev => prev.map(b => b.id === id ? { ...b, status: s } : b));
    }
  };

  const deleteBooking = (id: string) => {
    if (confirm("Supprimer cette réservation ?")) {
      const booking = bookings.find(b => b.id === id);
      if (booking?.backendId) {
        deleteMutation.mutate(booking.backendId);
      } else {
        setLocalBookings(prev => prev.filter(b => b.id !== id));
      }
    }
  };

  const calculateWaitTime = (createdAt: string) => {
    const created = parseISO(createdAt.replace(" ", "T"));
    const now = new Date();
    const diffMin = differenceInMinutes(now, created);
    if (diffMin < 0) return "0m";
    if (diffMin < 60) return `${diffMin}m`;
    const diffHrs = Math.floor(diffMin / 60);
    return `${diffHrs}h ${diffMin % 60}m`;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="w-full h-full flex flex-col bg-card text-card-foreground overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3.5 border-b">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${isLoading
              ? "border-amber-500/40 text-amber-500 bg-amber-500/10"
              : isLive
                ? "border-emerald-500/40 text-emerald-500 bg-emerald-500/10"
                : "border-muted text-muted-foreground bg-muted/30"
              }`}
          >
            {isLoading ? (
              <RefreshCw className="size-2.5 animate-spin" />
            ) : isLive ? (
              <Wifi className="size-2.5" />
            ) : (
              <WifiOff className="size-2.5" />
            )}
            {isLoading ? "Sync..." : isLive ? "Live" : "Mock"}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => refetch()}
            title="Rafraîchir"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <div className="h-5 w-px bg-border hidden sm:block" />
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Rechercher une réservation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 w-[250px] text-sm bg-muted/50 border-border/50"
            />
          </div>
        </div>


        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 bg-muted/50 border-border/50">
                <Calendar className="size-3.5" />
                <span>{selectedDate ? format(selectedDate, "PPP", { locale: fr }) : "Choisir date"}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarUI
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
                initialFocus
                modifiers={{ hasBooking: datesWithBookings }}
                modifiersStyles={{
                  hasBooking: { fontWeight: 'bold', border: '1px solid var(--primary)', borderRadius: '50%' }
                }}
              />
            </PopoverContent>
          </Popover>
          <div className="h-8 w-px bg-border mx-1 hidden sm:block" />
          <ThemeToggle />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/30 sticky top-0 z-10">
              <TableHead className="w-[180px]">Client</TableHead>
              <TableHead className="w-[180px]">Temps (In/Out)</TableHead>
              <TableHead className="w-[120px]">Statut</TableHead>
              <TableHead className="w-[150px]">Espace / Événement</TableHead>
              <TableHead className="w-[100px]">Paiement</TableHead>
              <TableHead className="w-[130px]">Attente / Info</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedBookings.map((booking) => {
              const clientMatch = clients.find(c => c.email === booking.email);
              const isBanned = clientMatch?.status === "banned";
              const isSubscribed = clientMatch?.status === "subscribed" || clientMatch?.status === "active";
              const effectiveStatus = isBanned ? "cancelled" : booking.status;

              return (
                <TableRow key={booking.id} className="border-border/50 group">
                  <TableCell className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setSelectedBooking(booking)}>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="size-8">
                          <AvatarImage src={booking.avatar} />
                          <AvatarFallback>{booking.clientName[0] || "U"}</AvatarFallback>
                        </Avatar>
                        {isSubscribed && (
                          <div title="Membre Vérifié" className="absolute -top-1 -right-1 bg-blue-500 rounded-full border-2 border-background p-0.5">
                            <UserCheck className="size-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{booking.clientName}</span>
                          {isSubscribed && <span title="Membre (Auto-confirmation active)"><Zap className="size-3 text-amber-500 fill-amber-500" /></span>}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">{booking.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-primary">
                        <Clock className="size-3" />
                        {booking.entryTime.split(" ")[1]} — {booking.exitTime.split(" ")[1]}
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="size-2.5" />
                        {booking.entryTime.split(" ")[0]}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <BookingStatusBadge status={effectiveStatus as any} onToggle={(s) => toggleStatus(booking.id, s)} />
                      {isBanned && (
                        <div className="flex items-center gap-1 text-[9px] text-red-600 font-bold uppercase py-0.5 animate-pulse">
                          <ShieldAlert className="size-3" /> Auto-Annulé (Banni)
                        </div>
                      )}
                      {!isBanned && isSubscribed && booking.status === "confirmed" && (
                        <div className="flex items-center gap-1 text-[9px] text-blue-600 font-bold uppercase py-0.5">
                          <Zap className="size-3" /> Auto-Confirmé
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                        <Layout className="size-3 text-primary" />
                        {booking.space}
                      </div>
                      <div className="text-[9px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 w-fit px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                        Offre: {booking.eventName}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {booking.isPaid ? (
                        <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 border-emerald-500/20 text-[9px] h-4">
                          Payé
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground text-[9px] h-4">
                          Non payé
                        </Badge>
                      )}
                      {booking.paymentMethod && <span className="text-[9px] italic opacity-60 text-center">{booking.paymentMethod}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {booking.status === "pending" && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 w-fit">
                          <Timer className="size-3" />
                          {calculateWaitTime(booking.createdAt)}
                        </div>
                      )}
                      {/* Removed individual detail button as clicking the user name now opens details */}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">
                          <Send className="size-4" /> Envoyer confirmation
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2" onClick={() => setLocalBookings(prev => prev.map((b: Booking) => b.id === booking.id ? { ...b, isPaid: true } : b))}>
                          <CreditCard className="size-4" /> Marquer comme payé
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500 gap-2" onClick={() => deleteBooking(booking.id)}>
                          <Trash2 className="size-4" /> Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Details Sheet */}
      <Sheet open={!!selectedBooking} onOpenChange={(o) => !o && setSelectedBooking(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Détails de la réservation</SheetTitle>
            <SheetDescription>Informations complètes sur la réservation de {selectedBooking?.clientName}</SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Espace & Type</p>
                <p className="text-sm font-semibold">{selectedBooking?.space}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Offre / Tarif</p>
                <p className="text-sm font-semibold text-amber-600">{selectedBooking?.eventName}</p>
              </div>
            </div>
            <div className="space-y-1 border-t pt-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Plage Horaire</p>
              <p className="text-sm">Du {selectedBooking?.entryTime ?? ""} au {selectedBooking?.exitTime ?? ""}</p>
            </div>
            <div className="space-y-1 border-t pt-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Statut du Paiement</p>
              <div className="flex items-center gap-2">
                <Badge variant={selectedBooking?.isPaid ? "default" : "outline"}>
                  {selectedBooking?.isPaid ? "PAYÉ" : "NON PAYÉ"}
                </Badge>
                <span className="text-sm text-muted-foreground italic">{selectedBooking?.paymentMethod}</span>
              </div>
            </div>
            {selectedBooking?.details && (
              <div className="space-y-1 border-t pt-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Commentaires / Détails</p>
                <p className="text-sm bg-muted/30 p-3 rounded-lg italic">"{selectedBooking.details}"</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <p className="text-sm text-muted-foreground">
          {filteredAndSortedBookings.length} réservations trouvées
        </p>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="size-8" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            <ChevronLeft className="size-4" />
          </Button>
          <div className="flex items-center gap-1 px-4">
            <span className="text-sm font-medium">{currentPage} / {totalPages || 1}</span>
          </div>
          <Button variant="outline" size="icon" className="size-8" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
