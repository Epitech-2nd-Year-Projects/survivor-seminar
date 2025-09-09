import type { ListResponseDTO, Paginated } from "@/lib/api/contracts/common";
import { mapEvent } from "@/lib/api/contracts/events";
import type { EventDTO, Event as EventModel } from "@/lib/api/contracts/events";

export type EventsSortField =
  | "id"
  | "name"
  | "event_type"
  | "start_date"
  | "end_date"
  | "created_at"
  | "updated_at";

export type SortOrder = "asc" | "desc";

export type ListEventsParams = {
  page?: number;
  perPage?: number;
  sort?: EventsSortField;
  order?: SortOrder;
};

export function toEventsQuery(p?: ListEventsParams): string {
  const qs = new URLSearchParams();
  if (p?.page) qs.set("page", String(p.page));
  if (p?.perPage) qs.set("per_page", String(p.perPage));
  if (p?.sort) qs.set("sort", p.sort);
  if (p?.order) qs.set("order", p.order);
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export function mapPaginatedEvents(
  dto: ListResponseDTO<EventDTO>,
): Paginated<EventModel> {
  return {
    data: dto.data.map(mapEvent),
    page: dto.pagination.page,
    perPage: dto.pagination.per_page,
    total: dto.pagination.total,
    hasNext: dto.pagination.has_next,
    hasPrev: dto.pagination.has_prev,
  };
}
