"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Calendar, UserCircle, Settings, Home, LayoutList, Ticket } from "lucide-react";

export function DashboardNav() {
    const pathname = usePathname();

    const items = [
        {
            title: "Réservations",
            href: "/dashboard",
            icon: Calendar,
        },
        {
            title: "Mes Abonnements",
            href: "/dashboard/subscriptions",
            icon: LayoutList,
        },
        {
            title: "Mes Évènements",
            href: "/dashboard/events",
            icon: Ticket,
        },
        {
            title: "Mes Identités",
            href: "/dashboard/identities",
            icon: UserCircle,
        },
    ];

    return (
        <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            {items.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all hover:bg-slate-100",
                        pathname === item.href
                            ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-100/50"
                            : "text-slate-500"
                    )}
                >
                    <item.icon className={cn("size-5", pathname === item.href ? "text-blue-600" : "text-slate-400")} />
                    {item.title}
                </Link>
            ))}
        </nav>
    );
}
