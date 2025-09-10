import { useCalendarContext } from "@/components/calendar/calendar-context";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from "date-fns";
import { cn } from "@/lib/utils";
import CalendarEvent from "@/components/calendar/calendar-event";
import { AnimatePresence, motion } from "framer-motion";

export default function CalendarBodyMonth() {
  const { date, events, setDate, setMode } = useCalendarContext();

  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const today = new Date();

  const visibleEvents = events.filter(
    (event) =>
      isWithinInterval(event.start, {
        start: calendarStart,
        end: calendarEnd,
      }) ||
      isWithinInterval(event.end, { start: calendarStart, end: calendarEnd }),
  );

  return (
    <div className="flex flex-grow flex-col overflow-hidden">
      <div className="border-border divide-border hidden grid-cols-7 divide-x md:grid">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div
            key={day}
            className="text-muted-foreground border-border border-b py-2 text-center text-sm font-medium"
          >
            {day}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={monthStart.toISOString()}
          className="relative grid flex-grow overflow-y-auto md:grid-cols-7"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {calendarDays.map((day) => {
            const dayStart = startOfDay(day);
            const dayEnd = endOfDay(day);
            const dayEvents = visibleEvents.filter(
              (event) => event.start < dayEnd && event.end > dayStart,
            );
            const isToday = isSameDay(day, today);
            const isCurrentMonth = isSameMonth(day, date);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "relative flex aspect-square cursor-pointer flex-col border-r border-b p-2",
                  !isCurrentMonth && "bg-muted/50 hidden md:flex",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setDate(day);
                  setMode("day");
                }}
              >
                <div
                  className={cn(
                    "flex aspect-square w-fit flex-col items-center justify-center rounded-full p-1 text-sm font-medium",
                    isToday && "bg-primary text-background",
                  )}
                >
                  {format(day, "d")}
                </div>
                <AnimatePresence mode="wait">
                  <div className="mt-1 flex flex-col gap-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <CalendarEvent
                        key={event.id}
                        event={event}
                        className="relative h-auto"
                        month
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <motion.div
                        key={`more-${day.toISOString()}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-muted-foreground text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDate(day);
                          setMode("day");
                        }}
                      >
                        +{dayEvents.length - 3} more
                      </motion.div>
                    )}
                  </div>
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
