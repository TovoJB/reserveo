"use client";

import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Monitor,
    Smartphone,
    EyeOff,
    Eye,
    Activity,
    Calendar,
    CheckCircle2,
    MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";

interface TeamMemberActivity {
    id: string;
    name: string;
    email: string;
    avatar: string;
    lastInteraction: string;
    confirmationsPerformed: number;
    confirmedReservations: string[];
    platform: "admin" | "mobile";
    isVisible: boolean;
    role: string;
}

const INITIAL_TEAM_DATA: TeamMemberActivity[] = [
    {
        id: "1",
        name: "Lova N. (Moi)",
        email: "lova@madaevent.mg",
        avatar: "https://api.dicebear.com/9.x/glass/svg?seed=Lova",
        lastInteraction: "22/02/2026 14:05",
        confirmationsPerformed: 124,
        confirmedReservations: ["Sarah Rakoto", "Antsa H.", "Mickael T.", "Jean P."],
        platform: "admin",
        isVisible: true,
        role: "Administrateur principal",
    },
    {
        id: "2",
        name: "Rindra M.",
        email: "rindra@madaevent.mg",
        avatar: "https://api.dicebear.com/9.x/glass/svg?seed=Rindra",
        lastInteraction: "22/02/2026 13:50",
        confirmationsPerformed: 45,
        confirmedReservations: ["James Andria", "Faly R.", "Hery L."],
        platform: "mobile",
        isVisible: true,
        role: "Agent de terrain",
    },
    {
        id: "3",
        name: "Tahina R.",
        email: "tahina@madaevent.mg",
        avatar: "https://api.dicebear.com/9.x/glass/svg?seed=Tahina",
        lastInteraction: "21/02/2026 18:30",
        confirmationsPerformed: 89,
        confirmedReservations: ["Daniela Lala", "Zaka M.", "Ndranto K."],
        platform: "admin",
        isVisible: true,
        role: "Staff Accueil",
    }
];

export function TeamsActivityTable() {
    const [data, setData] = useState<TeamMemberActivity[]>(INITIAL_TEAM_DATA);
    const [selectedMember, setSelectedMember] = useState<TeamMemberActivity | null>(null);

    const toggleVisibility = (id: string) => {
        setData(prev => prev.map(member =>
            member.id === id ? { ...member, isVisible: !member.isVisible } : member
        ));
    };

    const visibleMembers = useMemo(() => data.filter(m => m.isVisible), [data]);

    return (
        <div className="bg-card text-card-foreground rounded-xl border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                    <Activity className="size-4 text-primary" />
                    <h3 className="font-medium text-base text-foreground/80">Recapitulatif d&apos;activité de l&apos;Équipe</h3>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-1.5 border-border/50 bg-background hover:bg-muted transition-colors">
                            <Eye className="size-3.5 text-muted-foreground" />
                            <span className="text-xs">Filtre visibilité ({data.length - visibleMembers.length} masqué)</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        {data.map(member => (
                            <DropdownMenuItem
                                key={member.id}
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => toggleVisibility(member.id)}
                            >
                                <div className="flex items-center gap-2">
                                    <Avatar className="size-5">
                                        <AvatarImage src={member.avatar} />
                                        <AvatarFallback>{member.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs truncate max-w-[120px]">{member.name}</span>
                                </div>
                                {member.isVisible ? <CheckCircle2 className="size-3.5 text-emerald-500" /> : <EyeOff className="size-3.5 text-muted-foreground" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent bg-muted/10 border-b">
                            <TableHead className="w-[200px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">Membre</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dernière Interaction</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">Confirmations</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plateforme</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {visibleMembers.length > 0 ? (
                            visibleMembers.map((member) => (
                                <TableRow
                                    key={member.id}
                                    className="border-border/50 group cursor-pointer hover:bg-muted/40 transition-all active:scale-[0.99]"
                                    onClick={() => setSelectedMember(member)}
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="size-8 border-2 border-background shadow-sm ring-1 ring-border group-hover:ring-primary/50 transition-all">
                                                <AvatarImage src={member.avatar} />
                                                <AvatarFallback>{member.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm group-hover:text-primary transition-colors">{member.name}</span>
                                                <span className="text-[10px] text-muted-foreground">{member.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                            <Calendar className="size-3 text-primary/70" />
                                            {member.lastInteraction}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-sm font-bold text-foreground">{member.confirmationsPerformed}</span>
                                            <Badge variant="outline" className="text-[9px] h-4 bg-emerald-500/5 text-emerald-600 border-emerald-500/20 px-1 font-bold">
                                                FIXÉES
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            {member.platform === "admin" ? (
                                                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px] font-bold">
                                                    <Monitor className="size-3" />
                                                    WEB
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 text-[10px] font-bold">
                                                    <Smartphone className="size-3" />
                                                    MOBILE
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">
                                    Aucun membre visible dans le récapitulatif.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Sheet open={!!selectedMember} onOpenChange={(o) => !o && setSelectedMember(null)}>
                <SheetContent className="sm:max-w-md border-l border-border/50 shadow-2xl">
                    <SheetHeader className="pb-6 border-b">
                        <div className="flex items-center gap-4 mb-4">
                            <Avatar className="size-14 border-2 border-primary/20 p-0.5">
                                <AvatarImage src={selectedMember?.avatar} className="rounded-full" />
                                <AvatarFallback className="text-xl">{selectedMember?.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col text-left">
                                <SheetTitle className="text-xl font-bold text-foreground">{selectedMember?.name}</SheetTitle>
                                <SheetDescription className="text-xs font-semibold text-primary uppercase tracking-widest">{selectedMember?.role}</SheetDescription>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px]">ID: {selectedMember?.id}</Badge>
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px]">{selectedMember?.confirmationsPerformed} réservations validées</Badge>
                        </div>
                    </SheetHeader>

                    <div className="py-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-2">
                                <Activity className="size-3" /> Informations de Connexion
                            </h4>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="bg-muted/30 p-3 rounded-lg border border-border/50 flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Email de contact</span>
                                    <span className="text-sm font-medium text-foreground">{selectedMember?.email}</span>
                                </div>
                                <div className="bg-muted/30 p-3 rounded-lg border border-border/50 flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Dernière activité enregistrée</span>
                                    <span className="text-sm font-medium text-foreground">{selectedMember?.lastInteraction}</span>
                                </div>
                                <div className="bg-muted/30 p-3 rounded-lg border border-border/50 flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Plateforme principale</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        {selectedMember?.platform === "admin" ? <Monitor className="size-4 text-blue-500" /> : <Smartphone className="size-4 text-indigo-500" />}
                                        <span className="text-sm font-semibold">{selectedMember?.platform === "admin" ? "Dashboard Administrateur" : "Application Mobile Agent"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-2">
                                <CheckCircle2 className="size-3" /> Réservations confirmées
                            </h4>
                            <div className="bg-muted/20 rounded-xl border border-border/40 divide-y divide-border/30 overflow-hidden">
                                {selectedMember?.confirmedReservations.map((res, i) => (
                                    <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                        <span className="text-sm font-medium text-foreground/90">{res}</span>
                                        <Badge variant="outline" className="text-[9px] text-emerald-600 bg-emerald-50 border-emerald-100">CONFIRMÉ</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
