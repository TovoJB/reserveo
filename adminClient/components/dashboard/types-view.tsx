"use client";

import { useTypesStore, EmplacementType, ReservationField, PricingPolicy, PRICING_POLICIES } from "@/store/types-store";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
    Plus, Trash2, Edit2, Check, X, Box, Settings2, FileText,
    Smartphone, ShieldCheck, Mail, Clock, Calendar, BadgeDollarSign,
    Timer, Sparkles, ChevronRight, CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function TypesView() {
    const {
        emplacementTypes, addEmplacementType, deleteEmplacementType, updateEmplacementType,
        reservationFields, addReservationField, deleteReservationField, updateReservationField,
        pricingPolicies, togglePricingPolicy, openingHours, updateOpeningHours
    } = useTypesStore();

    const [newTypeName, setNewTypeName] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");

    const [newFieldName, setNewFieldName] = useState("");
    const [newFieldType, setNewFieldType] = useState<ReservationField["type"]>("text");

    const handleAddType = () => {
        if (!newTypeName.trim()) return;
        addEmplacementType({ name: newTypeName });
        setNewTypeName("");
    };

    const handleAddField = () => {
        if (!newFieldName.trim()) return;
        addReservationField({
            name: newFieldName,
            type: newFieldType,
            isRequired: false,
            isConfirmationRequired: false
        });
        setNewFieldName("");
    };

    const policies = PRICING_POLICIES;

    const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

    return (
        <div className="flex flex-col flex-1 h-full bg-background overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 bg-muted/10">
                <div className="max-w-6xl mx-auto w-full pb-20 space-y-8">

                    {/* TOP SECTION: Quick Stats or Summary Badge */}
                    <div className="flex items-center gap-4 bg-primary/5 border border-primary/10 p-4 rounded-2xl shadow-sm">
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Sparkles className="size-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold">Configuration du système</h3>
                            <p className="text-xs text-muted-foreground">Centralisez vos tarifs, horaires et types d'emplacements.</p>
                        </div>
                        <Badge variant="outline" className="bg-background font-mono text-[10px]">{emplacementTypes.length} Types</Badge>
                        <Badge variant="outline" className="bg-background font-mono text-[10px]">{pricingPolicies.length} Tarifs</Badge>
                    </div>

                    <Card className="border-border/50 shadow-sm bg-card overflow-hidden">
                        <div className="p-8 space-y-12">

                            {/* Section 1: Pricing Policies */}
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-emerald-600">
                                        <BadgeDollarSign className="size-4" />
                                        <h2 className="text-sm font-bold uppercase tracking-wider">Politique de Temps & Prix</h2>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Sélectionnez les unités de facturation disponibles pour vos espaces.</p>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                    {policies.map((policy) => {
                                        const isActive = pricingPolicies.includes(policy.id);
                                        return (
                                            <button
                                                key={policy.id}
                                                onClick={() => togglePricingPolicy(policy.id)}
                                                className={cn(
                                                    "flex flex-col items-center justify-center p-4 rounded-xl border transition-all gap-2 relative group",
                                                    isActive
                                                        ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                                                        : "bg-background border-border hover:border-emerald-100 hover:bg-emerald-50/30 text-muted-foreground"
                                                )}
                                            >
                                                <div className={cn(
                                                    "size-8 rounded-lg flex items-center justify-center mb-1",
                                                    isActive ? "bg-emerald-100 text-emerald-600" : "bg-muted text-muted-foreground"
                                                )}>
                                                    <Timer className="size-4" />
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-tighter">{policy.label}</span>
                                                {isActive && <CheckCircle2 className="size-3 absolute top-2 right-2 text-emerald-600" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <Separator />

                            {/* Section 2: Opening Hours */}
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-amber-600">
                                        <Clock className="size-4" />
                                        <h2 className="text-sm font-bold uppercase tracking-wider">Horaires d'Ouverture</h2>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Définissez vos jours ouvrables et plages horaires pour le calcul des sorties.</p>
                                </div>

                                <div className="grid gap-2 border border-border/50 rounded-2xl overflow-hidden shadow-sm">
                                    {days.map((day) => {
                                        const config = openingHours[day];
                                        return (
                                            <div key={day} className={cn(
                                                "flex items-center justify-between p-4 transition-colors",
                                                config.isOpen ? "bg-background" : "bg-muted/30 grayscale-[0.5] opacity-60"
                                            )}>
                                                <div className="flex items-center gap-4 min-w-[120px]">
                                                    <Checkbox
                                                        id={`open-${day}`}
                                                        checked={config.isOpen}
                                                        onCheckedChange={(checked) => updateOpeningHours(day, { isOpen: !!checked })}
                                                        className="data-[state=checked]:bg-amber-500 border-amber-200"
                                                    />
                                                    <label htmlFor={`open-${day}`} className="text-sm font-bold w-20">{day}</label>
                                                </div>

                                                {config.isOpen ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Ouverture</span>
                                                            <Input
                                                                type="time"
                                                                value={config.openTime}
                                                                onChange={(e) => updateOpeningHours(day, { openTime: e.target.value })}
                                                                className="w-[110px] h-8 text-xs font-mono"
                                                            />
                                                        </div>
                                                        <ChevronRight className="size-3 text-muted-foreground" />
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Fermeture</span>
                                                            <Input
                                                                type="time"
                                                                value={config.closeTime}
                                                                onChange={(e) => updateOpeningHours(day, { closeTime: e.target.value })}
                                                                className="w-[110px] h-8 text-xs font-mono"
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-bold text-muted-foreground italic uppercase">Fermé</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <Separator />

                            {/* Section 3: Emplacement Types */}
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Box className="size-4" />
                                        <h2 className="text-sm font-bold uppercase tracking-wider">Catégories d'Emplacements</h2>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Définissez les types d'objets réservables dans votre établissement.</p>
                                </div>

                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Ex: Piscine, Espace fumeur..."
                                        value={newTypeName}
                                        onChange={(e) => setNewTypeName(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleAddType()}
                                        className="max-w-md h-9 text-sm"
                                    />
                                    <Button onClick={handleAddType} size="sm" className="gap-2 h-9 px-4">
                                        <Plus className="size-4" />
                                        Ajouter un type
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {emplacementTypes.map((type) => (
                                        <div key={type.id} className="group relative flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-lg bg-background border border-border/50 flex items-center justify-center text-primary shadow-sm">
                                                    <Box className="size-4" />
                                                </div>
                                                {editingId === type.id ? (
                                                    <Input
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="h-7 py-0 px-2 text-xs max-w-[100px]"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span className="text-xs font-semibold">{type.name}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {editingId === type.id ? (
                                                    <Button variant="ghost" size="icon" onClick={() => { updateEmplacementType(type.id, { name: editName }); setEditingId(null); }} className="h-7 w-7 text-emerald-500">
                                                        <Check className="size-4" />
                                                    </Button>
                                                ) : (
                                                    <>
                                                        <Button variant="ghost" size="icon" onClick={() => { setEditingId(type.id); setEditName(type.name); }} className="h-7 w-7">
                                                            <Edit2 className="size-3" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => deleteEmplacementType(type.id)} className="h-7 w-7 text-destructive/70 hover:text-destructive">
                                                            <Trash2 className="size-3" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            {/* Section 4: Reservation Fields */}
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-blue-600">
                                        <FileText className="size-4" />
                                        <h2 className="text-sm font-bold uppercase tracking-wider">Formulaire de Réservation</h2>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Configurez les informations requises lors du passage d'une réservation.</p>
                                </div>

                                <div className="flex gap-2 p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50 shadow-sm">
                                    <Input
                                        placeholder="Nom du champ (ex: N° Badge, Matricule...)"
                                        value={newFieldName}
                                        onChange={(e) => setNewFieldName(e.target.value)}
                                        className="bg-background h-10 border-blue-200/50 focus-visible:ring-blue-500"
                                    />
                                    <Select value={newFieldType} onValueChange={(v: any) => setNewFieldType(v)}>
                                        <SelectTrigger className="w-[150px] bg-background h-10 border-blue-200/50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="text">Texte</SelectItem>
                                            <SelectItem value="number">Nombre</SelectItem>
                                            <SelectItem value="phone">Téléphone</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button onClick={handleAddField} className="gap-2 h-10 bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95">
                                        <Plus className="size-4" />
                                        Ajouter au formulaire
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {reservationFields.map((field) => (
                                        <div key={field.id} className="flex items-center justify-between p-4 bg-background border border-border/50 rounded-2xl group hover:border-blue-200 transition-colors shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className={`size-10 rounded-xl flex items-center justify-center ${field.type === "phone" ? "bg-blue-50 text-blue-600" :
                                                    field.type === "text" ? "bg-slate-50 text-slate-600" :
                                                        "bg-emerald-50 text-emerald-600"
                                                    }`}>
                                                    {field.type === "phone" ? <Smartphone className="size-5" /> : field.type === "text" ? <Mail className="size-5" /> : <FileText className="size-5" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">{field.name}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter opacity-70">{field.type}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`req-${field.id}`}
                                                        checked={field.isRequired}
                                                        onCheckedChange={(checked) => updateReservationField(field.id, { isRequired: !!checked })}
                                                        className="data-[state=checked]:bg-blue-600 border-blue-200"
                                                    />
                                                    <label htmlFor={`req-${field.id}`} className="text-xs font-bold cursor-pointer text-slate-600">Obligatoire</label>
                                                </div>
                                                {field.type === "phone" && (
                                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
                                                        <Checkbox
                                                            id={`conf-${field.id}`}
                                                            checked={field.isConfirmationRequired}
                                                            onCheckedChange={(checked) => updateReservationField(field.id, { isConfirmationRequired: !!checked })}
                                                            className="data-[state=checked]:bg-emerald-600 border-emerald-200"
                                                        />
                                                        <label htmlFor={`conf-${field.id}`} className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 cursor-pointer">
                                                            <ShieldCheck className="size-3" />
                                                            OTP REQUIS
                                                        </label>
                                                    </div>
                                                )}
                                                <Button variant="ghost" size="icon" onClick={() => deleteReservationField(field.id)} className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
