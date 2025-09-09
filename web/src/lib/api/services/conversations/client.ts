import { apiFetchClient } from "@/lib/api/http/client";
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

export type CreateConversationBody = {
  participant_ids: number[];
  title?: string | null;
  is_group?: boolean;
};

export type SendMessageBody = {
  content: string;
};

export type MarkReadBody = {
  message_id: number;
};

export async function listConversationsClient(p?: ListConversationsParams) {
  const res = await apiFetchClient<
    ListResponseDTO<ConversationWithUnreadItemDTO>
  >(`/conversations${toConversationsQuery(p)}`);
  return mapPaginatedConversationsWithUnread(res);
}

export async function getConversationClient(id: number) {
  const res = await apiFetchClient<ItemResponseDTO<ConversationDTO>>(
    `/conversations/${id}`,
  );
  return mapConversationItem(res.data);
}

export async function createConversationClient(body: CreateConversationBody) {
  const res = await apiFetchClient<ItemResponseDTO<ConversationDTO>>(
    `/conversations`,
    { method: "POST", body },
  );
  return mapConversationItem(res.data);
}

export async function listMessagesClient(
  conversationId: number,
  p?: ListMessagesParams,
) {
  const res = await apiFetchClient<ListResponseDTO<MessageDTO>>(
    `/conversations/${conversationId}/messages${toMessagesQuery(p)}`,
  );
  return mapPaginatedMessages(res);
}

export async function sendMessageClient(
  conversationId: number,
  body: SendMessageBody,
) {
  const res = await apiFetchClient<ItemResponseDTO<MessageDTO>>(
    `/conversations/${conversationId}/messages`,
    { method: "POST", body },
  );
  return res.data;
}

export async function markMessageReadClient(
  conversationId: number,
  messageId: number,
) {
  await apiFetchClient<void>(`/conversations/${conversationId}/mark-read`, {
    method: "POST",
    body: { message_id: messageId } as MarkReadBody,
  });
}
