"use client";

import { useNotifications } from "@/hooks/use-notifications";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, Check, Clock, UserCheck, X, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function NotificationDropdown() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, isLoading } = useNotifications();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-background animate-in fade-in zoom-in duration-300">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96 p-0 shadow-xl border-border/50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
                    <div className="flex items-center gap-2">
                        <DropdownMenuLabel className="p-0 font-semibold text-sm">Notifications</DropdownMenuLabel>
                        {unreadCount > 0 && (
                            <Badge variant="secondary" className="px-1.5 h-4.5 text-[10px] bg-red-500/10 text-red-600 border-red-500/20">
                                {unreadCount} nouvelles
                            </Badge>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.preventDefault(); markAllAsRead(); }}
                            className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                        >
                            Tout marquer lu
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator className="m-0" />
                <div className="max-h-[420px] overflow-y-auto scrollbar-hide py-1">
                    {isLoading ? (
                        <div className="p-8 text-center text-xs text-muted-foreground italic flex flex-col items-center gap-3">
                            <Clock className="size-6 animate-pulse opacity-50" />
                            Chargement...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-12 text-center text-xs text-muted-foreground italic flex flex-col items-center gap-3">
                            <Bell className="size-10 text-slate-100 dark:text-slate-800" />
                            Aucune notification pour le moment.
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <DropdownMenuItem key={notif.id} asChild>
                                <div
                                    className={cn(
                                        "group flex flex-col items-start gap-1 p-4 cursor-pointer hover:bg-primary/5 transition-colors border-l-2 relative",
                                        notif.readAt ? "border-transparent bg-muted/5" : "border-primary bg-primary/[0.02]"
                                    )}
                                    onClick={() => !notif.readAt && markAsRead(notif.uuid)}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "p-1.5 rounded-full",
                                                notif.type === 'INVITATION_ACCEPTED' ? "bg-emerald-500/10 text-emerald-600" : "bg-blue-500/10 text-blue-600"
                                            )}>
                                                {notif.type === 'INVITATION_ACCEPTED' ? <UserCheck className="size-3" /> : <Bell className="size-3" />}
                                            </div>
                                            <span className={cn(
                                                "font-bold text-xs truncate max-w-[150px]",
                                                notif.readAt ? "text-muted-foreground" : "text-foreground"
                                            )}>
                                                {notif.title}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {/* Actions */}
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!notif.readAt && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 rounded-full"
                                                        title="Marquer comme lu"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markAsRead(notif.uuid);
                                                        }}
                                                    >
                                                        <Check className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-full"
                                                    title="Supprimer définitivement"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteNotification(notif.uuid);
                                                    }}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter whitespace-nowrap ml-1">
                                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr })}
                                            </span>
                                        </div>
                                    </div>
                                    <p className={cn(
                                        "text-xs leading-relaxed pl-7 pr-4",
                                        notif.readAt ? "text-muted-foreground italic" : "text-muted-foreground"
                                    )}>
                                        {notif.message}
                                    </p>
                                    {!notif.readAt && (
                                        <div className="flex w-full justify-end mt-1 pl-7">
                                            <div className="size-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                        </div>
                                    )}
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
                <DropdownMenuSeparator className="m-0" />
                <div className="p-2 bg-muted/10">
                    <Button variant="ghost" size="sm" className="w-full h-8 text-xs font-bold text-muted-foreground hover:text-primary transition-all duration-300 flex items-center justify-center gap-2 group">
                        <Clock className="size-3 group-hover:rotate-12 transition-transform" />
                        Historique complet
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
