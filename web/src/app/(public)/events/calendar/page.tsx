"use client";

import Calendar31 from "@/components/calendar-31";
import type { Event } from "@/lib/api/contracts/events";
import { userMessageFromError } from "@/lib/api/http/messages";
import { useEventsList } from "@/lib/api/services/events/hooks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

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

export default function EventsCalendar() {
  const { page, perPage } = useUrlState();

  const { data, isError, error } = useEventsList({
    page,
    perPage,
  });

  const listEvents = data?.data ?? [];

  const upcomingEvents = useMemo(() => {
    const now = Date.now();
    const oneWeekAhead = now + 7 * 24 * 60 * 60 * 1000;

    return listEvents.filter((e: Event) => {
      if (!e.startDate) return false;
      const t = new Date(e.startDate).getTime();
      return t >= now && t <= oneWeekAhead;
    });
  }, [listEvents]);

  if (isError) {
    console.log(error);
    return <div>Error: {userMessageFromError(error)}</div>;
  }

  return (
    <div className="h-full w-full">
      <Calendar31 events={upcomingEvents} />
    </div>
  );
}
