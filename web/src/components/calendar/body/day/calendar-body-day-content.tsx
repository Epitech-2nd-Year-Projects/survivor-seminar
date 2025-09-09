import { useCalendarContext } from "@/components/calendar/calendar-context";
import { startOfDay, endOfDay } from "date-fns";
import CalendarBodyHeader from "@/components/calendar/body/calendar-body-header";
import CalendarEvent from "@/components/calendar/calendar-event";
import { hours } from "@/components/calendar/body/day/calendar-body-margin-day-margin";

export default function CalendarBodyDayContent({ date }: { date: Date }) {
  const { events } = useCalendarContext();
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);
  const dayEvents = events.filter(
    (event) => event.start < dayEnd && event.end > dayStart,
  );

  return (
    <div className="flex flex-grow flex-col">
      <CalendarBodyHeader date={date} />
      <div className="relative flex-1">
        {hours.map((hour) => (
          <div key={hour} className="border-border/50 group h-32 border-b" />
        ))}
        {dayEvents.map((event) => (
          <CalendarEvent key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
