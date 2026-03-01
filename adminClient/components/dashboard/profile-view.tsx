"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Building,
    Globe,
    Gem,
    CheckCircle2,
    Check,
    ChevronRight,
    ChevronLeft,
    Image as ImageIcon,
    Upload,
    Camera,
    Coins,
    Store,
    Zap,
    Users2,
    Heart,
    LayoutDashboard,
    CalendarDays,
    Briefcase,
    UtensilsCrossed,
    ArrowRight,
    Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/store/dashboard-store";
import { useConfiguration } from "@/hooks/use-configuration";
import { useAccountSync } from "@/hooks/use-account-sync";
import { useApi } from "@/hooks/use-api";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const getSteps = (usageType: string | null) => {
    const isPersonal = usageType === "PERSONAL";

    return [
        { id: "summary", title: "Profil", icon: LayoutDashboard, description: "Type d'activité" },
        {
            id: "details",
            title: isPersonal ? "Événement" : "Entreprise",
            icon: isPersonal ? Heart : Building,
            description: isPersonal ? "Détails" : "Infos de base"
        },
        {
            id: "visuals",
            title: "Visuels",
            icon: ImageIcon,
            description: isPersonal ? "Photos" : "Logo & Photos",
            hidden: isPersonal
        },
        { id: "prefs", title: "Préférences", icon: Globe, description: "Langue & Devise" },
        { id: "plan", title: "plan", icon: Gem, description: "Choisir un plan" }
    ].filter(s => !s.hidden);
};

const CURRENCIES = [
    { label: "Euro (€)", value: "EUR" },
    { label: "Ariary Malgache (Ar)", value: "MGA" },
    { label: "US Dollar ($)", value: "USD" },
];

const COUNTRIES = [
    { label: "Madagascar", value: "MG" },
    { label: "France", value: "FR" },
    { label: "Maurice", value: "MU" },
    { label: "Canada", value: "CA" },
];

const BUSINESS_TYPES = [
    {
        id: "space-management",
        title: "Gestion d'un Espace fixe",
        description: "Co-working, Restaurant, Salle de sport, Spa...",
        icon: Store,
        details: "Optimisé pour la gestion de plans de table fiches, réservations horaires et occupation de lieux."
    },
    {
        id: "event-organizer",
        title: "Organisateur d'Événements",
        description: "Mariages, Conférences, Concerts (Multi-événements)",
        icon: CalendarDays,
        details: "Optimisé pour la gestion de calendriers multiples, listes d'invités et logistique d'événements en parallèle."
    }
];

const PLANS = [
    {
        id: "starter",
        name: "Starter",
        price: "99,000 Ar",
        period: "/mois",
        features: ["Jusqu'à 100 réservations", "5 membres d'équipe", "Support email"],
        icon: Zap,
        color: "text-blue-500",
        bg: "bg-blue-500/10"
    },
    {
        id: "pro",
        name: "Business Pro",
        price: "249,000 Ar",
        period: "/mois",
        features: ["Réservations illimitées", "Membres illimités", "Analytics avancés", "Priorité support"],
        icon: Briefcase,
        color: "text-primary",
        bg: "bg-primary/10",
        featured: true
    },
    {
        id: "enterprise",
        name: "Enterprise",
        price: "Sur devis",
        period: "",
        features: ["Marque blanche", "API accès", "Gestionnaire dédié", "SLA garanti"],
        icon: Gem,
        color: "text-purple-500",
        bg: "bg-purple-500/10"
    }
];

