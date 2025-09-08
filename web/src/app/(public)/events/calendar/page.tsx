import { Suspense } from "react";
import EventsCalendarClient from "./CalendarClient";

export default function EventsCalendarPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading calendar…</div>}>
      <EventsCalendarClient />
    </Suspense>
  );
}
