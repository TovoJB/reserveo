export interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  participants: string[];
  meetingLink?: string;
  timezone?: string;
  reservationData?: any;
}

export const events: Event[] = [];

export function getEventsForDay(date: Date): Event[] {
  const dayOfWeek = date.getDay() === 0 ? 6 : date.getDay() - 1;

  const baseWeekStart = new Date("2024-02-04");
  const baseDayOfWeek =
    baseWeekStart.getDay() === 0 ? 6 : baseWeekStart.getDay() - 1;

  return events.filter((event) => {
    const eventDate = new Date(event.date);
    const eventDayOfWeek =
      eventDate.getDay() === 0 ? 6 : eventDate.getDay() - 1;
    return eventDayOfWeek === dayOfWeek;
  });
}

export function addEvent(event: Omit<Event, "id">): void {
  const newId = String(events.length + 1);
  events.push({
    ...event,
    id: newId,
  });
}
