import { useCalendarContext } from "@/components/calendar/calendar-context";
import CalendarBodyDay from "@/components/calendar/body/day/calendar-body-day";
import CalendarBodyWeek from "@/components/calendar/body/week/calendar-body-week";
import CalendarBodyMonth from "@/components/calendar/body/month/calendar-body-month";

export default function CalendarBody() {
  const { mode } = useCalendarContext();

  return (
    <>
      {mode === "day" && <CalendarBodyDay />}
      {mode === "week" && <CalendarBodyWeek />}
      {mode === "month" && <CalendarBodyMonth />}
    </>
  );
}
