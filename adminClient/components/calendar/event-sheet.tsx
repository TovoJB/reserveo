"use client";

import { format } from "date-fns";
import {
  Pen,
  FileText,
  Layers,
  Trash2,
  X,
  ArrowUpRight,
  MapPin,
  Clock,
  User as UserIcon,
  Calendar as CalendarIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Event } from "@/mock-data/events";

interface EventSheetProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatTime(time: string): string {
  const [hour, minute] = time.split(":").map(Number);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return format(date, "EEEE, MMMM dd");
}

export function EventSheet({ event, open, onOpenChange }: EventSheetProps) {
  if (!event) return null;

  const dateStr = formatDate(event.date);
  const startTimeStr = formatTime(event.startTime);
  const endTimeStr = formatTime(event.endTime);
  const timezone = event.timezone || "Europe/Paris";

  const reservation = event.reservationData;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[560px] overflow-y-auto p-0 border-l border-r border-t [&>button]:hidden"
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="px-4 pt-4 pb-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 hover:bg-muted"
                >
                  <Pen className="size-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 hover:bg-muted"
                >
                  <FileText className="size-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 hover:bg-muted"
                >
                  <Layers className="size-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 hover:bg-muted"
                >
                  <Trash2 className="size-4 text-muted-foreground" />
                </Button>
              </div>
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 rounded-full bg-muted hover:bg-muted"
                >
                  <X className="size-4 text-muted-foreground" />
                </Button>
              </SheetClose>
            </div>

            <div className="flex flex-col gap-1 mb-4">
              <SheetTitle className="text-xl font-semibold text-foreground leading-normal">
                {event.title}
              </SheetTitle>
              <div className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
                <span>{dateStr}</span>
                <span className="size-1 rounded-full bg-muted-foreground" />
                <span>
                  {startTimeStr} - {endTimeStr}
                </span>
                <span className="size-1 rounded-full bg-muted-foreground" />
                <span>{timezone}</span>
              </div>
            </div>

            <Button variant="outline">
              <span>Propose new time</span>
              <ArrowUpRight className="size-4" />
            </Button>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="flex flex-col gap-4 max-w-[512px] mx-auto">
              {reservation && (
                <div className="flex flex-col gap-6">
                  {/* Reservation Details */}
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-4 border-b border-primary/10 pb-4">
                      <div className="size-10 bg-primary/20 text-primary rounded-full flex items-center justify-center shrink-0">
                        <UserIcon className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-foreground truncate">{reservation.customerName}</h4>
                        <p className="text-xs text-muted-foreground truncate">{reservation.customerPhone || "Aucun téléphone"}</p>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <div className="flex items-start gap-2 text-sm text-foreground">
                        <MapPin className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="leading-5"><span className="font-semibold">Réservation Spatiale :</span> {reservation.elementId}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Clock className="size-4 text-muted-foreground shrink-0" />
                        <span><span className="font-semibold">Statut :</span> <span className="uppercase text-[10px] tracking-wider font-bold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full">{reservation.status}</span></span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-foreground">
                        <CalendarIcon className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="leading-5">
                          <span className="font-semibold">Période :</span><br />
                          <span className="text-muted-foreground">Du</span> {reservation.entryTime || dateStr} <span className="text-muted-foreground">au</span> {reservation.exitTime || "Non défini"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {reservation.customFields && Object.keys(reservation.customFields).length > 0 && (
                    <div className="flex flex-col gap-2 pt-4 border-t border-border">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Informations Supplémentaires</h4>
                      {Object.entries(reservation.customFields).map(([key, val]) => (
                        <div key={key} className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">{key}</span>
                          <span className="font-medium text-foreground">{val as string}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reservation Note if any */}
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground leading-[1.6]">
                      Cette entrée est générée automatiquement depuis le système de réservation visuel du plan de salle. Les horaires peuvent être ajustés.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
