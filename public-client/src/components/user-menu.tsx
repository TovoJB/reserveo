"use client";

import { UserButton, useUser, SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs";
import {
    UserCircle,
    Settings,
    LogOut,
    LayoutDashboard,
    Calendar,
    ChevronDown,
    User
} from "lucide-react";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserMenu() {
    const { user, isLoaded } = useUser();

    if (!isLoaded) return <div className="size-8 rounded-full bg-slate-100 animate-pulse" />;

    return (
        <div className="flex items-center gap-3">
            <SignedIn>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-10 pl-1 pr-3 rounded-full hover:bg-slate-100 gap-2 border border-slate-100">
                            <Avatar className="size-8 border">
                                <AvatarImage src={user?.imageUrl} />
                                <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">
                                    {user?.firstName?.charAt(0) || user?.username?.charAt(0) || <User className="size-4" />}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start hidden sm:flex">
                                <span className="text-[11px] font-bold leading-none">{user?.firstName || "Mon Compte"}</span>
                                <span className="text-[9px] text-slate-400 font-medium">Menu</span>
                            </div>
                            <ChevronDown className="size-3 text-slate-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-xl border-slate-100 animate-in zoom-in-95 duration-200">
                        <div className="px-3 py-4 bg-slate-50/50 rounded-xl mb-2">
                            <div className="flex items-center gap-3">
                                <Avatar className="size-10 border-2 border-white shadow-sm">
                                    <AvatarImage src={user?.imageUrl} />
                                    <AvatarFallback>{user?.firstName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-black text-slate-900 truncate">{user?.fullName || user?.username}</span>
                                    <span className="text-[10px] text-slate-500 truncate">{user?.primaryEmailAddress?.emailAddress}</span>
                                </div>
                            </div>
                        </div>

                        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-slate-400 font-black px-3 py-2">
                            Gestion Compte
                        </DropdownMenuLabel>

                        <DropdownMenuItem asChild className="h-12 rounded-xl gap-3 cursor-pointer">
                            <Link href="/dashboard">
                                <LayoutDashboard className="size-5 text-blue-600" />
                                <span className="font-bold text-sm">Tableau de bord</span>
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild className="h-12 rounded-xl gap-3 cursor-pointer">
                            <Link href="/dashboard/identities">
                                <UserCircle className="size-5 text-indigo-600" />
                                <span className="font-bold text-sm">Mes Identités</span>
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild className="h-12 rounded-xl gap-3 cursor-pointer">
                            <Link href="/dashboard">
                                <Calendar className="size-5 text-emerald-600" />
                                <span className="font-bold text-sm">Mes Réservations</span>
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="my-2" />

                        <DropdownMenuItem asChild className="h-12 rounded-xl gap-3 cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50">
                            <SignOutButton>
                                <div className="flex items-center gap-3 w-full">
                                    <LogOut className="size-5" />
                                    <span className="font-bold text-sm">Se déconnecter</span>
                                </div>
                            </SignOutButton>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SignedIn>

            <SignedOut>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" asChild className="rounded-xl font-bold text-xs h-9">
                        <Link href="/sign-in">Se connecter</Link>
                    </Button>
                    <Button asChild className="rounded-xl font-black text-xs h-9 bg-slate-900 shadow-lg shadow-slate-200 hover:scale-105 active:scale-95 transition-transform">
                        <Link href="/sign-up">S'inscrire</Link>
                    </Button>
                </div>
            </SignedOut>
        </div>
    );
}
