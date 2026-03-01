"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    Search,
    MapPin,
    Star,
    Users,
    Coffee,
    Wifi,
    ArrowRight,
    Filter,
    ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SignedIn } from "@clerk/nextjs";
import { AppHeader } from "@/components/app-header";

// Mock data for luxurious spaces
const SPACES = [
    {
        id: "space-1",
        name: "L'Espace Terrazza",
        description: "Un rooftop exclusif avec vue panoramique, idéal pour le networking.",
        image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800",
        price: "15 000 Ar / h",
        rating: 4.8,
        reviews: 124,
        features: ["Wifi Fibre", "Coffee Bar", "Vue Ville"],
        status: "Ouvert",
        location: "Antaninarenina, Antananarivo"
    },
    {
        id: "space-2",
        name: "The Silent Hub",
        description: "Zone de concentration ultime avec cabines acoustiques individuelles.",
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800",
        price: "8 000 Ar / h",
        rating: 4.6,
        reviews: 89,
        features: ["Calme absolu", "Prises USB-C", "Library"],
        status: "Presque plein",
        location: "Ankorondrano, Antananarivo"
    },
    {
        id: "space-3",
        name: "L'Atelier Créatif",
        description: "Espace modulable pour artistes et designers en quête d'inspiration.",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800",
        price: "12 000 Ar / h",
        rating: 4.9,
        reviews: 56,
        features: ["Matériel art", "Lumière naturelle", "Cuisine"],
        status: "Ouvert",
        location: "Ivandry, Antananarivo"
    },
    {
        id: "space-4",
        name: "Le Palace du Client",
        description: "Luxe et prestige au cœur du centre d'affaires. Service premium inclus.",
        image: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=800",
        price: "25 000 Ar / h",
        rating: 5.0,
        reviews: 42,
        features: ["Parking VIP", "Secrétaire", "Buffet"],
        status: "Uniquement sur invit",
        location: "Isoraka, Antananarivo"
    }
];

export default function DiscoverPage() {
    const router = useRouter();
    const [invitationCode, setInvitationCode] = useState("");

    const handleInvitationCode = () => {
        if (!invitationCode) return;
        if (invitationCode.toUpperCase() === "EVENT-2024") {
            router.push("/book/space-1");
        } else {
            alert("Code invalide ou expiré.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col">
            <AppHeader />

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 mb-2">Trouvez votre bureau idéal</h2>
                        <p className="text-muted-foreground">Parcourez notre sélection d'espaces de coworking haut de gamme.</p>
                    </div>

                    {/* Invitation Code Section */}
                    <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3 w-full max-w-sm">
                        <div className="flex-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Accès Privé</p>
                            <input
                                type="text"
                                placeholder="Code d'invitation"
                                value={invitationCode}
                                onChange={(e) => setInvitationCode(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary outline-none transition-all"
                            />
                        </div>
                        <Button className="rounded-2xl h-12 px-5 text-xs font-bold self-end" onClick={handleInvitationCode}>
                            Entrer
                        </Button>
                    </div>
                </div>

                {/* Grid of Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {SPACES.map((space) => (
                        <div key={space.id} className="group relative bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                            {/* Image Container */}
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={space.image}
                                    alt={space.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                                <Badge className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border-white/30 text-white font-bold hover:bg-white/40">
                                    {space.status}
                                </Badge>

                                <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between text-white">
                                    <div>
                                        <div className="flex items-center gap-1 mb-1">
                                            <Star className="size-3 fill-amber-400 text-amber-400" />
                                            <span className="text-xs font-bold">{space.rating}</span>
                                            <span className="text-[10px] opacity-70">({space.reviews})</span>
                                        </div>
                                        <h3 className="text-xl font-bold">{space.name}</h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase font-medium opacity-80">À partir de</p>
                                        <p className="text-lg font-black">{space.price}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Details Container */}
                            <div className="p-8">
                                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-4">
                                    <MapPin className="size-3 text-red-400" />
                                    <span>{space.location}</span>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed mb-6 line-clamp-2 italic">
                                    "{space.description}"
                                </p>

                                <div className="flex flex-wrap gap-2 mb-8">
                                    {space.features.map((f) => (
                                        <span key={f} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-500 text-[10px] font-bold border border-slate-100">
                                            {f === "Wifi Fibre" && <Wifi className="size-2.5" />}
                                            {f === "Coffee Bar" && <Coffee className="size-2.5" />}
                                            {f === "Parking VIP" && <Users className="size-2.5" />}
                                            {f}
                                        </span>
                                    ))}
                                </div>

                                <Button asChild className="w-full h-14 rounded-2xl text-base shadow-lg shadow-blue-100 group-hover:bg-blue-600 transition-colors" size="lg">
                                    <Link href={`/book/${space.id}`}>
                                        Visualiser et Réserver
                                        <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer / Empty State */}
            <footer className="py-12 px-6 border-t mt-12 bg-white flex flex-col items-center">
                <p className="text-sm text-muted-foreground mb-4">Vous ne trouvez pas votre bonheur ?</p>
                <div className="flex gap-4">
                    <Button variant="link" className="text-primary font-bold">Contactez-nous</Button>
                    <span className="text-muted-foreground self-center">•</span>
                    <Button variant="link" className="text-primary font-bold">Proposez un espace</Button>
                </div>
            </footer>
        </div>
    );
}
