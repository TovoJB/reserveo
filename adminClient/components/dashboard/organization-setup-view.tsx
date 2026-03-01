"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Building,
    ChevronRight,
    MapPin,
    ArrowRight,
    Layers,
    Car,
    Trees,
    CheckCircle2,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useApi } from "@/hooks/use-api";
import { useWorkgroupStore } from "@/store/workgroup-store";
import { useAccountSync } from "@/hooks/use-account-sync";

const ACTIVITY_TYPES = [
    { value: "RESTAURANT", label: "Restaurant / Bar", icon: "🍴" },
    { value: "HOTEL", label: "Hôtel / Hébergement", icon: "🏨" },
    { value: "EVENT", label: "Espace Événementiel", icon: "🎉" },
    { value: "COWORKING", label: "Coworking / Bureau", icon: "💻" },
    { value: "OTHER", label: "Autre", icon: "✨" },
];

export function OrganizationSetupView() {
    const router = useRouter();
    const api = useApi();
    const { setGroups } = useWorkgroupStore();
    const { me } = useAccountSync();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        activityType: "RESTAURANT",
        floorsCount: 1,
        hasParking: false,
        hasOuterZones: false,
    });

    // Auto-suggest name and activity from profile
    React.useEffect(() => {
        if (me?.onboardingData) {
            try {
                const parsed = typeof me.onboardingData === 'string' ? JSON.parse(me.onboardingData) : me.onboardingData;
                const profileForm = parsed?.formData;

                if (profileForm) {
                    setFormData(prev => {
                        const updates: any = {};

                        // Suggest Name if empty
                        if (!prev.name && profileForm.companyName) {
                            updates.name = `${profileForm.companyName} Space`;
                        }

                        // Suggest Activity Type (Fuzzy match)
                        if (profileForm.activity) {
                            const act = profileForm.activity.toLowerCase();

                            // Check for coworking (even with typos like cooworking)
                            if (act.includes('work') || act.includes('cow') || act.includes('coo')) {
                                updates.activityType = "COWORKING";
                            }
                            // Check for restaurant/bar
                            else if (act.includes('rest') || act.includes('bar') || act.includes('mang') || act.includes('eat')) {
                                updates.activityType = "RESTAURANT";
                            }
                            // Check for hotel
                            else if (act.includes('hot') || act.includes('dodo') || act.includes('sleep') || act.includes('log')) {
                                updates.activityType = "HOTEL";
                            }
                            // Check for events
                            else if (act.includes('even') || act.includes('fêt') || act.includes('mariaj') || act.includes('wedding')) {
                                updates.activityType = "EVENT";
                            }
                        }

                        if (Object.keys(updates).length > 0) {
                            return { ...prev, ...updates };
                        }
                        return prev;
                    });
                }
            } catch (e) {
                console.error("Error parsing onboarding data for suggestion:", e);
            }
        }
    }, [me]);

    const handleComplete = async () => {
        setIsLoading(true);
        try {
            const response = await api.post("/spaces/init-organization", formData);

            // Refresh workgroups from server
            const wgResponse = await api.get("/workgroups");
            if (wgResponse.data && wgResponse.data.data) {
                setGroups(wgResponse.data.data);
            }

            // Redirect to organization management
            router.push("/dashboard?view=organization");
        } catch (error) {
            console.error("Setup error:", error);
            alert("Une erreur est survenue lors de l'initialisation.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
            <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-slate-100">
                    <div
                        className="h-full bg-blue-600 transition-all duration-500 ease-out"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                <div className="p-8 md:p-12">
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-center">
                                    Commençons par le nom
                                </h1>
                                <p className="text-slate-500 text-center">
                                    Quel est le nom de votre établissement ou de votre organisation ?
                                </p>
                            </div>

                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Nom de l'organisation</Label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-3 size-5 text-slate-400" />
                                        <Input
                                            id="name"
                                            placeholder="Ex: Le Grand Restaurant, Mada Coworking..."
                                            className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-blue-500 text-lg font-medium"
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-slate-700">Type d'activité</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {ACTIVITY_TYPES.map((type) => (
                                            <button
                                                key={type.value}
                                                onClick={() => setFormData(prev => ({ ...prev, activityType: type.value }))}
                                                className={cn(
                                                    "flex items-center gap-3 p-4 rounded-xl border text-left transition-all hover:bg-slate-50",
                                                    formData.activityType === type.value
                                                        ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600 shadow-sm"
                                                        : "border-slate-200 text-slate-600"
                                                )}
                                            >
                                                <span className="text-2xl">{type.icon}</span>
                                                <span className="text-sm font-bold">{type.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <Button
                                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-lg font-bold mt-4"
                                disabled={!formData.name}
                                onClick={() => setStep(2)}
                            >
                                Continuer
                                <ArrowRight className="ml-2 size-5" />
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="space-y-2">
                                <button onClick={() => setStep(1)} className="text-xs font-bold text-blue-600 mb-2 hover:underline flex items-center gap-1">
                                    ← ÉTAPE PRÉCÉDENTE
                                </button>
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-center">
                                    Structure de l'espace
                                </h1>
                                <p className="text-slate-500 text-center">
                                    Dites-nous en plus sur la configuration physique.
                                </p>
                            </div>

                            <div className="space-y-6 pt-4">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                                                <Layers className="size-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">Nombre d'étages</p>
                                                <p className="text-xs text-slate-500">Gérez-vous plusieurs niveaux ?</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white p-1 rounded-lg border">
                                            <button
                                                className="size-8 rounded hover:bg-slate-100 flex items-center justify-center font-bold"
                                                onClick={() => setFormData(p => ({ ...p, floorsCount: Math.max(0, p.floorsCount - 1) }))}
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center font-bold">{formData.floorsCount}</span>
                                            <button
                                                className="size-8 rounded hover:bg-slate-100 flex items-center justify-center font-bold"
                                                onClick={() => setFormData(p => ({ ...p, floorsCount: p.floorsCount + 1 }))}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setFormData(p => ({ ...p, hasParking: !p.hasParking }))}
                                            className={cn(
                                                "p-4 rounded-2xl border transition-all text-center space-y-2",
                                                formData.hasParking ? "bg-orange-50 border-orange-200 ring-1 ring-orange-200" : "bg-white border-slate-100"
                                            )}
                                        >
                                            <div className={cn("size-10 rounded-full mx-auto flex items-center justify-center", formData.hasParking ? "bg-orange-100 text-orange-600" : "bg-slate-50 text-slate-400")}>
                                                <Car className="size-5" />
                                            </div>
                                            <p className="text-xs font-bold uppercase tracking-wider">Parking</p>
                                        </button>

                                        <button
                                            onClick={() => setFormData(p => ({ ...p, hasOuterZones: !p.hasOuterZones }))}
                                            className={cn(
                                                "p-4 rounded-2xl border transition-all text-center space-y-2",
                                                formData.hasOuterZones ? "bg-green-50 border-green-200 ring-1 ring-green-200" : "bg-white border-slate-100"
                                            )}
                                        >
                                            <div className={cn("size-10 rounded-full mx-auto flex items-center justify-center", formData.hasOuterZones ? "bg-green-100 text-green-600" : "bg-slate-50 text-slate-400")}>
                                                <Trees className="size-5" />
                                            </div>
                                            <p className="text-xs font-bold uppercase tracking-wider">Zones Extérieures</p>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <Button
                                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-lg font-bold mt-4"
                                onClick={() => setStep(3)}
                            >
                                Vérifier ma structure
                                <ArrowRight className="ml-2 size-5" />
                            </Button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in zoom-in-95">
                            <div className="space-y-2 text-center">
                                <div className="size-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="size-10" />
                                </div>
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                    Tout est prêt !
                                </h1>
                                <p className="text-slate-500">
                                    Voici ce que nous allons générer pour vous :
                                </p>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-3">
                                <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                                    <div className="size-2 rounded-full bg-blue-600" />
                                    <span>Espace principal : <span className="font-bold">{formData.name}</span></span>
                                </div>
                                {formData.floorsCount > 0 && (
                                    <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                                        <div className="size-2 rounded-full bg-blue-600" />
                                        <span>Génération de <span className="font-bold">{formData.floorsCount} plans d'étages</span></span>
                                    </div>
                                )}
                                {formData.hasParking && (
                                    <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                                        <div className="size-2 rounded-full bg-blue-600" />
                                        <span>Configuration d'un <span className="font-bold">plan de Parking</span></span>
                                    </div>
                                )}
                                {formData.hasOuterZones && (
                                    <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                                        <div className="size-2 rounded-full bg-blue-600" />
                                        <span>Zone <span className="font-bold">Terrasse / Extérieur</span></span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                                    <div className="size-2 rounded-full bg-blue-600" />
                                    <span>Organisation automatique de votre barre latérale</span>
                                </div>
                            </div>

                            <div className="pt-4 space-y-3">
                                <Button
                                    className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-lg font-bold shadow-lg shadow-blue-200"
                                    disabled={isLoading}
                                    onClick={handleComplete}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 size-5 animate-spin" />
                                            Initialisation...
                                        </>
                                    ) : (
                                        "Lancer mon organisation"
                                    )}
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full text-slate-500 font-bold"
                                    onClick={() => setStep(2)}
                                    disabled={isLoading}
                                >
                                    Modifier
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <p className="mt-8 text-slate-400 text-xs text-center max-w-sm">
                En initialisant votre espace, nous configurons les bases de votre outil de réservation. Vous pourrez modifier toute cette structure ultérieurement.
            </p>
        </div>
    );
}
