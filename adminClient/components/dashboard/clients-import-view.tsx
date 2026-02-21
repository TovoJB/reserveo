"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    LayoutGrid,
    Link as LinkIcon,
    FileJson,
    Check,
    ChevronRight,
    RefreshCcw,
    Search,
    Database,
    Table as TableIcon,
    ArrowRightLeft,
    Plus,
    X,
    Info,
    ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/store/dashboard-store";

const CLIENT_FIELDS = [
    { label: "Nom Complet", value: "name", required: true },
    { label: "Email", value: "email", required: true },
    { label: "Téléphone", value: "phone", required: false },
    { label: "Secteur / Activité", value: "activity", required: false },
    { label: "Source", value: "source", required: false },
];

interface Mapping {
    formField: string;
    clientField: string;
}

export function ClientsImportView() {
    const [formUrl, setFormUrl] = useState("");
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractedFields, setExtractedFields] = useState<string[]>([]);
    const [mappings, setMappings] = useState<Mapping[]>([]);
    const [step, setStep] = useState(1);

    const handleExtract = () => {
        if (!formUrl) return;
        setIsExtracting(true);
        // Simulation d'extraction
        setTimeout(() => {
            setExtractedFields([
                "Quel est votre nom ?",
                "Adresse e-mail de contact",
                "Numéro de téléphone",
                "Pourquoi souhaitez-vous nous rejoindre ?",
                "Date de naissance",
                "Comment nous avez-vous connu ?"
            ]);
            setIsExtracting(false);
            setStep(2);
        }, 1500);
    };

    const addMapping = (formField: string, clientField: string) => {
        if (mappings.find(m => m.clientField === clientField)) {
            setMappings(mappings.map(m => m.clientField === clientField ? { formField, clientField } : m));
        } else {
            setMappings([...mappings, { formField, clientField }]);
        }
    };

    const removeMapping = (clientField: string) => {
        setMappings(mappings.filter(m => m.clientField !== clientField));
    };

    const handleSync = () => {
        // Simulation de synchronisation
        setStep(3);
    };

    return (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 bg-background/50 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col gap-2 mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Sync Google Forms</h1>
                    <p className="text-muted-foreground">Automatisez l'importation de vos leads directement depuis vos formulaires Google.</p>
                </div>

                {/* Steps */}
                <div className="flex items-center gap-4 mb-8">
                    <div className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all",
                        step === 1 ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground"
                    )}>
                        <span className="size-5 rounded-full bg-white/20 flex items-center justify-center">1</span>
                        Source du Formulaire
                    </div>
                    <ArrowRightLeft className="size-4 text-muted-foreground" />
                    <div className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all",
                        step === 2 ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground"
                    )}>
                        <span className="size-5 rounded-full bg-white/20 flex items-center justify-center">2</span>
                        Mapping des Variables
                    </div>
                </div>

                {step === 1 ? (
                    <Card className="border-none shadow-xl bg-card/50 backdrop-blur-md overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LinkIcon className="size-5 text-emerald-500" />
                                Lier un nouveau formulaire
                            </CardTitle>
                            <CardDescription>Collez l'URL de votre Google Form pour extraire les champs.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="form-url">URL du Google Form (Public)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="form-url"
                                        placeholder="https://docs.google.com/forms/d/..."
                                        value={formUrl}
                                        onChange={(e) => setFormUrl(e.target.value)}
                                        className="h-12 bg-background/80"
                                    />
                                    <Button
                                        onClick={handleExtract}
                                        disabled={!formUrl || isExtracting}
                                        className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white"
                                    >
                                        {isExtracting ? (
                                            <>
                                                <RefreshCcw className="size-4 mr-2 animate-spin" />
                                                Extraction...
                                            </>
                                        ) : (
                                            <>
                                                <Search className="size-4 mr-2" />
                                                Analyser
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <p className="text-[10px] text-muted-foreground italic flex items-center gap-1 mt-1">
                                    <Info className="size-3" />
                                    Note: Assurez-vous que le formulaire est "Public" pour l'analyse initiale.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-6 border-t">
                                <div className="p-4 rounded-xl border bg-muted/30 flex items-start gap-3">
                                    <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                        <RefreshCcw className="size-5 text-emerald-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold">Sync Temps Réel</p>
                                        <p className="text-xs text-muted-foreground leading-relaxed">Chaque réponse est instantanément convertie en fiche client.</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl border bg-muted/30 flex items-start gap-3">
                                    <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                        <FileJson className="size-5 text-emerald-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold">Données Structurées</p>
                                        <p className="text-xs text-muted-foreground leading-relaxed">Mappage intelligent des champs textes, e-mails et téléphones.</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : step === 2 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-md">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center justify-between">
                                        Configuration du Mappage
                                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter bg-emerald-500/10 text-emerald-500 border-none">
                                            {extractedFields.length} Champs détectés
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription>Associez les réponses du formulaire aux données clients de Reserveo.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {CLIENT_FIELDS.map((field) => {
                                        const mapping = mappings.find(m => m.clientField === field.value);
                                        return (
                                            <div key={field.value} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold flex items-center gap-1.5">
                                                        {field.label}
                                                        {field.required && <span className="text-red-500">*</span>}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground uppercase font-medium">Variable Client</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <ArrowRightLeft className="size-4 text-muted-foreground hidden sm:block" />
                                                    <Select
                                                        value={mapping?.formField || ""}
                                                        onValueChange={(v) => addMapping(v, field.value)}
                                                    >
                                                        <SelectTrigger className="w-[200px] h-9 text-xs">
                                                            <SelectValue placeholder="Choisir un champ form" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {extractedFields.map(f => (
                                                                <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {mapping && (
                                                        <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => removeMapping(field.value)}>
                                                            <X className="size-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="border-none shadow-lg bg-primary/5 border-primary/10">
                                <CardHeader>
                                    <CardTitle className="text-sm">Aperçu Inbound</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-3 rounded-lg bg-background border space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="size-6 rounded-full bg-muted flex items-center justify-center">
                                                <Database className="size-3 text-primary" />
                                            </div>
                                            <span className="text-xs font-bold">Base de Données</span>
                                        </div>
                                        <div className="space-y-1 pl-8">
                                            <p className="text-[10px] flex justify-between">
                                                <span className="text-muted-foreground italic">Sync:</span>
                                                <span className="font-semibold text-emerald-500 flex items-center gap-1">
                                                    Actif <Check className="size-3" />
                                                </span>
                                            </p>
                                            <p className="text-[10px] flex justify-between">
                                                <span className="text-muted-foreground italic">Mappages:</span>
                                                <span className="font-semibold">{mappings.length} / {CLIENT_FIELDS.length}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full bg-primary text-primary-foreground h-10 shadow-lg shadow-primary/20"
                                        disabled={mappings.filter(m => CLIENT_FIELDS.find(cf => cf.value === m.clientField && cf.required)).length < 2}
                                        onClick={handleSync}
                                    >
                                        Démarrer la Sync
                                        <ChevronRight className="size-4 ml-2" />
                                    </Button>
                                    <p className="text-[9px] text-center text-muted-foreground px-4">
                                        En activant la sync, Reserveo créera une clé d'API sécurisée pour Google Forms.
                                    </p>
                                </CardContent>
                            </Card>

                            <Button variant="ghost" onClick={() => setStep(1)} className="w-full text-xs text-muted-foreground hover:text-foreground">
                                <ChevronRight className="size-3 mr-2 rotate-180" />
                                Changer d'URL
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center space-y-6 pt-12 animate-in fade-in zoom-in-95 duration-500">
                        <div className="size-24 rounded-full bg-emerald-500/20 flex items-center justify-center relative">
                            <div className="absolute inset-0 rounded-full border-4 border-emerald-500 animate-ping opacity-20" />
                            <Check className="size-12 text-emerald-500" />
                        </div>
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold">Synchronisation Activée !</h2>
                            <p className="text-muted-foreground max-w-sm">
                                Votre formulaire Google est maintenant lié à votre base de clients.
                                Les entrées apparaîtront avec le badge <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-none mx-1">Google Form</Badge>
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="h-11 px-8" onClick={() => setStep(1)}>
                                Nouveau Formulaire
                            </Button>
                            <Button className="h-11 px-8 bg-primary text-primary-foreground" onClick={() => window.location.href = '/?view=clients'}>
                                Voir mes Clients
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
