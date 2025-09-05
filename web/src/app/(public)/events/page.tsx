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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchEvents } from "@/lib/fetchers";
import { capitalize } from "@/lib/utils";
import type { Event } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { ListRestartIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function Projects() {
  const router = useRouter();

  const {
    data: events = [],
    isLoading,
    isError,
    error,
  } = useQuery<Event[], Error>({
    queryKey: ["events"],
    queryFn: fetchEvents,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const [selectedEventType, setSelectedEventType] = useState<
    string | undefined
  >(undefined);
  const [selectedTargetAudience, setSelectedTargetAudience] = useState<
    string | undefined
  >(undefined);
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>(
    undefined,
  );

  const eventTypeOptions = useMemo(() => {
    return Array.from(
      new Set(
        events.map((e) => e.event_type).filter((m): m is string => m != null),
      ),
    ).sort();
  }, [events]);

  const targetAudienceOptions = useMemo(() => {
    return Array.from(
      new Set(
        events
          .map((e) => e.target_audience)
          .filter((m): m is string => m != null),
      ),
    ).sort();
  }, [events]);

  const locationOptions = useMemo(
    () =>
      Array.from(
        new Set(
          events
            .map((e) => e.location?.split(",").pop()?.trim())
            .filter((c): c is string => !!c),
        ),
      ).sort(),
    [events],
  );

  const visibleEvents = useMemo(
    () =>
      events.filter((e) => {
        const city = e.location?.split(",").pop()?.trim();
        return (
          (!selectedEventType || e.event_type === selectedEventType) &&
          (!selectedTargetAudience ||
            e.target_audience === selectedTargetAudience) &&
          (!selectedLocation || city === selectedLocation)
        );
      }),
    [events, selectedEventType, selectedTargetAudience, selectedLocation],
  );

  const resetFilters = () => {
    setSelectedEventType(undefined);
    setSelectedTargetAudience(undefined);
    setSelectedLocation(undefined);
  };

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Select
          disabled={isLoading}
          value={selectedEventType ?? ""}
          onValueChange={setSelectedEventType}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a event type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Event type</SelectLabel>
              {eventTypeOptions.map((m) => (
                <SelectItem key={m} value={m}>
                  {capitalize(m)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          disabled={isLoading}
          value={selectedTargetAudience ?? ""}
          onValueChange={setSelectedTargetAudience}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a target audience" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Target audience</SelectLabel>
              {targetAudienceOptions.map((m) => (
                <SelectItem key={m} value={m}>
                  {capitalize(m)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          disabled={isLoading}
          value={selectedLocation ?? ""}
          onValueChange={setSelectedLocation}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a city" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>City</SelectLabel>
              {locationOptions.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          disabled={isLoading}
          variant="secondary"
          size="icon"
          className="size-8"
          onClick={resetFilters}
        >
          <ListRestartIcon />
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => (
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
          : visibleEvents.map((event) => (
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
    </div>
  );
}
