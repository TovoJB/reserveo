"use client";

import { format, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarWeekHeaderProps {
  weekDays: Date[];
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  daysWithEventsNextDay: Record<string, boolean>;
}

export function CalendarWeekHeader({
  weekDays,
  onPreviousWeek,
  onNextWeek,
  daysWithEventsNextDay,
}: CalendarWeekHeaderProps) {
  return (
    <div className="flex border-b border-border sticky top-0 z-30 bg-background w-max min-w-full">
      <div className="w-[80px] md:w-[104px] flex items-center gap-1 md:gap-2 p-1.5 md:p-2 border-r border-border shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="size-7 md:size-8"
          onClick={onPreviousWeek}
        >
          <ChevronLeft className="size-4 md:size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 md:size-8"
          onClick={onNextWeek}
        >
          <ChevronRight className="size-4 md:size-5" />
        </Button>
      </div>
      {weekDays.map((day) => {
        const dayStr = format(day, "yyyy-MM-dd");
        const hasNextDayEvent = daysWithEventsNextDay[dayStr];
        const isToday = isSameDay(day, new Date());
        return (
          <div
            key={day.toISOString()}
            className={`flex-1 border-r border-border last:border-r-0 p-1.5 md:p-2 min-w-44 flex items-center gap-2 ${isToday ? "bg-blue-50/50" : ""}`}
          >
            {hasNextDayEvent && (
              <div className="flex items-center" title="Événement le lendemain">
                <div className="size-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              </div>
            )}
            <div className={`text-xs md:text-sm font-bold ${isToday ? "text-blue-600" : "text-foreground"}`}>
              {format(day, "dd EEE").toUpperCase()}
              {isToday && <span className="ml-2 text-[8px] bg-blue-600 text-white px-1 rounded-sm">AUJ</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

