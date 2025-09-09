import { useCalendarContext } from "@/components/calendar/calendar-context"
import { startOfDay, endOfDay, format } from "date-fns"

export default function CalendarBodyDayEvents() {
  const { events, date, setManageEventDialogOpen, setSelectedEvent } = useCalendarContext()
  const dayStart = startOfDay(date)
  const dayEnd = endOfDay(date)
  const dayEvents = events.filter((event) => event.start < dayEnd && event.end > dayStart)

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Events</h3>
      {dayEvents.map((event) => (
        <button
          key={event.id}
          onClick={() => {
            setSelectedEvent(event)
            setManageEventDialogOpen(true)
          }}
          className="w-full text-left rounded-md border p-2 hover:bg-accent/50"
        >
          <div className="font-semibold">{event.title}</div>
          <div className="text-xs text-muted-foreground">
            {format(event.start, "h:mm a")} - {format(event.end, "h:mm a")}
          </div>
        </button>
      ))}
    </div>
  )
}
