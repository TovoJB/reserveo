"use client";

import { useIdentities, ClientIdentity } from "@/hooks/use-identities";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import {
    Plus,
    UserCircle,
    Mail,
    Phone,
    MapPin,
    MoreVertical,
    Trash2,
    Edit2,
    Check,
    Loader2,
    AlertCircle,
    Star
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@clerk/nextjs";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

const COUNTRY_CODES = [
    { code: "+261", label: "🇲🇬 Madagascar (+261)" },
    { code: "+33", label: "🇫🇷 France (+33)" },
    { code: "+262", label: "🇷🇪 Réunion (+262)" },
    { code: "+1", label: "🇺🇸 USA (+1)" },
];

export default function IdentitiesPage() {
    const { user } = useUser();
    const {
        identities,
        isLoading,
        addIdentity,
        updateIdentity,
        deleteIdentity
    } = useIdentities();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingIdentity, setEditingIdentity] = useState<ClientIdentity | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phonePrefix: "+261",
        phoneNumber: "",
        whatsapp: false,
        isDefault: false,
    });

    const resetForm = () => {
        setFormData({
            firstName: "",
            lastName: "",
            email: user?.primaryEmailAddress?.emailAddress || "",
            phonePrefix: "+261",
            phoneNumber: "",
            whatsapp: false,
            isDefault: false,
        });
        setEditingIdentity(null);
    };

    const handleOpenDialog = (identity?: ClientIdentity) => {
        if (identity) {
            setEditingIdentity(identity);

            // Extract prefix and number if possible, or just use as is
            let prefix = "+261";
            let num = identity.phone || "";
            for (const c of COUNTRY_CODES) {
                if (num.startsWith(c.code)) {
                    prefix = c.code;
                    num = num.substring(c.code.length);
                    break;
                }
            }

            setFormData({
                firstName: identity.firstName,
                lastName: identity.lastName,
                email: identity.email || user?.primaryEmailAddress?.emailAddress || "",
                phonePrefix: prefix,
                phoneNumber: num,
                whatsapp: identity.whatsapp || false,
                isDefault: identity.isDefault,
            });
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: `${formData.phonePrefix}${formData.phoneNumber}`,
                whatsapp: formData.whatsapp,
                isDefault: formData.isDefault,
            };

            if (editingIdentity) {
                await updateIdentity(editingIdentity.id, payload);
            } else {
                await addIdentity(payload);
            }
            setIsDialogOpen(false);
            resetForm();
        } catch (error) {
            console.error("Form submission failed:", error);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette identité ?")) {
            try {
                await deleteIdentity(id);
            } catch (error) {
                console.error("Deletion failed:", error);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 animate-pulse">
                <Loader2 className="size-8 animate-spin text-blue-600 mb-4" />
                <p className="text-slate-500 font-medium">Chargement de vos identités...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mes Identités</h1>
                    <p className="text-slate-500 mt-1">Gérez vos profils pour des réservations rapides.</p>
                </div>
                <Button
                    onClick={() => handleOpenDialog()}
                    className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 font-bold"
                >
                    <Plus className="size-5 mr-2" />
                    AJOUTER
                </Button>
            </div>

            {identities.length === 0 ? (
                <Card className="border-dashed border-2 py-20 flex flex-col items-center justify-center text-center bg-transparent rounded-[2.5rem]">
                    <div className="size-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                        <UserCircle className="size-10 text-slate-300" />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900">Aucune identité trouvée</CardTitle>
                    <CardDescription className="mt-2 max-w-sm px-6">
                        Créez votre première identité pour faciliter vos futures réservations d'espace.
                    </CardDescription>
                    <Button
                        variant="link"
                        onClick={() => handleOpenDialog()}
                        className="mt-4 text-blue-600 font-bold"
                    >
                        Créer maintenant
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {identities.map((identity) => (
                        <Card
                            key={identity.id}
                            className={`group border-slate-100 overflow-hidden relative transition-all hover:shadow-xl hover:shadow-slate-200/50 rounded-[2rem] 
                                ${identity.isDefault ? "ring-2 ring-blue-500/20 bg-blue-50/10 border-blue-100" : "bg-white"}
                            `}
                        >
                            {identity.isDefault && (
                                <div className="absolute top-0 right-0 p-3">
                                    <div className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-blue-200 uppercase tracking-wider">
                                        PAR DÉFAUT
                                    </div>
                                </div>
                            )}

                            <CardHeader className="flex flex-row items-center gap-4 pb-4">
                                <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shrink-0">
                                    <UserCircle className="size-7" />
                                </div>
                                <div className="flex-1 min-w-0 pr-8">
                                    <CardTitle className="text-xl font-black text-slate-900 truncate">
                                        {identity.firstName} {identity.lastName}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-1.5 mt-0.5">
                                        <Check className="size-3 text-emerald-500" />
                                        Identité vérifiée
                                    </CardDescription>
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8 rounded-full">
                                            <MoreVertical className="size-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5">
                                        <DropdownMenuItem onClick={() => handleOpenDialog(identity)} className="rounded-lg h-10 gap-3">
                                            <Edit2 className="size-4 text-slate-500" /> Modifier
                                        </DropdownMenuItem>
                                        {!identity.isDefault && (
                                            <DropdownMenuItem onClick={() => updateIdentity(identity.id, { isDefault: true })} className="rounded-lg h-10 gap-3">
                                                <Star className="size-4 text-blue-500" /> Définir par défaut
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => handleDelete(identity.id)}
                                            className="rounded-lg h-10 gap-3 text-red-600 focus:text-red-600"
                                        >
                                            <Trash2 className="size-4" /> Supprimer
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>

                            <CardContent className="space-y-4 pt-2">
                                <div className="grid grid-cols-1 gap-3">
                                    {identity.email && (
                                        <div className="flex items-center gap-3 text-sm text-slate-600">
                                            <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                                <Mail className="size-4" />
                                            </div>
                                            <span className="truncate">{identity.email}</span>
                                        </div>
                                    )}
                                    {identity.phone && (
                                        <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                                    <Phone className="size-4" />
                                                </div>
                                                <span className="font-medium">{identity.phone}</span>
                                            </div>
                                            {identity.whatsapp && (
                                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 animate-in fade-in zoom-in-95">
                                                    <svg viewBox="0 0 24 24" className="size-3 fill-current" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                    </svg>
                                                    <span className="text-[10px] font-black uppercase tracking-tight">WHATSAPP</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Form Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem]">
                    <DialogHeader className="p-8 pb-4">
                        <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                            {editingIdentity ? "Modifier l'Identité" : "Nouvelle Identité"}
                        </DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Remplissez les informations pour une utilisation simplifiée lors de vos réservations.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        <div className="px-8 py-4 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Prénom</Label>
                                    <Input
                                        required
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        placeholder="Ex: Jean"
                                        className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-blue-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Nom</Label>
                                    <Input
                                        required
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        placeholder="Ex: Dupont"
                                        className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-blue-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Adresse E-mail (Auto)</Label>
                                <Input
                                    type="email"
                                    readOnly
                                    value={formData.email}
                                    className="h-12 rounded-xl bg-slate-100 border-transparent text-slate-500 cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Téléphone</Label>
                                <div className="flex gap-2">
                                    <Select
                                        value={formData.phonePrefix}
                                        onValueChange={(val) => setFormData({ ...formData, phonePrefix: val })}
                                    >
                                        <SelectTrigger className="w-[140px] h-12 rounded-xl bg-slate-50 border-transparent">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {COUNTRY_CODES.map(c => (
                                                <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        type="tel"
                                        required
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        placeholder="03..."
                                        className="flex-1 h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-blue-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-50/50 border border-slate-100">
                                <Checkbox
                                    id="whatsapp"
                                    checked={formData.whatsapp}
                                    onCheckedChange={(checked) => setFormData({ ...formData, whatsapp: !!checked })}
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <label
                                        htmlFor="whatsapp"
                                        className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        Disponible sur WhatsApp
                                    </label>
                                    <p className="text-[10px] text-slate-400">
                                        L'organisateur pourra vous contacter via WhatsApp via ce numéro.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-8 bg-slate-50/50 mt-4 flex sm:flex-row gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsDialogOpen(false)}
                                className="flex-1 h-14 rounded-2xl font-bold text-slate-500 hover:bg-slate-100"
                            >
                                ANNULER
                            </Button>
                            <Button
                                type="submit"
                                disabled={formLoading}
                                className="flex-[2] h-14 rounded-2xl font-black bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200"
                            >
                                {formLoading ? (
                                    <Loader2 className="size-5 animate-spin" />
                                ) : (
                                    editingIdentity ? "Mettre à jour" : "ENREGISTRER"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
