import { useCalendarContext } from "@/components/calendar/calendar-context";
import { startOfDay, endOfDay, format } from "date-fns";

export default function CalendarBodyDayEvents() {
  const { events, date, setManageEventDialogOpen, setSelectedEvent } =
    useCalendarContext();
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);
  const dayEvents = events.filter(
    (event) => event.start < dayEnd && event.end > dayStart,
  );

  return (
    <div className="flex-1 space-y-2 overflow-y-auto p-4">
      <h3 className="text-muted-foreground text-sm font-medium">Events</h3>
      {dayEvents.map((event) => (
        <button
          key={event.id}
          onClick={() => {
            setSelectedEvent(event);
            setManageEventDialogOpen(true);
          }}
          className="hover:bg-accent/50 w-full rounded-md border p-2 text-left"
        >
          <div className="font-semibold">{event.title}</div>
          <div className="text-muted-foreground text-xs">
            {format(event.start, "h:mm a")} - {format(event.end, "h:mm a")}
          </div>
        </button>
      ))}
    </div>
  );
}
