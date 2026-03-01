"use client";

import Link from "next/link";
import { UserCircle, Calendar, MapPin, Search } from "lucide-react";
import { UserMenu } from "./user-menu";
import { NotificationBell } from "./notification-bell";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function AppHeader() {
    const pathname = usePathname();

    const menuItems = [
        { title: "Découvrir", href: "/discover", icon: Search },
        { title: "Réservations", href: "/dashboard", icon: Calendar },
        { title: "Identités", href: "/dashboard/identities", icon: UserCircle },
    ];

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
            <div className="container mx-auto h-16 flex items-center justify-between px-6">
                <div className="flex items-center gap-10">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-all hover:scale-105 active:scale-95 duration-200">
                        <div className="size-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                            <span className="font-black text-xs italic">RV</span>
                        </div>
                        <span className="text-xl font-black tracking-tight text-slate-900 hidden sm:block">RESERVEO</span>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-1">
                        {menuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                                    pathname === item.href
                                        ? "bg-blue-50 text-blue-700 shadow-sm"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <item.icon className={cn("size-4", pathname === item.href ? "text-blue-600" : "text-slate-400")} />
                                {item.title}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <NotificationBell />
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}
