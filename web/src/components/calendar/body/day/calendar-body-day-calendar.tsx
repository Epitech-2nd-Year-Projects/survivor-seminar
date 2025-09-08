import { Calendar } from "@/components/ui/calendar"

export default function CalendarBodyDayCalendar() {
  return (
    <div className="p-4">
      <Calendar mode="single" selected={new Date()} className="bg-transparent" />
    </div>
  )
}

