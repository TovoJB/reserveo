"use client";

import { useNotifications } from "@/hooks/use-notifications";
import { Bell, Check, Clock, Info, AlertTriangle, CheckCircle2, UserPlus, Send } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { SignedIn } from "@clerk/nextjs";

export function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, acceptInvitation, isLoading } = useNotifications();

    const getIcon = (type: string) => {
        switch (type) {
            case "RESERVATION_CONFIRMED":
                return <CheckCircle2 className="size-4 text-emerald-500" />;
            case "RESERVATION_CANCELLED":
                return <AlertTriangle className="size-4 text-red-500" />;
            case "PAYMENT_RECEIVED":
                return <Info className="size-4 text-blue-500" />;
            case "INVITATION_RECEIVED":
                return <UserPlus className="size-4 text-amber-500" />;
            default:
                return <Clock className="size-4 text-slate-400" />;
        }
    };

    return (
        <SignedIn>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full hover:bg-slate-100 border border-transparent hover:border-slate-100 transition-all">
                        <Bell className="size-5 text-slate-600" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white ring-2 ring-white animate-in zoom-in-50">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden rounded-[1.5rem] shadow-2xl border-slate-100 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between px-5 py-4 bg-slate-50/50 border-b">
                        <div>
                            <DropdownMenuLabel className="p-0 text-base font-black text-slate-900 leading-none">Notifications</DropdownMenuLabel>
                            <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-wider">
                                {unreadCount} non lues
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAllAsRead()}
                                className="h-8 px-3 rounded-lg text-[10px] font-black text-blue-600 hover:bg-blue-50"
                            >
                                TOUT LIRE
                            </Button>
                        )}
                    </div>

                    <ScrollArea className="h-[380px]">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                                <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                                    <Bell className="size-6 text-slate-300" />
                                </div>
                                <p className="text-sm font-bold text-slate-900">Aucune notification</p>
                                <p className="text-xs text-slate-500 mt-1">Vous êtes à jour !</p>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {notifications.map((n) => (
                                    <DropdownMenuItem
                                        key={n.id}
                                        onClick={() => !n.readAt && markAsRead(n.id)}
                                        className={cn(
                                            "flex flex-col items-start gap-1 p-5 cursor-pointer transition-colors border-b last:border-0 rounded-none focus:bg-slate-50",
                                            !n.readAt ? "bg-blue-50/30 hover:bg-blue-50/50" : "opacity-75"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 w-full">
                                            <div className="size-7 rounded-lg bg-white shadow-sm flex items-center justify-center border border-slate-100">
                                                {getIcon(n.type)}
                                            </div>
                                            <span className="font-black text-xs text-slate-900 flex-1">{n.title}</span>
                                            {!n.readAt && <div className="size-2 rounded-full bg-blue-600" />}
                                        </div>
                                        <p className="text-xs text-slate-600 font-medium leading-relaxed pl-9">
                                            {n.message}
                                        </p>

                                        {n.type === "INVITATION_RECEIVED" && !n.readAt && (
                                            <div className="pl-9 mt-2 w-full">
                                                <Button
                                                    size="sm"
                                                    className="w-full h-8 bg-amber-600 hover:bg-amber-700 text-[10px] font-black uppercase rounded-lg shadow-sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        acceptInvitation(n.data?.relationshipId);
                                                        markAsRead(n.id);
                                                    }}
                                                >
                                                    Accepter l'invitation
                                                </Button>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-1.5 mt-1 pl-9">
                                            <Clock className="size-3 text-slate-400" />
                                            <span className="text-[10px] font-bold text-slate-400">
                                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: fr })}
                                            </span>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    <div className="p-3 bg-slate-50/50 border-t text-center">
                        <Button variant="ghost" size="sm" className="w-full h-10 rounded-xl text-[11px] font-black uppercase text-slate-500">
                            VOIR TOUT LE CENTRE D'AIDE
                        </Button>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </SignedIn>
    );
}
