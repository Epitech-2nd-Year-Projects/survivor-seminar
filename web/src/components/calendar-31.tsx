"use client";

import * as React from "react";
import { formatDateRange } from "little-date";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Event } from "@/lib/api/contracts/events";

type CalendarProps = {
  events: Event[];
};

export default function Calendar31({ events }: CalendarProps) {
  const now = new Date();
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
  );

  return (
    <Card className="py-4">
      <CardContent className="px-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="bg-transparent p-0"
          required
        />
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3 border-t px-4 pt-4 pb-0">
        <div className="flex w-full items-center justify-between px-1">
          <div className="text-sm font-medium">
            {date?.toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
        <div className="flex w-full flex-col gap-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-muted after:bg-primary/70 relative rounded-md p-2 pl-6 text-sm after:absolute after:inset-y-2 after:left-2 after:w-1 after:rounded-full"
            >
              <div className="font-medium">{event.name}</div>
              <div className="text-muted-foreground text-xs">
                {event.startDate && event.endDate ? (
                  <span>{formatDateRange(event.startDate, event.endDate)}</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
