"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
    Briefcase,
    LayoutDashboard,
    CalendarDays,
    UtensilsCrossed,
    Users2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const STEPS = [
    { title: "Type de Besoin", icon: LayoutDashboard, description: "Votre activité" },
    { title: "Entreprise", icon: Building, description: "Infos de base" },
    { title: "Visuels", icon: ImageIcon, description: "Logo & Photos" },
    { title: "Préférences", icon: Globe, description: "Langue & Devise" },
    { title: "Abonnement", icon: Gem, description: "Choisir un plan" }
];

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
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        businessType: "space-management",
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

    const nextStep = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleFinish = () => {
        router.push("/");
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 bg-background/50">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col gap-2 mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight">Configuration de MadaEvent</h1>
                    <p className="text-muted-foreground">Personnalisez votre interface selon vos besoins métiers.</p>
                </div>

                {/* Stepper Navigation */}
                <div className="flex items-center justify-between mb-12 relative overflow-x-auto pb-4 sm:pb-0">
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-10 mx-10 hidden sm:block" />

                    {STEPS.map((step, idx) => (
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
                    {currentStep === 0 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="text-center space-y-2 mb-8">
                                <h2 className="text-xl font-semibold">Quel est votre besoin principal ?</h2>
                                <p className="text-sm text-muted-foreground">Cela adaptera les outils et les menus de votre tableau de bord.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {BUSINESS_TYPES.map((type) => (
                                    <Card
                                        key={type.id}
                                        className={cn(
                                            "relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl group border-2",
                                            formData.businessType === type.id ? "border-primary bg-primary/5 shadow-primary/10" : "border-transparent bg-card/50 hover:border-muted"
                                        )}
                                        onClick={() => setFormData({ ...formData, businessType: type.id })}
                                    >
                                        <CardHeader>
                                            <div className={cn(
                                                "size-12 rounded-xl flex items-center justify-center mb-2 transition-colors",
                                                formData.businessType === type.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                                            )}>
                                                <type.icon className="size-7" />
                                            </div>
                                            <CardTitle className="text-lg">{type.title}</CardTitle>
                                            <CardDescription className="text-sm">{type.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                {type.details}
                                            </p>
                                        </CardContent>
                                        {formData.businessType === type.id && (
                                            <div className="absolute top-4 right-4 text-primary">
                                                <CheckCircle2 className="size-6 fill-current text-primary" />
                                            </div>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Store className="size-5 text-primary" />
                                    Profil de l'activité
                                </CardTitle>
                                <CardDescription>Décrivez votre entreprise et votre domaine d'activité.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="companyName">Nom commercial</Label>
                                        <Input
                                            id="companyName"
                                            placeholder="Ex: MadaEvent SARL"
                                            value={formData.companyName}
                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                            className="h-11"
                                        />
                                    </div>
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
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description courte</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Dites-nous en plus sur vos services et ce qui vous rend unique..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="min-h-[120px] resize-none"
                                        />
                                    </div>
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
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {currentStep === 2 && (
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
                                            <Avatar className="size-32 border-4 border-background shadow-xl">
                                                <AvatarImage src="" />
                                                <AvatarFallback className="bg-muted">
                                                    <Store className="size-12 text-muted-foreground" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                <Camera className="size-6 text-white" />
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="mt-2 w-full">Charger le logo</Button>
                                    </div>

                                    <div className="flex-1 space-y-4 w-full">
                                        <Label>Galerie photos (Slide)</Label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            <div className="aspect-video border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50 hover:bg-muted transition-colors cursor-pointer group">
                                                <div className="text-center">
                                                    <Upload className="size-5 mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
                                                    <span className="text-[10px] text-muted-foreground">Téléverser</span>
                                                </div>
                                            </div>
                                            <div className="aspect-video rounded-lg bg-cover bg-center overflow-hidden border relative" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=80")' }}>
                                                <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-colors" />
                                            </div>
                                            <div className="aspect-video rounded-lg bg-cover bg-center overflow-hidden border relative" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&q=80")' }}>
                                                <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-colors" />
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground italic">
                                            Ces images apparaîtront sous forme de slider sur votre page publique.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {currentStep === 3 && (
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

                    {currentStep === 4 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                                {PLANS.map((plan) => (
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
                                                    Populaire
                                                </div>
                                            </div>
                                        )}
                                        <CardHeader>
                                            <div className={cn("size-10 rounded-lg flex items-center justify-center mb-3", plan.bg)}>
                                                <plan.icon className={cn("size-6", plan.color)} />
                                            </div>
                                            <CardTitle>{plan.name}</CardTitle>
                                            <div className="flex items-baseline gap-1 pt-2">
                                                <span className="text-2xl font-bold">{plan.price}</span>
                                                <span className="text-xs text-muted-foreground">{plan.period}</span>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {plan.features.map((feature, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                        <CardFooter>
                                            <div className={cn(
                                                "w-full h-8 rounded-md flex items-center justify-center border text-xs font-semibold transition-colors",
                                                formData.selectedPlan === plan.id ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground/30 text-muted-foreground"
                                            )}>
                                                {formData.selectedPlan === plan.id ? "Plan sélectionné" : "Choisir ce plan"}
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
                        onClick={() => router.push("/")}
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

                        {currentStep < STEPS.length - 1 ? (
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
            </div>
        </div>
    );
}
