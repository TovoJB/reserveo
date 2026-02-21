"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Users,
    UserPlus,
    Mail,
    Lock,
    Smartphone,
    LayoutDashboard,
    Check,
    ShieldCheck,
    Trash2,
    MoreHorizontal,
    Monitor,
    SmartphoneIcon
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Member {
    id: string;
    name: string;
    email: string;
    platform: "mobile" | "admin";
    role: string;
    permissions: string[];
}

export function TeamsView() {
    const [members, setMembers] = useState<Member[]>([
        {
            id: "1",
            name: "Lova N.",
            email: "lova@madaevent.mg",
            platform: "admin",
            role: "Administrateur",
            permissions: ["Gérer le plan", "Gérer les clients", "Confirmation de réservation"]
        },
        {
            id: "2",
            name: "Rindra M.",
            email: "rindra@madaevent.mg",
            platform: "mobile",
            role: "Agent de terrain",
            permissions: ["Checking", "Confirmation de réservation"]
        }
    ]);

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newMember, setNewMember] = useState({
        email: "",
        password: "",
        platform: "admin" as "admin" | "mobile",
        permissions: [] as string[]
    });

    const adminPermissions = [
        "Créer le plan",
        "Gérer les clients",
        "Confirmation de réservation",
        "Analytics",
        "Paramètres système"
    ];

    const mobilePermissions = [
        "Checking (Check-in)",
        "Test de rendu",
        "Confirmation de réservation",
        "Scanner QR Code"
    ];

    const togglePermission = (perm: string) => {
        setNewMember(prev => ({
            ...prev,
            permissions: prev.permissions.includes(perm)
                ? prev.permissions.filter(p => p !== perm)
                : [...prev.permissions, perm]
        }));
    };

    const handleAddMember = () => {
        const member: Member = {
            id: Math.random().toString(36).substr(2, 9),
            name: newMember.email.split("@")[0],
            email: newMember.email,
            platform: newMember.platform,
            role: newMember.platform === "admin" ? "Admin Staff" : "Mobile Agent",
            permissions: newMember.permissions
        };
        setMembers([...members, member]);
        setIsAddDialogOpen(false);
        setNewMember({ email: "", password: "", platform: "admin", permissions: [] });
    };

    return (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4">

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary text-primary-foreground">
                            <UserPlus className="size-4 mr-2" />
                            Ajouter un membre
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Ajouter un nouveau membre</DialogTitle>
                            <DialogDescription>
                                Créez un compte pour un nouveau collaborateur et définissez ses droits.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-6 py-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            placeholder="nom@exemple.com"
                                            className="pl-9"
                                            value={newMember.email}
                                            onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Mot de passe</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            className="pl-9"
                                            value={newMember.password}
                                            onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label>Plateforme d'accès</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                                            newMember.platform === "admin" ? "border-primary bg-primary/5" : "border-muted bg-transparent hover:border-muted-foreground/30"
                                        )}
                                        onClick={() => setNewMember({ ...newMember, platform: "admin", permissions: [] })}
                                    >
                                        <Monitor className={cn("size-5", newMember.platform === "admin" ? "text-primary" : "text-muted-foreground")} />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold">Admin Dashboard</span>
                                            <span className="text-[10px] text-muted-foreground">Accès ordinateur</span>
                                        </div>
                                    </div>
                                    <div
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                                            newMember.platform === "mobile" ? "border-primary bg-primary/5" : "border-muted bg-transparent hover:border-muted-foreground/30"
                                        )}
                                        onClick={() => setNewMember({ ...newMember, platform: "mobile", permissions: [] })}
                                    >
                                        <SmartphoneIcon className={cn("size-5", newMember.platform === "mobile" ? "text-primary" : "text-muted-foreground")} />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold">Application Mobile</span>
                                            <span className="text-[10px] text-muted-foreground">Accès terrain</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-muted">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Autorisations</Label>
                                <div className="grid grid-cols-1 gap-2">
                                    {(newMember.platform === "admin" ? adminPermissions : mobilePermissions).map((perm) => (
                                        <div key={perm} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={perm}
                                                checked={newMember.permissions.includes(perm)}
                                                onCheckedChange={() => togglePermission(perm)}
                                            />
                                            <Label htmlFor={perm} className="text-sm font-normal cursor-pointer">
                                                {perm}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
                            <Button onClick={handleAddMember} disabled={!newMember.email || !newMember.password}>
                                Créer l'accès
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.map((member) => (
                    <Card key={member.id} className="relative overflow-hidden group hover:shadow-md transition-all">
                        <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="size-10 border">
                                        <AvatarImage src={`https://api.dicebear.com/9.x/glass/svg?seed=${member.name}`} />
                                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-sm">{member.name}</span>
                                        <span className="text-xs text-muted-foreground">{member.email}</span>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="size-8">
                                            <MoreHorizontal className="size-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Modifier</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                                            <Trash2 className="size-4 mr-2" />
                                            Supprimer
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    {member.platform === "admin" ? (
                                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-none font-medium flex items-center gap-1 py-0.5">
                                            <LayoutDashboard className="size-3" />
                                            Admin
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-purple-500/10 text-purple-500 border-none font-medium flex items-center gap-1 py-0.5">
                                            <Smartphone className="size-3" />
                                            Mobile App
                                        </Badge>
                                    )}
                                </div>
                                <span className="text-[10px] font-medium text-muted-foreground uppercase">{member.role}</span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-1.5 text-xs font-semibold">
                                    <ShieldCheck className="size-3.5 text-primary" />
                                    Permissions
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {member.permissions.map((p, i) => (
                                        <Badge key={i} variant="outline" className="text-[9px] font-normal px-1.5 py-0 border-muted">
                                            {p}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
