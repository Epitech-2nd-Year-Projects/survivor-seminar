import "server-only";
import { apiFetchServer } from "@/lib/api/http/server";
import type {
  ListResponseDTO,
  ItemResponseDTO,
} from "@/lib/api/contracts/common";
import {
  mapPaginatedConversationsWithUnread,
  mapPaginatedMessages,
  toConversationsQuery,
  toMessagesQuery,
  type ListConversationsParams,
  type ListMessagesParams,
} from "./shared";
import {
  mapConversationItem,
  type ConversationDTO,
  type ConversationWithUnreadItemDTO,
  type MessageDTO,
} from "@/lib/api/contracts/conversations";

export async function listConversationsServer(
  p?: ListConversationsParams,
  revalidate = 60,
) {
  const res = await apiFetchServer<
    ListResponseDTO<ConversationWithUnreadItemDTO>
  >(`/conversations${toConversationsQuery(p)}`, {
    next: { revalidate, tags: ["conversations"] },
  });
  return mapPaginatedConversationsWithUnread(res);
}

export async function getConversationServer(id: number, revalidate = 60) {
  const res = await apiFetchServer<ItemResponseDTO<ConversationDTO>>(
    `/conversations/${id}`,
    { next: { revalidate, tags: [`conversation:${id}`] } },
  );
  return mapConversationItem(res.data);
}

export async function listMessagesServer(
  conversationId: number,
  p?: ListMessagesParams,
  revalidate = 30,
) {
  const res = await apiFetchServer<ListResponseDTO<MessageDTO>>(
    `/conversations/${conversationId}/messages${toMessagesQuery(p)}`,
    {
      next: {
        revalidate,
        tags: [`conversation:${conversationId}:messages`],
      },
    },
  );
  return mapPaginatedMessages(res);
}
