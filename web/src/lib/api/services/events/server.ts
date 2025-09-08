import "server-only";
import { apiFetchServer } from "@/lib/api/http/server";
import type {
  ListResponseDTO,
  ItemResponseDTO,
} from "@/lib/api/contracts/common";
import type { EventDTO } from "@/lib/api/contracts/events";
import { mapEvent } from "@/lib/api/contracts/events";
import {
  mapPaginatedEvents,
  toEventsQuery,
  type ListEventsParams,
} from "./shared";

export async function listEventsServer(p?: ListEventsParams, revalidate = 60) {
  const res = await apiFetchServer<ListResponseDTO<EventDTO>>(
    `/events${toEventsQuery(p)}`,
    { next: { revalidate, tags: ["events"] } },
  );
  return mapPaginatedEvents(res);
}

export async function getEventServer(id: number, revalidate = 60) {
  const res = await apiFetchServer<ItemResponseDTO<EventDTO>>(`/events/${id}`, {
    next: { revalidate, tags: [`event:${id}`] },
  });
  return mapEvent(res.data);
}
