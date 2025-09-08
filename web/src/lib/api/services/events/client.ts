import { apiFetchClient } from "@/lib/api/http/client";
import type {
  ListResponseDTO,
  ItemResponseDTO,
} from "@/lib/api/contracts/common";
import { mapEvent, type EventDTO } from "@/lib/api/contracts/events";
import {
  mapPaginatedEvents,
  toEventsQuery,
  type ListEventsParams,
} from "./shared";

export type CreateEventBody = {
  name: string;
  description?: string;
  event_type?: string;
  location?: string;
  target_audience?: string;
  start_date?: string;
  end_date?: string;
  capacity?: number;
  image_url?: string;
};

export type UpdateEventBody = Partial<CreateEventBody>;

export async function listEventsClient(p?: ListEventsParams) {
  const res = await apiFetchClient<ListResponseDTO<EventDTO>>(
    `/events${toEventsQuery(p)}`,
  );
  return mapPaginatedEvents(res);
}

export async function getEventClient(id: number) {
  const res = await apiFetchClient<ItemResponseDTO<EventDTO>>(`/events/${id}`);
  return mapEvent(res.data);
}

export async function createEventClient(body: CreateEventBody) {
  const res = await apiFetchClient<ItemResponseDTO<EventDTO>>(`/admin/events`, {
    method: "POST",
    body,
  });
  return mapEvent(res.data);
}

export async function updateEventClient(id: number, body: UpdateEventBody) {
  const res = await apiFetchClient<ItemResponseDTO<EventDTO>>(
    `/admin/events/${id}`,
    { method: "PATCH", body },
  );
  return mapEvent(res.data);
}

export async function deleteEventClient(id: number) {
  await apiFetchClient<void>(`/admin/events/${id}`, { method: "DELETE" });
}
