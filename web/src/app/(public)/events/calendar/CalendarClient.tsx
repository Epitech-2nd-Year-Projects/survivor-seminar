"use client";

import Calendar from "@/components/calendar/calendar";
import type { Event } from "@/lib/api/contracts/events";
import { userMessageFromError } from "@/lib/api/http/messages";
import { useEventsList } from "@/lib/api/services/events/hooks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { CalendarEvent, Mode } from "@/components/calendar/calendar-types";

function useUrlState() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const get = (k: string) => sp.get(k) ?? undefined;
  const set = (next: Record<string, string | undefined>) => {
    const n = new URLSearchParams(Array.from(sp.entries()));
    for (const [k, v] of Object.entries(next)) {
      if (!v) n.delete(k);
      else n.set(k, v);
    }
    router.replace(`${pathname}?${n.toString()}`);
  };

  return {
    page: Number(get("page") ?? "1"),
    perPage: Number(get("per_page") ?? "20"),
    set,
  };
}

export default function EventsCalendarClient() {
  // Fetch a large page to populate calendar
  const { data, isError, error } = useEventsList({ page: 1, perPage: 200 });
  const listEvents = data?.data ?? [];

  // Local calendar UI state
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [mode, setMode] = useState<Mode>("month");
  const [date, setDate] = useState<Date>(new Date());

  // Map API Event -> CalendarEvent
  const mapToCalendarEvents = useMemo(() => {
    const colorFromType = (ev: Event) => {
      const t = ev.eventType?.toLowerCase();
      if (!t) return "blue";
      if (t.includes("info")) return "indigo";
      if (t.includes("sport")) return "emerald";
      if (t.includes("music")) return "pink";
      if (t.includes("urgent")) return "red";
      return "blue";
    };
    return (listEvents as Event[])
      .filter((e) => e.startDate && e.endDate)
      .map<CalendarEvent>((e) => ({
        id: e.id,
        title: e.name,
        start: e.startDate as Date,
        end: e.endDate as Date,
        color: colorFromType(e),
      }));
  }, [listEvents]);

  // Sync local state with server data, but only when content changes
  useEffect(() => {
    const next = mapToCalendarEvents;
    setEvents((prev) => {
      if (prev.length === next.length) {
        let same = true;
        for (let i = 0; i < prev.length; i++) {
          const a = prev[i]!;
          const b = next[i]!;
          if (
            !b ||
            a.id !== b.id ||
            a.title !== b.title ||
            a.color !== b.color ||
            a.start.getTime() !== b.start.getTime() ||
            a.end.getTime() !== b.end.getTime()
          ) {
            same = false;
            break;
          }
        }
        if (same) return prev;
      }
      return next;
    });
  }, [mapToCalendarEvents]);

  if (isError) {
    console.log(error);
    return <div>Error: {userMessageFromError(error)}</div>;
  }

  return (
    <div className="h-full w-full">
      <Calendar
        events={events}
        setEvents={setEvents}
        mode={mode}
        setMode={setMode}
        date={date}
        setDate={setDate}
      />
    </div>
  );
}
