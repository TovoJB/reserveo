"use client";

import { AppHeader } from "@/components/app-header";

import { useParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { ExcalidrawWrapper } from "@/components/excalidraw-wrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    ChevronLeft,
    Calendar,
    MapPin,
    Users,
    Check,
    X,
    CreditCard,
    ArrowRight,
    Plus,
    UserCircle,
    Loader2
} from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth, useUser } from "@clerk/nextjs";
import { Checkbox } from "@/components/ui/checkbox";

const COUNTRY_CODES = [
    { code: "+261", label: "🇲🇬 Madagascar (+261)" },
    { code: "+33", label: "🇫🇷 France (+33)" },
    { code: "+262", label: "🇷🇪 Réunion (+262)" },
    { code: "+1", label: "🇺🇸 USA (+1)" },
];
import { useSpacePlan } from "@/hooks/use-space-plans";
import { useIdentities } from "@/hooks/use-identities";
import { useReservations } from "@/hooks/use-reservations";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function BookPage() {
    const params = useParams();
    const router = useRouter();
    const { isLoaded, isSignedIn } = useAuth();
    const floorId = params.id as string;

    const { data: remoteData, isLoading: isSpaceLoading } = useSpacePlan(floorId);
    const { identities, isLoading: isIdentitiesLoading, addIdentity } = useIdentities();
    const { createReservation, isLoading: isReservingAPI } = useReservations();

    const [selectedElement, setSelectedElement] = useState<any | null>(null);
    const [isReserving, setIsReserving] = useState(false);
    const [reservationStep, setReservationStep] = useState<"details" | "confirm" | "success">("details");

    const { user } = useUser();

    // Form State
    const [selectedIdentityId, setSelectedIdentityId] = useState<string>("default");
    const [customFields, setCustomFields] = useState<Record<string, any>>({});
    const [identityForm, setIdentityForm] = useState({
        firstName: "",
        lastName: "",
        email: user?.primaryEmailAddress?.emailAddress || "",
        phonePrefix: "+261",
        phoneNumber: "",
        whatsapp: false,
    });

    useEffect(() => {
        if (user?.primaryEmailAddress?.emailAddress && !identityForm.email) {
            setIdentityForm(prev => ({ ...prev, email: user.primaryEmailAddress!.emailAddress }));
        }
    }, [user, identityForm.email]);

    const [reservationData, setReservationData] = useState({
        guestsCount: 1,
        notes: "",
        date: new Date(),
        time: format(new Date(), "HH:mm"),
    });

    const spaceInfo = remoteData?.space;
    const requiredFields = spaceInfo?.requiredFields || [];

    // Pre-fill fields if identity is selected
    const selectedIdentity = useMemo(() => {
        if (selectedIdentityId === "new") return null;
        if (selectedIdentityId === "default") return identities.find(i => i.isDefault) || identities[0];
        return identities.find(i => i.id.toString() === selectedIdentityId);
    }, [selectedIdentityId, identities]);

    const handleElementSelect = (el: any | null) => {
        setSelectedElement(el);
        if (el) {
            setIsReserving(true);
            setReservationStep("details");
        }
    };

    const handleConfirmBooking = () => {
        setReservationStep("confirm");
    };

    const handleCreateIdentity = async () => {
        try {
            const payload = {
                firstName: identityForm.firstName,
                lastName: identityForm.lastName,
                email: identityForm.email,
                phone: `${identityForm.phonePrefix}${identityForm.phoneNumber}`,
                whatsapp: identityForm.whatsapp,
            };
            const newId = await addIdentity(payload);
            setSelectedIdentityId(newId.id.toString());
        } catch (error) {
            console.error("Identity creation failed:", error);
        }
    };

    const handleFinalSubmit = async () => {
        if (!selectedElement) return;

        try {
            const payload = {
                spaceId: spaceInfo?.id || parseInt(floorId),
                planObjectId: selectedElement.customData?.dbId || undefined,
                identityId: selectedIdentity?.id,
                customerName: selectedIdentity ? `${selectedIdentity.firstName} ${selectedIdentity.lastName}` : "Invité",
                customerPhone: selectedIdentity?.phone || "",
                customerEmail: selectedIdentity?.email || "",
                startDate: reservationData.date.toISOString(),
                startTime: reservationData.time,
                notes: reservationData.notes,
                guestsCount: reservationData.guestsCount,
                customFields: customFields,
            };

            await createReservation(payload);
            setReservationStep("success");
        } catch (error) {
            console.error("Booking failed:", error);
        }
    };

    const getPriceDisplay = (el: any) => {
        const prices = el.customData?.prices || {};
        const policy = Object.keys(prices)[0] || "free";
        const price = prices[policy] || 0;
        return { price, policy };
    };

    if (isSpaceLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <Loader2 className="size-8 animate-spin text-blue-600" />
                <p className="text-sm font-medium text-slate-500">Chargement de l'espace...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            <AppHeader />

            {/* Main Area: Visual Map */}
            <main className="flex-1 relative overflow-hidden bg-slate-50">
                <ExcalidrawWrapper
                    floorId={floorId}
                    onElementSelect={handleElementSelect}
                    selectedElementId={selectedElement?.id}
                />

                {/* Legend Overlay */}
                <div className="absolute bottom-6 left-6 p-4 bg-white/90 backdrop-blur-sm border rounded-xl shadow-lg z-10 pointer-events-none max-w-xs transition-all animate-in fade-in slide-in-from-bottom-2">
                    <h3 className="text-sm font-bold mb-2">Instructions</h3>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                        <li className="flex items-center gap-2">
                            <div className="size-3 rounded border border-blue-500 bg-blue-50" />
                            <span>Cliquez sur un objet pour le sélectionner</span>
                        </li>
                    </ul>
                </div>
            </main>

            {/* Selection Sidebar/Sheet */}
            <Sheet open={isReserving} onOpenChange={(open) => !open && setIsReserving(false)}>
                <SheetContent side="right" className="w-full sm:w-[480px] p-0 flex flex-col h-full border-l shadow-2xl">
                    <ScrollArea className="flex-1">
                        <div className="p-6 pb-24">
                            {reservationStep === "details" && selectedElement && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                                    <SheetHeader>
                                        <div className="size-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-200">
                                            <Calendar className="size-6" />
                                        </div>
                                        <SheetTitle className="text-2xl font-bold">{selectedElement.customData?.name || "Sans Nom"}</SheetTitle>
                                        <SheetDescription>
                                            Configurez votre identité et vos options de réservation.
                                        </SheetDescription>
                                    </SheetHeader>

                                    {/* Identity Selection */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-black uppercase tracking-wider text-slate-500">Choisir une identité</Label>
                                            <Button variant="ghost" size="sm" className="h-6 text-[10px] text-blue-600 font-bold" onClick={() => setSelectedIdentityId("new")}>
                                                <Plus className="size-3 mr-1" />
                                                NOUVELLE
                                            </Button>
                                        </div>
                                        {identities.length > 0 ? (
                                            <Select value={selectedIdentityId} onValueChange={setSelectedIdentityId}>
                                                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200">
                                                    <SelectValue placeholder="Sélectionnez une identité" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                                    {identities.map(id => (
                                                        <SelectItem key={id.id} value={id.id.toString()} className="rounded-lg h-12">
                                                            <div className="flex items-center gap-3">
                                                                <UserCircle className="size-5 text-slate-400" />
                                                                <div className="flex flex-col text-left">
                                                                    <span className="font-bold text-sm">{id.firstName} {id.lastName}</span>
                                                                    {id.isDefault && <span className="text-[10px] text-blue-500 font-bold">Par défaut</span>}
                                                                </div>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                    <SelectItem value="new" className="rounded-lg h-12 text-blue-600 font-bold">
                                                        + Ajouter une nouvelle identité
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <div className="p-4 rounded-xl border border-dashed text-center space-y-2">
                                                <p className="text-xs text-muted-foreground italic">Vous n'avez pas encore d'identité enregistrée.</p>
                                                <Button variant="outline" size="sm" className="rounded-lg h-8 px-4 text-xs" onClick={() => setSelectedIdentityId("new")}>
                                                    Créer une identité
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Identity Form (New) */}
                                    {selectedIdentityId === "new" && (
                                        <div className="p-4 rounded-2xl border bg-slate-50 space-y-4 animate-in slide-in-from-top-2">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-bold">Prénom</Label>
                                                    <Input
                                                        value={identityForm.firstName}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIdentityForm({ ...identityForm, firstName: e.target.value })}
                                                        placeholder="Ex: Jean"
                                                        className="h-10 rounded-lg bg-white"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-bold">Nom</Label>
                                                    <Input
                                                        value={identityForm.lastName}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIdentityForm({ ...identityForm, lastName: e.target.value })}
                                                        placeholder="Ex: Dupont"
                                                        className="h-10 rounded-lg bg-white"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold">E-mail (Auto)</Label>
                                                <Input
                                                    type="email"
                                                    readOnly
                                                    value={identityForm.email}
                                                    className="h-10 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold">Téléphone</Label>
                                                <div className="flex gap-2">
                                                    <Select
                                                        value={identityForm.phonePrefix}
                                                        onValueChange={(val) => setIdentityForm({ ...identityForm, phonePrefix: val })}
                                                    >
                                                        <SelectTrigger className="w-[100px] h-10 rounded-lg bg-white">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {COUNTRY_CODES.map(c => (
                                                                <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Input
                                                        type="tel"
                                                        required
                                                        value={identityForm.phoneNumber}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIdentityForm({ ...identityForm, phoneNumber: e.target.value })}
                                                        placeholder="03..."
                                                        className="flex-1 h-10 rounded-lg bg-white"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2 py-1">
                                                <Checkbox
                                                    id="whatsapp-inline"
                                                    checked={identityForm.whatsapp}
                                                    onCheckedChange={(checked) => setIdentityForm({ ...identityForm, whatsapp: !!checked })}
                                                />
                                                <label
                                                    htmlFor="whatsapp-inline"
                                                    className="text-[10px] font-bold leading-none cursor-pointer"
                                                >
                                                    Disponible sur WhatsApp
                                                </label>
                                            </div>
                                            <Button
                                                className="w-full h-10 rounded-lg bg-slate-900 text-white font-bold text-xs"
                                                onClick={handleCreateIdentity}
                                                disabled={!identityForm.firstName || !identityForm.lastName || isIdentitiesLoading}
                                            >
                                                {isIdentitiesLoading ? <Loader2 className="animate-spin size-4" /> : "ENREGISTRER CETTE IDENTITÉ"}
                                            </Button>
                                        </div>
                                    )}

                                    {/* Dynamic Fields Section (based on Space requirement) */}
                                    {requiredFields.length > 0 && (
                                        <div className="space-y-4">
                                            <Label className="text-xs font-black uppercase tracking-wider text-slate-500">Champs requis par l'organisateur</Label>
                                            <div className="grid grid-cols-1 gap-4">
                                                {requiredFields.map((field: any) => {
                                                    const name = field.fieldName;

                                                    // Mapping enum FIRST_NAME to firstName, LAST_NAME to lastName, etc.
                                                    const fieldKey = name.toLowerCase().split('_').map((word: string, index: number) =>
                                                        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
                                                    ).join('');

                                                    const valueFromIdentity = selectedIdentity ? (selectedIdentity as any)[fieldKey] : "";

                                                    return (
                                                        <div key={field.uuid} className="space-y-1.5">
                                                            <Label className="text-xs font-medium ml-1">{name.replace('_', ' ')}</Label>
                                                            <Input
                                                                value={customFields[name] || valueFromIdentity || ""}
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomFields({ ...customFields, [name]: e.target.value })}
                                                                placeholder={`Saisir ${name.toLowerCase().replace('_', ' ')}`}
                                                                className="h-12 rounded-xl bg-white border-slate-100 focus-visible:ring-blue-500"
                                                            />
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Reservation Details */}
                                    <div className="space-y-4">
                                        <Label className="text-xs font-black uppercase tracking-wider text-slate-500">Détails de réservation</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold text-muted-foreground ml-1">Nombre de personnes</Label>
                                                <Input
                                                    type="number"
                                                    value={reservationData.guestsCount}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReservationData({ ...reservationData, guestsCount: parseInt(e.target.value) })}
                                                    className="h-12 rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold text-muted-foreground ml-1">Heure d'arrivée</Label>
                                                <Input
                                                    type="time"
                                                    value={reservationData.time}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReservationData({ ...reservationData, time: e.target.value })}
                                                    className="h-12 rounded-xl"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-muted-foreground ml-1">Notes / Demandes spéciales</Label>
                                            <Textarea
                                                value={reservationData.notes}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReservationData({ ...reservationData, notes: e.target.value })}
                                                placeholder="Un commentaire pour l'hôte ?"
                                                className="rounded-xl min-h-[80px]"
                                            />
                                        </div>
                                    </div>

                                    {/* Price Card */}
                                    <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-100">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <p className="text-xs font-bold text-blue-100 uppercase tracking-widest opacity-80">Prix estimé</p>
                                                <h4 className="text-3xl font-black">
                                                    {(() => {
                                                        const { price, policy } = getPriceDisplay(selectedElement);
                                                        return price > 0 ? `${price} Ar` : "Gratuit";
                                                    })()}
                                                </h4>
                                            </div>
                                            <Badge className="bg-white/20 hover:bg-white/30 border-none px-3 py-1">
                                                <CreditCard className="size-3 mr-2" />
                                                Paiement sur place
                                            </Badge>
                                        </div>
                                        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-blue-100">
                                            <span>Tarif {getPriceDisplay(selectedElement).policy}</span>
                                            <span>TTC</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {reservationStep === "confirm" && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                                    <SheetHeader>
                                        <div className="size-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-amber-200">
                                            <Check className="size-6" />
                                        </div>
                                        <SheetTitle className="text-2xl font-bold">Confirmer Réservation</SheetTitle>
                                        <SheetDescription>
                                            Récapitulatif de votre demande pour {selectedElement?.customData?.name}.
                                        </SheetDescription>
                                    </SheetHeader>

                                    <div className="divide-y border rounded-3xl overflow-hidden bg-white shadow-sm">
                                        <div className="p-5 flex justify-between items-center bg-slate-50/50">
                                            <span className="text-sm text-muted-foreground">Emplacement</span>
                                            <span className="font-bold text-blue-700">{selectedElement?.customData?.name}</span>
                                        </div>
                                        <div className="p-5 flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Identité utilisée</span>
                                            <span className="text-sm font-bold">{selectedIdentity ? `${selectedIdentity.firstName} ${selectedIdentity.lastName}` : "Non spécifiée"}</span>
                                        </div>
                                        <div className="p-5 flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Date & Heure</span>
                                            <span className="text-sm font-bold">{format(reservationData.date, "EEEE d MMMM", { locale: fr })} à {reservationData.time}</span>
                                        </div>
                                        <div className="p-5 flex justify-between items-center bg-blue-50/30">
                                            <span className="font-bold text-slate-800">Total estimé</span>
                                            <span className="text-xl font-black text-blue-600">
                                                {getPriceDisplay(selectedElement || {}).price} Ar
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100/50 flex items-start gap-4">
                                        <div className="size-10 rounded-full bg-white flex items-center justify-center text-amber-500 shrink-0">
                                            <CreditCard className="size-5" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-amber-900">Information Paiement</p>
                                            <p className="text-xs text-amber-700 leading-relaxed">
                                                Aucun débit immédiat. Le règlement s'effectue directement à l'établissement lors de votre arrivée.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {reservationStep === "success" && (
                                <div className="flex flex-col items-center justify-center py-12 space-y-8 animate-in zoom-in-95 duration-500">
                                    <div className="relative">
                                        <div className="absolute inset-0 scale-150 animate-ping rounded-full bg-emerald-100/50" />
                                        <div className="size-24 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-2xl shadow-emerald-200 relative z-10">
                                            <Check className="size-12" />
                                        </div>
                                    </div>
                                    <div className="text-center space-y-3">
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">C'est réservé !</h2>
                                        <p className="text-sm text-muted-foreground px-8 leading-relaxed">
                                            {selectedIdentity?.firstName}, votre place est prête. Un e-mail avec les détails vous sera envoyé.
                                        </p>
                                    </div>
                                    <div className="w-full pt-8 space-y-3">
                                        <Button asChild className="w-full h-16 rounded-2xl text-base shadow-xl shadow-blue-100 bg-blue-600 hover:bg-blue-700 font-bold" size="lg">
                                            <Link href="/dashboard">
                                                Voir mes réservations
                                                <ArrowRight className="ml-2 size-5" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" className="w-full h-12 rounded-xl text-muted-foreground" onClick={() => setIsReserving(false)}>
                                            Retour au plan
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <SheetFooter className="p-6 border-t bg-white absolute bottom-0 left-0 right-0 sm:flex-col gap-3">
                        {reservationStep === "details" && (
                            <Button
                                className="w-full h-14 rounded-2xl text-base shadow-xl shadow-blue-100 bg-blue-600 hover:bg-blue-700 font-black tracking-tight"
                                size="lg"
                                onClick={handleConfirmBooking}
                                disabled={!selectedIdentity && identities.length > 0}
                            >
                                CONTINUER LA RÉSERVATION
                                <ArrowRight className="ml-2 size-5" />
                            </Button>
                        )}
                        {reservationStep === "confirm" && (
                            <div className="flex gap-4 w-full">
                                <Button variant="outline" className="flex-1 h-16 rounded-2xl border-2 font-bold" size="lg" onClick={() => setReservationStep("details")}>
                                    RETOUR
                                </Button>
                                <Button
                                    className="flex-[2] h-16 rounded-2xl text-base shadow-xl shadow-blue-100 bg-emerald-600 hover:bg-emerald-700 font-black tracking-tight"
                                    size="lg"
                                    onClick={handleFinalSubmit}
                                    disabled={isReservingAPI}
                                >
                                    {isReservingAPI ? (
                                        <Loader2 className="animate-spin size-5" />
                                    ) : (
                                        "CONFIRMER & RÉSERVER"
                                    )}
                                </Button>
                            </div>
                        )}
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}
