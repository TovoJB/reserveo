"use client";

import { useUser } from "@/hooks/use-user";
import { Badge } from "@/components/ui/badge";
import { Info, Ban } from "lucide-react";

interface RestrictionRule {
    type: string;
    operator: "min" | "max" | "equal";
    value: number;
}

interface UserRestrictions {
    rules: RestrictionRule[];
    forbiddenPlaces: string[];
}

export function RestrictionNotice({ workspaceType }: { workspaceType: 'FIXED' | 'EVENT' }) {
    const { user } = useUser();

    if (!user || !user.restrictions) return null;

    const rest = user.restrictions;

    if (rest === "all") {
        return (
            <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded-lg text-xs font-bold border border-red-100 italic">
                <Ban className="size-3.5" />
                Désolé, vos réservations sont temporairement bloquées sur cette plateforme.
            </div>
        );
    }

    if (rest === "none") return null;

    // Handle stringified JSON from backend if necessary
    let parsed: UserRestrictions = typeof rest === "string" ? JSON.parse(rest) : rest;

    const rules = parsed.rules || [];
    if (rules.length === 0) return null;

    return (
        <div className="mt-4 flex flex-col gap-2 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
            <p className="text-[11px] font-bold text-blue-800 uppercase flex items-center gap-1.5 opacity-80">
                <Info className="size-3" />
                Conditions de réservation
            </p>
            <ul className="space-y-1">
                {rules.map((rule, idx) => {
                    const label = workspaceType === 'EVENT' ? "places" : "objets";
                    let message = "";

                    if (rule.operator === "max") {
                        message = `Vous pouvez réserver au maximum ${rule.value} ${rule.type}${rule.value > 1 ? 's' : ''}`;
                    } else if (rule.operator === "min") {
                        message = `Vous devez réserver au moins ${rule.value} ${rule.type}${rule.value > 1 ? 's' : ''}`;
                    } else {
                        message = `Vous devez réserver exactement ${rule.value} ${rule.type}${rule.value > 1 ? 's' : ''}`;
                    }

                    const context = workspaceType === 'EVENT' ? "sur cet évènement" : "sur le même horaire";

                    return (
                        <li key={idx} className="text-xs text-blue-700 font-medium">
                            • {message}, {context}.
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