export function ProfileView() {
    const router = useRouter();
    const { workspaceType, usageType } = useDashboardStore();
    const { eventPricing } = useConfiguration();
    const activeSteps = getSteps(usageType);
    const isPersonal = usageType === "PERSONAL";

    const { me, sync } = useAccountSync();
    const api = useApi();

    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        businessType: workspaceType === "fixed" ? "space-management" : "event-organizer",
        companyName: "",
        description: "",
        activity: "",
        address: "",
        logo: "",
        spaceImages: [] as string[],
        language: "fr",
        country: "MG",
        currency: "MGA",
        selectedPlan: "pro",
    });

    const currentStepId = activeSteps[currentStep]?.id;
    const isInitialLoad = useRef(true);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Detect if profile is marked as completed in DB
    const completedProfile = (() => {
        if (!me?.onboardingData) return null;
        try {
            const parsed = typeof me.onboardingData === 'string' ? JSON.parse(me.onboardingData) : me.onboardingData;
            if (parsed?.isComplete) {
                return parsed;
            }
        } catch {
            // ignore parse errors
        }
        return null;
    })();

    const isProfileComplete = !!completedProfile;
    const completedFormData = completedProfile?.formData || formData;

    // Load progressively saved progress from Database or localStorage
    useEffect(() => {
        if (!isInitialLoad.current) return;

        const savedData = localStorage.getItem("madaevent-profile-form");
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.formData) setFormData(parsed.formData);
                if (parsed.currentStep !== undefined) setCurrentStep(parsed.currentStep);
                isInitialLoad.current = false;
                return;
            } catch (e) { }
        }

        if (me?.onboardingData) {
            try {
                const parsed = typeof me.onboardingData === 'string' ? JSON.parse(me.onboardingData) : me.onboardingData;
                if (parsed.formData) setFormData(parsed.formData);
                if (parsed.currentStep !== undefined) setCurrentStep(parsed.currentStep);
                isInitialLoad.current = false;
            } catch (e) { }
        }
    }, [me]);

    // Save progress to localStorage as they type
    useEffect(() => {
        if (!isInitialLoad.current) {
            localStorage.setItem("madaevent-profile-form", JSON.stringify({ formData, currentStep, isComplete: false }));
        }
    }, [formData, currentStep]);

    const saveDraftToDB = async (step: number) => {
        const draftData = { formData, currentStep: step, isComplete: false };
        await api.post('/auth/draft', { draftData })
            .then(() => {
                // Inform header to refetch me state only when saving to DB
                window.dispatchEvent(new Event("profileDraftUpdated"));
            })
            .catch(e => console.error(e));
    };

    const nextStep = () => {
        if (currentStep < activeSteps.length - 1) {
            setCurrentStep(currentStep + 1);
            saveDraftToDB(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            saveDraftToDB(currentStep - 1);
        }
    };

    const handleFinish = async () => {
        const draftData = { formData, currentStep, isComplete: true };
        await api.post('/auth/draft', { draftData }).catch(e => console.error(e));
        localStorage.removeItem("madaevent-profile-form");
        window.dispatchEvent(new Event("profileDraftUpdated"));
        router.push("/dashboard");
    };

    const handleCompleteLater = async () => {
        await saveDraftToDB(currentStep);
        router.push("/dashboard");
    };

    const displayPlans = isPersonal ? eventPricing.map(rule => ({
        id: `event-${rule.min_guests}`,
        name: rule.label,
        price: `${rule.price.toLocaleString()} Ar`,
        period: "/événement",
        features: [`Maximum ${rule.max_guests} invités`, "Gestion simplifiée", "Support plan de salle"],
        icon: Heart,
        color: "text-primary",
        bg: "bg-primary/5",
        featured: rule.max_guests === 50
    })) : PLANS;

    // If profile is completed, show a normal, read-only profile view instead of the stepper
    if (isProfileComplete) {
        return (
            <div className="h-full w-full overflow-y-auto pb-24 p-4 sm:p-6 lg:p-8 space-y-8 bg-background/50">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="size-16 border-4 border-background shadow-lg">
                                <AvatarImage src={completedFormData.logo || ""} />
                                <AvatarFallback className="bg-muted text-lg font-bold">
                                    {completedFormData.companyName?.[0] || "M"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h1 className="text-2xl font-bold tracking-tight">
                                    {completedFormData.companyName || "Profil MadaEvent"}
                                </h1>
                                <p className="text-sm text-muted-foreground max-w-lg">
                                    {completedFormData.description || "Profil configuré. Vous pouvez le modifier à tout moment."}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                    {workspaceType && (
                                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold uppercase tracking-widest">
                                            {workspaceType === "fixed" ? "Établissement" : "Organisateur d'Événements"}
                                        </Badge>
                                    )}
                                    <Badge variant="outline" className="text-[10px]">
                                        {isPersonal ? "Usage personnel" : "Usage professionnel"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="self-start"
                            onClick={() => router.push("/dashboard?view=profile&setup=" + (workspaceType || ""))}
                        >
                            Modifier le profil
                        </Button>
                    </div>

                    {/* Main content */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Colonne gauche : Infos générales */}
                        <Card className="md:col-span-2 border-none shadow-sm bg-card/60 backdrop-blur">
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Building className="size-4 text-primary" />
                                    Informations générales
                                </CardTitle>
                                <CardDescription>Résumé de votre activité et de vos préférences.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-[11px] text-muted-foreground">Nom commercial / Événement</Label>
                                        <p className="font-medium">{completedFormData.companyName || "Non renseigné"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[11px] text-muted-foreground">Type d'activité</Label>
                                        <p className="font-medium">
                                            {completedFormData.activity || (isPersonal ? "Événement unique" : "Non renseigné")}
                                        </p>
                                    </div>
                                    {!isPersonal && (
                                        <div className="space-y-1 sm:col-span-2">
                                            <Label className="text-[11px] text-muted-foreground">Adresse</Label>
                                            <p className="font-medium">
                                                {completedFormData.address || "Non renseignée"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[11px] text-muted-foreground">
                                        {isPersonal ? "Notes" : "Description courte"}
                                    </Label>
                                    <p className="font-medium whitespace-pre-line">
                                        {completedFormData.description || "Aucune description ajoutée pour le moment."}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Colonne droite : Paramètres & Plan */}
                        <div className="space-y-4">
                            <Card className="border-none shadow-sm bg-card/60 backdrop-blur">
                                <CardHeader>
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Globe className="size-4 text-primary" />
                                        Paramètres
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Pays</span>
                                        <span className="font-medium">
                                            {COUNTRIES.find(c => c.value === completedFormData.country)?.label || "Non défini"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Langue</span>
                                        <span className="font-medium uppercase">{completedFormData.language}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Devise</span>
                                        <span className="font-medium">
                                            {CURRENCIES.find(c => c.value === completedFormData.currency)?.label || completedFormData.currency}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm bg-card/60 backdrop-blur">
                                <CardHeader>
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Gem className="size-4 text-primary" />
                                        Formule
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-xs">
                                    {displayPlans.map(plan => (
                                        plan.id === completedFormData.selectedPlan && (
                                            <div key={plan.id} className="space-y-1">
                                                <p className="font-semibold text-sm">{plan.name}</p>
                                                <p className="text-muted-foreground">
                                                    {plan.price} {plan.period}
                                                </p>
                                            </div>
                                        )
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Visuels */}
                    {completedFormData.logo || (completedFormData.spaceImages && completedFormData.spaceImages.length > 0) ? (
                        <Card className="border-none shadow-sm bg-card/60 backdrop-blur">
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <ImageIcon className="size-4 text-primary" />
                                    Visuels publics
                                </CardTitle>
                                <CardDescription>Logo et galerie utilisés sur vos interfaces clientes.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {completedFormData.logo && (
                                        <div className="space-y-2">
                                            <Label className="text-[11px] text-muted-foreground">Logo</Label>
                                            <Avatar className="size-20 border-4 border-background shadow-lg">
                                                <AvatarImage src={completedFormData.logo} />
                                                <AvatarFallback className="bg-muted">
                                                    <Store className="size-8 text-muted-foreground" />
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                    )}
                                    {completedFormData.spaceImages && completedFormData.spaceImages.length > 0 && (
                                        <div className="flex-1 space-y-2">
                                            <Label className="text-[11px] text-muted-foreground">Galerie</Label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {completedFormData.spaceImages.map((url: string, idx: number) => (
                                                    <div
                                                        key={idx}
                                                        className="aspect-video rounded-lg bg-cover bg-center overflow-hidden border relative cursor-pointer"
                                                        style={{ backgroundImage: `url("${url}")` }}
                                                        onClick={() => setPreviewImage(url)}
                                                    >
                                                        <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-colors" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : null}

                    {previewImage && (
                        <Dialog open={!!previewImage} onOpenChange={(open) => { if (!open) setPreviewImage(null); }}>
                            <DialogContent className="max-w-3xl p-0 bg-transparent border-none shadow-none">
                                <img
                                    src={previewImage}
                                    alt="Aperçu de l'image"
                                    className="w-full h-auto rounded-lg"
                                />
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-y-auto pb-24 p-4 sm:p-6 lg:p-8 space-y-8 bg-background/50">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col gap-2 mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight">Configuration de MadaEvent</h1>
                    <p className="text-muted-foreground">Personnalisez votre interface selon vos besoins métiers.</p>
                </div>

                {/* Stepper Navigation */}
                <div className="flex items-center justify-between mb-12 relative overflow-x-auto pb-4 sm:pb-0">
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-10 mx-10 hidden sm:block" />

                    {activeSteps.map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2 flex-1 min-w-[100px]">
                            <div className={cn(
                                "size-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                currentStep === idx ? "bg-primary border-primary text-primary-foreground scale-110 shadow-lg" :
                                    idx < currentStep ? "bg-primary/20 border-primary text-primary" :
                                        "bg-background border-muted text-muted-foreground"
                            )}>
                                {idx < currentStep ? <Check className="size-5" /> : <step.icon className="size-5" />}
                            </div>
                            <div className="flex flex-col items-center text-center hidden sm:flex">
                                <span className={cn("text-xs font-semibold whitespace-nowrap", currentStep === idx ? "text-primary" : "text-muted-foreground")}>
                                    {step.title}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className="min-h-[450px]">
                    {currentStepId === "summary" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="text-center space-y-2 mb-4">
                                <h2 className="text-2xl font-black tracking-tight">Votre Configuration Actuelle</h2>
                                <p className="text-sm text-muted-foreground font-medium">Voici le type de compte que vous utilisez.</p>
                            </div>

                            <div className="max-w-md mx-auto">
                                <Card className="border-2 border-primary/20 bg-primary/5 shadow-xl shadow-primary/5 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4">
                                        <Badge className="bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-wider">votre choix</Badge>
                                    </div>
                                    <CardHeader className="pt-8">
                                        <div className={cn(
                                            "size-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-500",
                                            workspaceType === "fixed" ? "bg-blue-500/10 text-blue-600" :
                                                isPersonal ? "bg-primary/10 text-primary" : "bg-indigo-500/10 text-indigo-600"
                                        )}>
                                            {workspaceType === "fixed" ? <Store className="size-8" /> :
                                                isPersonal ? <Heart className="size-8" /> : <Briefcase className="size-8" />}
                                        </div>
                                        <CardTitle className="text-2xl font-black">
                                            {workspaceType === "fixed" ? "Gestion d'Espace Fixe" :
                                                isPersonal ? "Usage Personnel" : "Organisateur Pro"}
                                        </CardTitle>
                                        <CardDescription className="text-sm font-medium leading-relaxed">
                                            {workspaceType === "fixed"
                                                ? "Optimisé pour la gestion de plans de table, réservations horaires et occupation de lieux (Co-working, Resto)."
                                                : isPersonal
                                                    ? "Idéal pour un événement unique comme un mariage ou une fête privée. Interface simplifiée."
                                                    : "Conçu pour les agences et entreprises gérant plusieurs événements en parallèle."}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pb-8">
                                        <Button variant="link" className="p-0 h-auto text-primary font-bold text-xs hover:no-underline flex items-center gap-1">
                                            Changer de type d'activité <ChevronRight className="size-3" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {currentStepId === "details" && (
                        <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {isPersonal ? <Heart className="size-5 text-primary" /> : <Store className="size-5 text-primary" />}
                                    {isPersonal ? "Détails de l'événement" : "Profil de l'activité"}
                                </CardTitle>
                                <CardDescription>
                                    {isPersonal
                                        ? "Donnez un nom et une date approximative à votre célébration."
                                        : "Décrivez votre entreprise et votre domaine d'activité."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="companyName">
                                            {isPersonal ? "Nom de l'événement" : "Nom commercial"}
                                        </Label>
                                        <Input
                                            id="companyName"
                                            placeholder={isPersonal ? "Ex: Mariage de Sarah & Marc" : "Ex: MadaEvent SARL"}
                                            value={formData.companyName}
                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                            className="h-11"
                                        />
                                    </div>

                                    {!isPersonal && (
                                        <div className="space-y-2">
                                            <Label htmlFor="activity">Type d'activité / Secteur</Label>
                                            <Input
                                                id="activity"
                                                placeholder="Ex: Restaurant gastronomique, Agence événementielle, Co-working..."
                                                value={formData.activity}
                                                onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                                                className="h-11"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="description">
                                            {isPersonal ? "Petit mot doux / Notes" : "Description courte"}
                                        </Label>
                                        <Textarea
                                            id="description"
                                            placeholder={isPersonal
                                                ? "Quelques mots sur votre événement..."
                                                : "Dites-nous en plus sur vos services et ce qui vous rend unique..."}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="min-h-[120px] resize-none"
                                        />
                                    </div>

                                    {!isPersonal && (
                                        <div className="space-y-2">
                                            <Label htmlFor="address">Adresse physique</Label>
                                            <Input
                                                id="address"
                                                placeholder="Ex: 45 Rue de l'Indépendance, Antananarivo"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                className="h-11"
                                            />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {currentStepId === "visuals" && (
                        <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ImageIcon className="size-5 text-primary" />
                                    Identité Visuelle
                                </CardTitle>
                                <CardDescription>Importez votre logo et des photos de présentation.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="space-y-2 text-center md:text-left shrink-0">
                                        <Label>Logo / Avatar</Label>
                                        <div className="relative group">
                                            <Avatar
                                                className="size-32 border-4 border-background shadow-xl cursor-pointer"
                                                onClick={() => {
                                                    if (formData.logo) {
                                                        setPreviewImage(formData.logo);
                                                    }
                                                }}
                                            >
                                                <AvatarImage src={formData.logo || ""} />
                                                <AvatarFallback className="bg-muted">
                                                    <Store className="size-12 text-muted-foreground" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                onClick={() => document.getElementById("profile-logo-input")?.click()}
                                            >
                                                <Camera className="size-6 text-white" />
                                            </div>
                                        </div>
                                        <input
                                            id="profile-logo-input"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                const reader = new FileReader();
                                                reader.onloadend = async () => {
                                                    try {
                                                        const base64 = reader.result as string;
                                                        const response = await api.post("/auth/profile/upload", {
                                                            file: base64,
                                                            kind: "logo",
                                                            mimeType: file.type
                                                        });
                                                        const url = response.data.url as string;
                                                        setFormData((prev) => ({ ...prev, logo: url }));
                                                    } catch (error) {
                                                        console.error(error);
                                                    }
                                                };
                                                reader.readAsDataURL(file);
                                            }}
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2 w-full"
                                            onClick={() => document.getElementById("profile-logo-input")?.click()}
                                        >
                                            Charger le logo
                                        </Button>
                                        {formData.logo && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="mt-1 w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={async () => {
                                                    try {
                                                        await api.post("/auth/profile/delete", { url: formData.logo });
                                                    } catch (e) {
                                                        console.error(e);
                                                    }
                                                    setFormData((prev) => ({ ...prev, logo: "" }));
                                                    saveDraftToDB(currentStep);
                                                }}
                                            >
                                                <Trash2 className="size-4 mr-1" />
                                                Supprimer le logo
                                            </Button>
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-4 w-full">
                                        <Label>Galerie photos (Slide)</Label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            <div
                                                className="aspect-video border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
                                                onClick={() => document.getElementById("profile-gallery-input")?.click()}
                                            >
                                                <div className="text-center">
                                                    <Upload className="size-5 mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
                                                    <span className="text-[10px] text-muted-foreground">Téléverser</span>
                                                </div>
                                            </div>
                                            {formData.spaceImages.map((url, idx) => (
                                                <div
                                                    key={idx}
                                                    className="aspect-video rounded-lg bg-cover bg-center overflow-hidden border relative group"
                                                    style={{ backgroundImage: `url("${url}")` }}
                                                    onClick={() => setPreviewImage(url)}
                                                >
                                                    <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-colors" />
                                                    <button
                                                        type="button"
                                                        className="absolute top-1 right-1 rounded-full bg-black/60 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            try {
                                                                await api.post("/auth/profile/delete", { url });
                                                            } catch (err) {
                                                                console.error(err);
                                                            }
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                spaceImages: prev.spaceImages.filter((u) => u !== url),
                                                            }));
                                                            saveDraftToDB(currentStep);
                                                        }}
                                                    >
                                                        <Trash2 className="size-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <input
                                            id="profile-gallery-input"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={async (e) => {
                                                const files = Array.from(e.target.files || []);
                                                if (!files.length) return;

                                                const uploadPromises = files.map((file) => {
                                                    return new Promise<string>((resolve, reject) => {
                                                        const reader = new FileReader();
                                                        reader.onloadend = async () => {
                                                            try {
                                                                const base64 = reader.result as string;
                                                                const response = await api.post("/auth/profile/upload", {
                                                                    file: base64,
                                                                    kind: "gallery",
                                                                    mimeType: file.type
                                                                });
                                                                resolve(response.data.url as string);
                                                            } catch (error) {
                                                                console.error(error);
                                                                reject(error);
                                                            }
                                                        };
                                                        reader.readAsDataURL(file);
                                                    });
                                                });

                                                try {
                                                    const urls = await Promise.all(uploadPromises);
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        spaceImages: [...prev.spaceImages, ...urls],
                                                    }));
                                                } catch {
                                                    // erreurs déjà loggées
                                                }
                                            }}
                                        />
                                        <p className="text-[10px] text-muted-foreground italic">
                                            Ces images apparaîtront sous forme de slider sur votre page publique.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {currentStepId === "prefs" && (
                        <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="size-5 text-primary" />
                                    Paramètres Régionaux
                                </CardTitle>
                                <CardDescription>Paramétrez votre localisation et votre devise.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Pays d'Origine</Label>
                                        <Select
                                            value={formData.country}
                                            onValueChange={(v) => setFormData({ ...formData, country: v })}
                                        >
                                            <SelectTrigger className="h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {COUNTRIES.map(c => (
                                                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Langue de l'interface</Label>
                                        <Select
                                            value={formData.language}
                                            onValueChange={(v) => setFormData({ ...formData, language: v })}
                                        >
                                            <SelectTrigger className="h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="fr">Français (Défaut)</SelectItem>
                                                <SelectItem value="en">English</SelectItem>
                                                <SelectItem value="mg">Malagasy</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Coins className="size-4 text-primary" />
                                            Devise de facturation
                                        </Label>
                                        <Select
                                            value={formData.currency}
                                            onValueChange={(v) => setFormData({ ...formData, currency: v })}
                                        >
                                            <SelectTrigger className="h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CURRENCIES.map(c => (
                                                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {currentStepId === "plan" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="text-center space-y-2 mb-4">
                                <h2 className="text-xl font-bold">Choisir votre formule</h2>
                                <p className="text-sm text-muted-foreground">
                                    {isPersonal ? "Tarification unique par événement." : "Abonnement mensuel pour les professionnels."}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                                {displayPlans.map((plan) => (
                                    <Card
                                        key={plan.id}
                                        className={cn(
                                            "relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1",
                                            formData.selectedPlan === plan.id ? "ring-2 ring-primary border-primary bg-primary/5 shadow-xl shadow-primary/10" : "bg-card/50 opacity-80"
                                        )}
                                        onClick={() => setFormData({ ...formData, selectedPlan: plan.id })}
                                    >
                                        {plan.featured && (
                                            <div className="absolute top-0 right-0">
                                                <div className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                                                    Conseillé
                                                </div>
                                            </div>
                                        )}
                                        <CardHeader>
                                            <div className={cn("size-10 rounded-lg flex items-center justify-center mb-3", plan.bg)}>
                                                <plan.icon className={cn("size-6", plan.color)} />
                                            </div>
                                            <CardTitle className="text-lg">{plan.name}</CardTitle>
                                            <div className="flex items-baseline gap-1 pt-2">
                                                <span className="text-2xl font-bold">{plan.price}</span>
                                                <span className="text-xs text-muted-foreground">{plan.period}</span>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {plan.features.map((feature, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                                        <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                        <CardFooter>
                                            <div className={cn(
                                                "w-full h-8 rounded-md flex items-center justify-center border text-[10px] font-bold transition-colors uppercase tracking-tight",
                                                formData.selectedPlan === plan.id ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground/30 text-muted-foreground"
                                            )}>
                                                {formData.selectedPlan === plan.id ? "Sélectionné" : "Choisir"}
                                            </div>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-muted">
                    <Button
                        variant="ghost"
                        onClick={handleCompleteLater}
                        className="text-muted-foreground hover:text-foreground order-last sm:order-first"
                    >
                        Compléter plus tard
                    </Button>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className="flex-1 sm:flex-none h-11"
                        >
                            <ChevronLeft className="size-4 mr-2" />
                            Retour
                        </Button>

                        {currentStep < activeSteps.length - 1 ? (
                            <Button
                                onClick={nextStep}
                                className="flex-1 sm:flex-none h-11 bg-primary text-primary-foreground shadow-lg shadow-primary/20 px-8"
                            >
                                Suivant
                                <ChevronRight className="size-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleFinish}
                                className="flex-1 sm:flex-none h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 px-8"
                            >
                                Terminer la configuration
                                <Check className="size-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </div>

                {previewImage && (
                    <Dialog open={!!previewImage} onOpenChange={(open) => { if (!open) setPreviewImage(null); }}>
                        <DialogContent className="max-w-3xl p-0 bg-transparent border-none shadow-none">
                            <img
                                src={previewImage}
                                alt="Aperçu de l'image"
                                className="w-full h-auto rounded-lg"
                            />
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    );
}
