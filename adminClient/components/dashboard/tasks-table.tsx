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
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Simulated localized Booking types
export type BookingStatus = "confirmed" | "pending" | "cancelled";

export interface Booking {
  id: string;
  clientName: string;
  avatar: string;
  email: string;
  status: BookingStatus;
  time: string;
  date: string;
  isPaid: boolean;
  peopleCount: number;
  space: string;
}

const initialBookings: Booking[] = [
  {
    id: "b1",
    clientName: "Sarah Rakoto",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=sarah",
    email: "sarah.r@example.mg",
    status: "confirmed",
    time: "19:30",
    date: "2024-02-15",
    isPaid: true,
    peopleCount: 4,
    space: "Table 12 (Vue Mer)"
  },
  {
    id: "b2",
    clientName: "James Andria",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=james",
    email: "james.a@gmail.com",
    status: "pending",
    time: "20:00",
    date: "2024-02-15",
    isPaid: false,
    peopleCount: 2,
    space: "Zone Lounge"
  },
  {
    id: "b3",
    clientName: "Daniela Lala",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=daniela",
    email: "daniela.l@outlook.com",
    status: "cancelled",
    time: "12:00",
    date: "2024-02-14",
    isPaid: false,
    peopleCount: 6,
    space: "Grande Table 1"
  }
];

type SortField = "name" | "time" | "status" | "space";
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
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("time");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredAndSortedBookings = useMemo(() => {
    const result = bookings.filter((b) =>
      b.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.space.toLowerCase().includes(searchQuery.toLowerCase())
    );

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name": comparison = a.clientName.localeCompare(b.clientName); break;
        case "time": comparison = a.time.localeCompare(b.time); break;
        case "status": comparison = a.status.localeCompare(b.status); break;
        case "space": comparison = a.space.localeCompare(b.space); break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [bookings, searchQuery, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedBookings.length / itemsPerPage);
  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedBookings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedBookings, currentPage, itemsPerPage]);

  const toggleStatus = (id: string, s: BookingStatus) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: s } : b));
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="w-full h-full flex flex-col bg-card text-card-foreground overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3.5 border-b">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-2" />
          <h3 className="font-semibold text-lg tracking-tight">Booking Management</h3>
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
          <Button variant="outline" size="sm" className="h-8 gap-1.5 bg-muted/50 border-border/50">
            <Calendar className="size-3.5" />
            <span>Aujourd'hui</span>
          </Button>
          <div className="h-8 w-px bg-border mx-1 hidden sm:block" />
          <ThemeToggle />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/30 sticky top-0 z-10">
              <TableHead className="w-[200px]">Client</TableHead>
              <TableHead className="w-[120px]">Heure</TableHead>
              <TableHead className="w-[140px]">Statut</TableHead>
              <TableHead className="w-[180px]">Espace / Table</TableHead>
              <TableHead className="w-[100px]">Personnes</TableHead>
              <TableHead className="w-[120px]">Paiement</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedBookings.map((booking) => (
              <TableRow key={booking.id} className="border-border/50 group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarImage src={booking.avatar} />
                      <AvatarFallback>{booking.clientName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col truncate">
                      <span className="font-medium text-sm">{booking.clientName}</span>
                      <span className="text-[10px] text-muted-foreground">{booking.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 font-medium text-sm">
                    <Clock className="size-3.5 text-muted-foreground" />
                    {booking.time}
                  </div>
                </TableCell>
                <TableCell>
                  <BookingStatusBadge status={booking.status} onToggle={(s) => toggleStatus(booking.id, s)} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Layout className="size-3.5 text-muted-foreground" />
                    {booking.space}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Users className="size-3.5 text-muted-foreground" />
                    <span className="text-sm">{booking.peopleCount}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {booking.isPaid ? (
                    <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 border-emerald-500/20 text-[10px]">
                      Payé
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px]">
                      Non payé
                    </Badge>
                  )}
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
                      <DropdownMenuItem className="gap-2">
                        <CreditCard className="size-4" /> Marquer comme payé
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-500 gap-2">
                        <X className="size-4" /> Annuler
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
