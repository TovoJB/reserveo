"use client";

import { format, addDays } from "date-fns";
import { useCalendarStore } from "@/store/calendar-store";
import { Event } from "@/mock-data/events";
import { useEffect, useRef, useState } from "react";
import { EventSheet } from "./event-sheet";
import { CalendarWeekHeader } from "./calendar-week-header";
import { CalendarHoursColumn } from "./calendar-hours-column";
import { CalendarDayColumn } from "./calendar-day-column";
import { INITIAL_SCROLL_OFFSET, getCurrentTimePosition, getHoursRange } from "./calendar-utils";
import { useBookingStore } from "@/store/booking-store";
import { useTypesStore } from "@/store/types-store";

export function CalendarView() {
  const { goToNextWeek, goToPreviousWeek, getWeekDays, getCurrentWeekEvents } =
    useCalendarStore();
  const weekDays = getWeekDays();
  const hoursScrollRef = useRef<HTMLDivElement>(null);
  const daysScrollRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hasScrolledRef = useRef(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const today = new Date();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const { reservations } = useBookingStore();

  const bookingEvents = Object.values(reservations).map(res => {
    const entryDateStr = res.entryTime ? res.entryTime.split(" ")[0] : res.date.split("T")[0];
    const startTime = res.entryTime ? res.entryTime.split(" ")[1] : res.time;
    const exitDetails = res.exitTime ? res.exitTime.split(" ") : null;
    let endTime = exitDetails ? exitDetails[1] : startTime;
    if (endTime === startTime) {
      // Just a default hour padding if identical
      const [h, m] = startTime.split(":");
      endTime = `${(parseInt(h) + 1).toString().padStart(2, '0')}:${m}`;
    }

    return {
      id: res.id,
      title: `Réservation: ${res.customerName}`,
      date: entryDateStr,
      startTime,
      endTime,
      participants: ["user1"],
      reservationData: res
    } as Event;
  });

  const allEvents = bookingEvents;

  const eventsByDay: Record<string, Event[]> = {};
  weekDays.forEach((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    eventsByDay[dayStr] = allEvents.filter((e) => e.date === dayStr);
  });

  const daysWithEventsNextDay: Record<string, boolean> = {};
  weekDays.forEach((day) => {
    const nextDay = addDays(day, 1);
    const nextDayStr = format(nextDay, "yyyy-MM-dd");
    daysWithEventsNextDay[format(day, "yyyy-MM-dd")] = allEvents.some(e => e.date === nextDayStr);
  });

  const isTodayInWeek = weekDays.some(
    (day) => format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
  );

  const { openingHours } = useTypesStore();

  // Calculate dynamic range based on opening hours
  const activeHoursList = Object.values(openingHours)
    .filter(d => d.isOpen)
    .map(d => ({
      open: parseInt(d.openTime.split(':')[0]),
      close: d.closeTime === '00:00' ? 24 : parseInt(d.closeTime.split(':')[0])
    }));

  const minOpenHour = activeHoursList.length > 0 ? Math.min(...activeHoursList.map(h => h.open)) : 8;
  const maxCloseHour = activeHoursList.length > 0 ? Math.max(...activeHoursList.map(h => h.close)) : 22;

  // Adjusted range: add 1 hour buffer if possible
  const startRangeHour = Math.max(0, minOpenHour - 1);
  const endRangeHour = Math.min(24, maxCloseHour + 1);
  const calendarHours = getHoursRange(startRangeHour, endRangeHour - 1);

  useEffect(() => {
    const scrollToInitial = () => {
      if (!hasScrolledRef.current && hoursScrollRef.current) {
        // Scroll to 2 hours before current time for better context
        const now = new Date();
        const currentPos = getCurrentTimePosition(now, startRangeHour);
        const scrollTarget = Math.max(0, currentPos - (2 * 120)); // 120 is HOUR_HEIGHT

        hoursScrollRef.current.scrollTop = scrollTarget;
        daysScrollRefs.current.forEach((ref) => {
          if (ref) {
            ref.scrollTop = scrollTarget;
          }
        });
        hasScrolledRef.current = true;
      }
    };

    scrollToInitial();
    const timeoutId = setTimeout(scrollToInitial, 100);
    return () => clearTimeout(timeoutId);
  }, [weekDays]);

  const handleHoursScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    daysScrollRefs.current.forEach((ref) => {
      if (ref) {
        ref.scrollTop = scrollTop;
      }
    });
  };

  const handleDayScroll =
    (index: number) => (e: React.UIEvent<HTMLDivElement>) => {
      const scrollTop = e.currentTarget.scrollTop;
      if (hoursScrollRef.current) {
        hoursScrollRef.current.scrollTop = scrollTop;
      }
      daysScrollRefs.current.forEach((ref, idx) => {
        if (ref && idx !== index) {
          ref.scrollTop = scrollTop;
        }
      });
    };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setSheetOpen(true);
  };

  return (
    <>
      <EventSheet
        event={selectedEvent}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
      <div className="flex flex-col h-full overflow-x-auto w-full">
        <CalendarWeekHeader
          weekDays={weekDays}
          onPreviousWeek={goToPreviousWeek}
          onNextWeek={goToNextWeek}
          daysWithEventsNextDay={daysWithEventsNextDay}
        />

        <div className="flex min-w-full w-max">
          <CalendarHoursColumn
            onScroll={handleHoursScroll}
            scrollRef={hoursScrollRef}
            hours={calendarHours}
          />

          {weekDays.map((day, dayIndex) => {
            const dayStr = format(day, "yyyy-MM-dd");
            const dayEvents = eventsByDay[dayStr] || [];

            return (
              <CalendarDayColumn
                key={day.toISOString()}
                day={day}
                dayIndex={dayIndex}
                events={dayEvents}
                today={today}
                isTodayInWeek={isTodayInWeek}
                currentTime={currentTime}
                onScroll={handleDayScroll}
                scrollRef={(el) => {
                  daysScrollRefs.current[dayIndex] = el;
                }}
                onEventClick={handleEventClick}
                hours={calendarHours}
                startRangeHour={startRangeHour}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
