"use client";

import Calendar31 from "@/components/calendar-31";
import { fetchEvents } from "@/lib/fetchers";
import type { Event } from "@/types";
import { useState, useEffect } from "react";

export default function EventsCalendar() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  useEffect(() => {
    async function load() {
      const all = await fetchEvents();
      const now = new Date();
      const oneWeekFromNow = new Date(now);
      oneWeekFromNow.setDate(now.getDate() + 7);

      const filtered = all.filter((e) => {
        if (!e.start_date) return false;
        const start = new Date(e.start_date);
        return start >= now && start <= oneWeekFromNow;
      });

      setUpcomingEvents(filtered);
    }
    load().catch((err) => {
      console.error(err);
    });
  }, []);

  return (
    <div className="h-full w-full">
      <Calendar31 events={upcomingEvents} />
    </div>
  );
}
