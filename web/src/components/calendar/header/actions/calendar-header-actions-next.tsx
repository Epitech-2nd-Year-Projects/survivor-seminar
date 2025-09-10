import { Button } from "@/components/ui/button";
import { useCalendarContext } from "@/components/calendar/calendar-context";
import { endOfMonth, startOfMonth } from "date-fns";

export default function CalendarHeaderActionsNext() {
  const { events, date, setDate, mode } = useCalendarContext();

  // Only show on month view
  if (mode !== "month") return null;

  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  const hasEventsThisMonth = events.some(
    (e) => e.start < monthEnd && e.end > monthStart,
  );
  if (hasEventsThisMonth) return null;

  // Find next event after current month
  const nextCandidates = events.filter((e) => e.start > monthEnd);
  if (nextCandidates.length === 0) return null;
  const next = nextCandidates
    .slice()
    .sort((a, b) => a.start.getTime() - b.start.getTime())[0];
  if (!next) return null;

  return (
    <Button variant="outline" onClick={() => setDate(next.start)}>
      Next Event
    </Button>
  );
}
