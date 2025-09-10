import { useCalendarContext } from "@/components/calendar/calendar-context";
import { isSameMonth } from "date-fns";

export default function CalendarHeaderDateBadge() {
  const { events, date } = useCalendarContext();
  const monthEvents = events.filter((event) => isSameMonth(event.start, date));
  if (!monthEvents.length) return null;
  return (
    <div className="rounded-sm border px-1.5 py-0.5 text-xs whitespace-nowrap">
      {monthEvents.length} events
    </div>
  );
}
