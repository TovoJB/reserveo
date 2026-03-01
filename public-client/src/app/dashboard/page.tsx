import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock } from "lucide-react";

export default async function DashboardPage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    // Fetch reservations through a Server Component or use client hook in a child component
    // For now, let's keep it simple with a placeholder

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mes Réservations</h1>
                <p className="text-slate-500 mt-1">Gérez vos réservations en cours et passées.</p>
            </div>

            <div className="grid gap-4">
                <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="pb-0">
                        <div className="flex justify-between items-start">
                            <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none font-bold px-3 py-1">À VENIR</Badge>
                            <span className="text-xl font-black text-blue-600">45 000 Ar</span>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-start gap-4">
                                <div className="size-12 rounded-xl bg-slate-50 flex items-center justify-center text-blue-600 shrink-0">
                                    <MapPin className="size-6" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-bold">Table 12 - Restaurant Le Gourmet</CardTitle>
                                    <CardDescription className="flex items-center gap-2">
                                        <Calendar className="size-3" />
                                        Samedi 1 Mars 2026
                                        <span className="mx-1">•</span>
                                        <Clock className="size-3" />
                                        19:30
                                    </CardDescription>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400">
                    <p className="text-sm italic">Vous n'avez pas encore d'autres réservations.</p>
                </div>
            </div>
        </div>
    );
}
