import type { ListResponseDTO, Paginated } from "@/lib/api/contracts/common";
import {
  mapConversationWithUnreadItem,
  mapMessage,
  type ConversationWithUnread,
  type ConversationWithUnreadItemDTO,
  type Message,
  type MessageDTO,
} from "@/lib/api/contracts/conversations";

export type ConversationsSortField = "id" | "created_at" | "updated_at";

export type SortOrder = "asc" | "desc";

export type ListConversationsParams = {
  page?: number;
  perPage?: number;
  sort?: ConversationsSortField;
  order?: SortOrder;
};

export function toConversationsQuery(p?: ListConversationsParams): string {
  const qs = new URLSearchParams();
  if (p?.page) qs.set("page", String(p.page));
  if (p?.perPage) qs.set("per_page", String(p.perPage));
  if (p?.sort) qs.set("sort", p.sort);
  if (p?.order) qs.set("order", p.order);
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export type ListMessagesParams = {
  page?: number;
  perPage?: number;
};

export function toMessagesQuery(p?: ListMessagesParams): string {
  const qs = new URLSearchParams();
  if (p?.page) qs.set("page", String(p.page));
  if (p?.perPage) qs.set("per_page", String(p.perPage));
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export function mapPaginatedConversationsWithUnread(
  dto: ListResponseDTO<ConversationWithUnreadItemDTO>,
): Paginated<ConversationWithUnread> {
  return {
    data: dto.data.map(mapConversationWithUnreadItem),
    page: dto.pagination.page,
    perPage: dto.pagination.per_page,
    total: dto.pagination.total,
    hasNext: dto.pagination.has_next,
    hasPrev: dto.pagination.has_prev,
  };
}

export function mapPaginatedMessages(
  dto: ListResponseDTO<MessageDTO>,
): Paginated<Message> {
  return {
    data: dto.data.map(mapMessage),
    page: dto.pagination.page,
    perPage: dto.pagination.per_page,
    total: dto.pagination.total,
    hasNext: dto.pagination.has_next,
    hasPrev: dto.pagination.has_prev,
  };
}
