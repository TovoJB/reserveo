"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, User, CheckCircle2, ArrowRight } from "lucide-react";
import { useAccountSync } from "@/hooks/use-account-sync";
import { useDashboardStore } from "@/store/dashboard-store";
import { useUser } from "@clerk/nextjs";

export function UsageTypeSelection() {
    const { sync } = useAccountSync();
    const { workspaceType, setUsageType } = useDashboardStore();
    const { user } = useUser();

    const handleSelect = (type: "PROFESSIONAL" | "PERSONAL") => {
        if (!user) return;

        setUsageType(type);
        sync({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress || "",
            workspaceType: workspaceType?.toUpperCase() as any,
            usageType: type,
            userType: 'ORGANIZER'
        });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 animate-in fade-in zoom-in duration-500">
            <div className="max-w-4xl w-full space-y-8">
                <div className="text-center space-y-4">
                    <Badge variant="outline" className="px-4 py-1 text-[10px] uppercase tracking-widest font-bold border-primary/20 text-primary">
                        Configuration de votre profil
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
                        Comment allez-vous utiliser <span className="text-primary italic">MadaEvent</span> ?
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
                        Cette information nous permet d&apos;ajuster votre interface et votre tarification.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                    {/* Option PERSONAL */}
                    <div
                        onClick={() => handleSelect("PERSONAL")}
                        className="group relative cursor-pointer"
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-indigo-500/50 rounded-[2.5rem] blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                        <div className="relative glass rounded-[2.5rem] border border-border/50 p-8 flex flex-col h-full bg-card/50 transition-all duration-500 hover:-translate-y-2 group-hover:shadow-2xl">
                            <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                <User className="size-8" />
                            </div>

                            <h3 className="text-2xl font-black mb-2">Usage Personnel</h3>
                            <p className="text-sm text-muted-foreground font-medium mb-8 leading-relaxed">
                                Pour un événement unique (mariage, fête privée, anniversaire). Simple, rapide, sans paperasse inutile.
                            </p>

                            <ul className="space-y-4 mb-10 flex-1">
                                {[
                                    "Pas besoin de logo ni d'entreprise",
                                    "Paiement à l'événement uniquement",
                                    "Interface simplifiée",
                                    "Support standard"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-xs font-bold text-foreground/70">
                                        <CheckCircle2 className="size-4 text-emerald-500" /> {item}
                                    </li>
                                ))}
                            </ul>

                            <Button variant="outline" className="w-full rounded-2xl h-12 font-black group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                C&apos;est pour mon mariage / fête <ArrowRight className="ml-2 size-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </Button>
                        </div>
                    </div>

                    {/* Option PROFESSIONAL */}
                    <div
                        onClick={() => handleSelect("PROFESSIONAL")}
                        className="group relative cursor-pointer"
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/50 to-primary/50 rounded-[2.5rem] blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                        <div className="relative glass rounded-[2.5rem] border border-border/50 p-8 flex flex-col h-full bg-card/50 transition-all duration-500 hover:-translate-y-2 group-hover:shadow-2xl">
                            <div className="size-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-6 group-hover:scale-110 transition-transform">
                                <Briefcase className="size-8" />
                            </div>

                            <h3 className="text-2xl font-black mb-2 text-gradient">Organisateur Pro</h3>
                            <p className="text-sm text-muted-foreground font-medium mb-8 leading-relaxed">
                                Pour les agences, entreprises ou organisateurs réguliers. Identité visuelle complète et outils avancés.
                            </p>

                            <ul className="space-y-4 mb-10 flex-1">
                                {[
                                    "Personnalisation complète (Logo, Couleurs)",
                                    "Tarification par abonnement",
                                    "Multi-utilisateurs / Staff",
                                    "Support prioritaire 24/7"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-xs font-bold text-foreground/70">
                                        <CheckCircle2 className="size-4 text-indigo-500" /> {item}
                                    </li>
                                ))}
                            </ul>

                            <Button className="w-full rounded-2xl h-12 font-black shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all bg-indigo-600 hover:bg-indigo-700">
                                Je suis un professionnel <ArrowRight className="ml-2 size-4 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
