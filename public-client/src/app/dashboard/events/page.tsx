"use client";

import { useRelationships, useRemoveRelationship } from "@/hooks/use-relationships";
import { Card, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket, MapPin, ChevronRight, Calendar, Trash2, AlertTriangle } from "lucide-react";
import { RestrictionNotice } from "@/components/restriction-notice";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export default function EventsPage() {
    const { data: relationships, isLoading } = useRelationships();
    const removeMutation = useRemoveRelationship();
    const [isRemoving, setIsRemoving] = useState<number | null>(null);

    const events = relationships?.filter(r => r.organizer.workspaceType === 'EVENT') || [];

    const handleRemove = async (id: number) => {
        try {
            await removeMutation.mutateAsync(id);
            setIsRemoving(null);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mes Évènements</h1>
                <p className="text-slate-500 mt-1">Évènements auxquels vous êtes lié.</p>
            </div>

            <div className="grid gap-6">
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2].map(i => (
                            <div key={i} className="h-32 w-full bg-slate-200 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : events.length === 0 ? (
                    <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400">
                        <Ticket className="size-12 mx-auto mb-4 opacity-20" />
                        <p className="text-sm italic">Vous n'avez pas encore d'évènements.</p>
                        <Link href="/discover" className="text-blue-600 font-bold mt-4 inline-block hover:underline">
                            Explorer les évènements
                        </Link>
                    </div>
                ) : (
                    events.map((rel) => (
                        <Card key={rel.id} className="group border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all border-l-4 border-l-amber-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="size-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 overflow-hidden border border-amber-100">
                                            {rel.organizer.profile?.avatarUrl ? (
                                                <img src={rel.organizer.profile.avatarUrl} alt="" className="size-full object-cover" />
                                            ) : (
                                                <Ticket className="size-8" />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <CardTitle className="text-xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                                                {rel.organizer.profile ? `${rel.organizer.profile.firstName} ${rel.organizer.profile.lastName}` : rel.organizer.email}
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-2">
                                                <Calendar className="size-3.5" />
                                                Tous les évènements
                                                <span className="mx-1">•</span>
                                                <MapPin className="size-3.5" />
                                                {rel.organizer.organizerSpaces?.[0]?.name || "Lieu de l'évènement"}
                                            </CardDescription>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Dialog open={isRemoving === rel.id} onOpenChange={(open) => !open && setIsRemoving(null)}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-10 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setIsRemoving(rel.id);
                                                    }}
                                                >
                                                    <Trash2 className="size-5" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[425px] rounded-3xl">
                                                <DialogHeader>
                                                    <div className="size-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-4">
                                                        <AlertTriangle className="size-6" />
                                                    </div>
                                                    <DialogTitle className="text-xl font-black text-slate-900">Quitter cet évènement ?</DialogTitle>
                                                    <DialogDescription className="text-slate-500 py-2">
                                                        Cette action est irréversible et aura les conséquences suivantes :
                                                        <ul className="mt-3 space-y-2 text-sm text-slate-600 list-disc pl-4 font-medium">
                                                            <li>Vous ne serez plus considéré comme participant ou membre.</li>
                                                            <li>Toutes vos réservations existantes pour cet évènement seront <strong>annulées</strong>.</li>
                                                            <li>Vous perdrez vos accès privilégiés à la billetterie ou aux placements.</li>
                                                        </ul>
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter className="gap-2 sm:gap-0">
                                                    <Button variant="outline" className="rounded-xl font-bold" onClick={() => setIsRemoving(null)}>Annuler</Button>
                                                    <Button
                                                        variant="destructive"
                                                        className="size-fit rounded-xl font-black bg-red-600 hover:bg-red-700 p-2 text-white"
                                                        onClick={() => handleRemove(rel.id)}
                                                        disabled={removeMutation.isPending}
                                                    >
                                                        {removeMutation.isPending ? "Traitement..." : "Oui, quitter l'évènement"}
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>

                                        <Link href={`/book/${rel.organizer.uuid}`} className="size-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-sm">
                                            <ChevronRight className="size-5" />
                                        </Link>
                                    </div>
                                </div>

                                <div className="mt-4 border-t border-slate-100 pt-4">
                                    <RestrictionNotice workspaceType="EVENT" />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
