import type { CalendarProps } from "@/components/calendar/calendar-types"
import CalendarHeader from "@/components/calendar/header/calendar-header"
import CalendarBody from "@/components/calendar/body/calendar-body"
import CalendarHeaderActions from "@/components/calendar/header/actions/calendar-header-actions"
import CalendarHeaderDate from "@/components/calendar/header/date/calendar-header-date"
import CalendarHeaderActionsMode from "@/components/calendar/header/actions/calendar-header-actions-mode"
import CalendarHeaderActionsAdd from "@/components/calendar/header/actions/calendar-header-actions-add"
import CalendarHeaderActionsNext from "@/components/calendar/header/actions/calendar-header-actions-next"
import CalendarProvider from "@/components/calendar/calendar-provider"

export default function Calendar({
  events,
  setEvents,
  mode,
  setMode,
  date,
  setDate,
  calendarIconIsToday = true,
}: CalendarProps) {
  return (
    <CalendarProvider
      events={events}
      setEvents={setEvents}
      mode={mode}
      setMode={setMode}
      date={date}
      setDate={setDate}
      calendarIconIsToday={calendarIconIsToday}
    >
      <CalendarHeader>
        <CalendarHeaderDate />
        <CalendarHeaderActions>
          <CalendarHeaderActionsNext />
          <CalendarHeaderActionsMode />
          <CalendarHeaderActionsAdd />
        </CalendarHeaderActions>
      </CalendarHeader>
      <CalendarBody />
    </CalendarProvider>
  )
}
