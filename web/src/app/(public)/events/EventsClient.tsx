"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { userMessageFromError } from "@/lib/api/http/messages";
import { useEventsList } from "@/lib/api/services/events/hooks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
    // eventType: get('event_type'),
    set,
  };
}

export default function EventsClient() {
  const router = useRouter();
  const { page, perPage, /* eventType,*/ set } = useUrlState();

  const { data, isLoading, isError, error } = useEventsList({
    page,
    perPage,
    // eventType,
  });

  const listEvents = data?.data ?? [];

  // TODO: Add filters once API is ready for it

  /*const eventTypeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          events
            .map((e) => e.eventType)
            .filter((m): m is string => !!m && m.length > 0),
        ),
      ).sort(),
    [events],
  );

  const reset = () => set({ event_type: undefined, page: '1' });*/

  if (isError) {
    console.log(error);
    return <div>Error: {userMessageFromError(error)}</div>;
  }

  const showSkeletons = isLoading && !data;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {showSkeletons
          ? Array.from({ length: perPage }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle>
                    <Skeleton className="h-5 w-3/4" />
                  </CardTitle>
                  <CardDescription>
                    <Skeleton className="h-4 w-1/2" />
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-5/6" />
                </CardContent>
              </Card>
            ))
          : listEvents.map((event) => (
              <Card
                key={event.id}
                className="focus:ring-primary transform cursor-pointer transition duration-200 ease-out hover:scale-105 hover:shadow-lg focus:scale-105 focus:ring-2 focus:outline-none"
                onClick={() => router.push(`/events/${event.id}`)}
              >
                <CardHeader>
                  <CardTitle>{event.name}</CardTitle>
                  <CardDescription className="flex gap-1">
                    {
                      <Badge variant="secondary">
                        {event.location ?? "No address provided"}
                      </Badge>
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {event.description ?? "No description provided."}
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          disabled={isLoading || !data?.hasPrev}
          onClick={() =>
            set({ page: String(Math.max(1, (data?.page ?? 1) - 1)) })
          }
        >
          Prev
        </Button>
        <span>
          Page {data?.page ?? page} of{" "}
          {data ? Math.max(1, Math.ceil(data.total / data.perPage)) : "—"}
        </span>
        <Button
          variant="outline"
          disabled={isLoading || !data?.hasNext}
          onClick={() => set({ page: String((data?.page ?? 1) + 1) })}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
