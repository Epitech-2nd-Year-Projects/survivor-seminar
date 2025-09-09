import { Calendar } from "@/components/ui/calendar"
import { useCalendarContext } from "@/components/calendar/calendar-context"

export default function CalendarBodyDayCalendar() {
  const { date, setDate } = useCalendarContext()
  return (
    <div className="p-4">
      <Calendar
        mode="single"
        selected={date}
        month={date}
        onSelect={(d) => d && setDate(d)}
        className="bg-transparent"
      />
    </div>
  )
}
