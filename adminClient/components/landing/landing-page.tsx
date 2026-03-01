"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    ArrowRight,
    Map,
    Smartphone,
    Globe,
    Calendar,
    Layout,
    Zap,
    CheckCircle2,
    Star,
    Building2,
    Ticket
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-primary-foreground">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 glass border-b border-border/40 px-6 py-4 flex items-center justify-between backdrop-blur-xl">
                <div className="flex items-center gap-2">
                    <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                        <Layout className="size-6" />
                    </div>
                    <span className="text-xl font-black tracking-tighter text-gradient">MadaEvent</span>
                </div>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <Link href="/sign-in">
                        <Button variant="ghost" className="font-bold text-sm">Connexion</Button>
                    </Link>
                    <Link href="/sign-up">
                        <Button className="font-bold rounded-full px-6 shadow-lg shadow-primary/20">Commencer</Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_50%_0%,oklch(var(--primary)/0.15)_0%,transparent_50%)] pointer-events-none" />

                <div className="max-w-5xl mx-auto text-center space-y-8 animate-slow-fade">
                    <Badge variant="secondary" className="px-4 py-1.5 rounded-full bg-primary/10 text-primary border-primary/20 font-bold uppercase tracking-widest text-[10px]">
                        La révolution de l&apos;événementiel à Madagascar
                    </Badge>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1]">
                        Modélisez, Publiez, <br />
                        <span className="text-gradient">Gérez sans limite.</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground font-medium leading-relaxed">
                        MadaEvent est la plateforme tout-en-un pour transformer vos espaces physiques en expériences numériques interactives.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link href="#get-started">
                            <Button size="lg" className="rounded-full px-10 h-14 text-base font-black shadow-xl shadow-primary/30 group">
                                Choisir mon service <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Button size="lg" variant="outline" className="rounded-full px-10 h-14 text-base font-bold glass">
                            Voir la démo
                        </Button>
                    </div>

                    <div className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-3xl font-black">2D+</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Modélisation</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-3xl font-black">API</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Intégration Web</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-3xl font-black">APP</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Visibilité Mobile</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-3xl font-black">100%</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Contrôle</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-6 bg-muted/30 relative overflow-hidden">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight">Comment ça fonctionne ?</h2>
                        <p className="text-muted-foreground font-medium">Trois étapes pour digitaliser votre activité.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="glass border-none shadow-xl hover-lift p-2">
                            <CardContent className="p-8 space-y-4">
                                <div className="size-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 ring-1 ring-indigo-500/20">
                                    <Map className="size-7" />
                                </div>
                                <h3 className="text-xl font-bold italic">1. Modélisation 2D</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Utilisez notre outil intuitif pour dessiner vos plans de salle, disposez vos tables, stands ou sièges avec une précision chirurgicale.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="glass border-none shadow-xl hover-lift p-2">
                            <CardContent className="p-8 space-y-4">
                                <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/20">
                                    <Smartphone className="size-7" />
                                </div>
                                <h3 className="text-xl font-bold italic">2. Publication Mobile</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Votre espace est instantanément publié sur l&apos;application Reserveo. Vos clients peuvent voir les disponibilités et réserver en temps réel.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="glass border-none shadow-xl hover-lift p-2">
                            <CardContent className="p-8 space-y-4">
                                <div className="size-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 ring-1 ring-emerald-500/20">
                                    <Globe className="size-7" />
                                </div>
                                <h3 className="text-xl font-bold italic">3. Intégration API</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Intégrez votre plan interactif directement sur votre propre site web. Gardez vos clients dans votre écosystème avec notre API.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Services Chooser Section */}
            <section id="get-started" className="py-24 px-6 relative">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-20 space-y-6">
                        <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black tracking-[0.2em] px-3 py-1">CHOISISSEZ VOTRE VOIE</Badge>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Quel profil êtes-vous ?</h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">La configuration de votre interface s&apos;adaptera automatiquement à votre métier.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Option 1: Espace Fixe */}
                        <div className="group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-indigo-500 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative glass rounded-[2rem] border border-white/10 p-10 flex flex-col h-full bg-card shadow-2xl overflow-hidden group-hover:-translate-y-2 transition-all duration-500">
                                <div className="absolute -top-10 -right-10 size-40 bg-primary/5 rounded-full blur-3xl" />

                                <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform duration-500">
                                    <Building2 className="size-8" />
                                </div>

                                <h3 className="text-3xl font-black tracking-tight mb-4">Gestion d&apos;un Espace Fixe</h3>
                                <p className="text-muted-foreground mb-8 text-sm font-medium leading-relaxed">
                                    Idéal pour les restaurants, espaces de coworking, bars ou bibliothèques. Gérez vos réservations quotidiennes, vos plans de salle permanents et fidélisez vos clients habituels.
                                </p>

                                <ul className="space-y-4 mb-12 flex-1">
                                    {[
                                        "Plan de salle dynamique permanent",
                                        "Gestion des tables et placements",
                                        "Abonnements et fidélité clients",
                                        "Statistiques d'occupation quotidiennes"
                                    ].map((text, i) => (
                                        <li key={i} className="flex items-center gap-3 text-xs font-bold text-foreground/80">
                                            <CheckCircle2 className="size-4 text-emerald-500" /> {text}
                                        </li>
                                    ))}
                                </ul>

                                <Link href="/sign-up?type=fixed" className="w-full">
                                    <Button className="w-full rounded-2xl h-14 font-black shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
                                        Ouvrir mon établissement
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Option 2: Organisateur d'Evenement */}
                        <div className="group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-primary rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative glass rounded-[2rem] border border-white/10 p-10 flex flex-col h-full bg-card shadow-2xl overflow-hidden group-hover:-translate-y-2 transition-all duration-500">
                                <div className="absolute -top-10 -right-10 size-40 bg-indigo-500/5 rounded-full blur-3xl" />

                                <div className="size-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-8 group-hover:scale-110 transition-transform duration-500">
                                    <Ticket className="size-8" />
                                </div>

                                <h3 className="text-3xl font-black tracking-tight mb-4 text-gradient">Organisateur d&apos;Événements</h3>
                                <p className="text-muted-foreground mb-8 text-sm font-medium leading-relaxed">
                                    Conçu pour les concerts, mariages, festivals ou conférences. Gérez la billetterie, l&apos;affectation des zones, les agents de terrain et les listes d&apos;invités spécifiques.
                                </p>

                                <ul className="space-y-4 mb-12 flex-1">
                                    {[
                                        "Configurations par événement",
                                        "Billetterie et QR Code intégrés",
                                        "Gestion des accès STAFF mobile",
                                        "Analyse des pics d'audience"
                                    ].map((text, i) => (
                                        <li key={i} className="flex items-center gap-3 text-xs font-bold text-foreground/80">
                                            <CheckCircle2 className="size-4 text-indigo-500" /> {text}
                                        </li>
                                    ))}
                                </ul>

                                <Link href="/sign-up?type=event" className="w-full">
                                    <Button variant="secondary" className="w-full rounded-2xl h-14 font-black bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border border-indigo-500/20 shadow-lg group-hover:shadow-indigo-500/10 transition-all">
                                        Lancer mon événement
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-border/40 px-6 bg-muted/20">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                            <Layout className="size-5" />
                        </div>
                        <span className="text-lg font-black tracking-tighter">MadaEvent</span>
                    </div>
                    <div className="flex gap-8 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        <Link href="#" className="hover:text-primary transition-colors">À propos</Link>
                        <Link href="#" className="hover:text-primary transition-colors">API Docs</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Tarifs</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Support</Link>
                    </div>
                    <p className="text-[10px] font-medium text-muted-foreground">
                        © 2026 MadaEvent by Reserveo. Made with ❤️ in Madagascar.
                    </p>
                </div>
            </footer>
        </div>
    );
}
