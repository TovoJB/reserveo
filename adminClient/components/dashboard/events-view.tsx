"use client";

import React, { useState } from "react";
import {
    Plus,
    Calendar as CalendarIcon,
    MapPin,
    Clock,
    Users,
    ArrowRight,
    Search,
    Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useEvents, useCreateEvent } from "@/hooks/use-events";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

export function EventsView() {
    const { data: events, isLoading } = useEvents();
    const createEventMutation = useCreateEvent();

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        date: "",
        reservationStartDate: "",
        startTime: "12:00",
        endTime: "14:00",
        location: "",
        description: ""
    });

    const handleCreateEvent = async () => {
        try {
            await createEventMutation.mutateAsync({
                ...formData,
                date: new Date(formData.date).toISOString(),
                reservationStartDate: new Date(formData.reservationStartDate).toISOString(),
            });
            setIsCreateDialogOpen(false);
            setFormData({
                title: "",
                date: "",
                reservationStartDate: "",
                startTime: "12:00",
                endTime: "14:00",
                location: "",
                description: ""
            });
        } catch (err) {
            console.error("Failed to create event:", err);
        }
    };

    const filteredEvents = events?.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Mes Événements</h2>
                    <p className="text-muted-foreground">
                        Gérez vos soirées, ateliers et événements spéciaux.
                    </p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                    <Plus className="size-4" />
                    Créer un Événement
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un événement..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon">
                    <Filter className="size-4" />
                </Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <div className="h-48 bg-muted rounded-t-lg" />
                            <CardContent className="p-6 space-y-4">
                                <div className="h-4 bg-muted rounded w-3/4" />
                                <div className="h-4 bg-muted rounded w-1/2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents?.map((event) => (
                        <Card key={event.id} className="overflow-hidden group hover:border-primary/50 transition-all duration-300">
                            <div className="h-32 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent relative p-4">
                                <Badge variant="secondary" className="absolute top-4 right-4 capitalize">
                                    {event.status?.toLowerCase() || 'Prévu'}
                                </Badge>
                                <div className="absolute bottom-4 left-4">
                                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                                        {event.title}
                                    </h3>
                                </div>
                            </div>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CalendarIcon className="size-4" />
                                    <span>
                                        Event : {format(new Date(event.date), "PPP", { locale: fr })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="size-4" />
                                    <span>
                                        Résas dès le : {format(new Date(event.reservationStartDate), "PPP", { locale: fr })}
                                    </span>
                                </div>
                                {event.location && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="size-4" />
                                        <span>{event.location}</span>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="p-6 pt-0 border-t bg-muted/30">
                                <Button asChild variant="ghost" className="w-full mt-4 group">
                                    <Link href={`/dashboard?view=bookings&eventId=${event.id}`} className="flex items-center justify-between w-full">
                                        <span>Gérer l'Espace</span>
                                        <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}

                    {!filteredEvents?.length && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 bg-muted/10 rounded-xl border-2 border-dashed">
                            <CalendarIcon className="size-12 text-muted-foreground/50 mb-4" />
                            <p className="text-xl font-medium text-muted-foreground">Aucun événement trouvé</p>
                            <Button variant="link" onClick={() => setIsCreateDialogOpen(true)}>
                                Créer votre premier événement
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Create Event Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Nouvel Événement</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Nom de l'événement</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Ex: Soirée Jazz, Buffet de Pâques..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="date">Date de l'événement</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="resDate">Début Réservations</Label>
                                <Input
                                    id="resDate"
                                    type="date"
                                    value={formData.reservationStartDate}
                                    onChange={(e) => setFormData({ ...formData, reservationStartDate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="startTime">Heure Début</Label>
                                <Input
                                    id="startTime"
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="endTime">Heure Fin</Label>
                                <Input
                                    id="endTime"
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="loc">Lieu</Label>
                            <Input
                                id="loc"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="Ex: Salle de conférence, Terrasse..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Annuler</Button>
                        <Button
                            onClick={handleCreateEvent}
                            disabled={createEventMutation.isPending || !formData.title || !formData.date || !formData.reservationStartDate}
                        >
                            {createEventMutation.isPending ? "Création..." : "Créer l'Événement"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
