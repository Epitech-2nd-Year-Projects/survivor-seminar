"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { conversationsKeys } from "./keys";
import {
  createConversationClient,
  getConversationClient,
  listConversationsClient,
  listMessagesClient,
  markMessageReadClient,
  sendMessageClient,
  type CreateConversationBody,
  type SendMessageBody,
} from "./client";
import type { ListConversationsParams, ListMessagesParams } from "./shared";

export function useConversationsList(p?: ListConversationsParams) {
  return useQuery({
    queryKey: conversationsKeys.list(p),
    queryFn: () => listConversationsClient(p),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useConversation(id: number) {
  const enabled = typeof id === "number" && id > 0;
  return useQuery({
    queryKey: enabled
      ? conversationsKeys.detail(id)
      : conversationsKeys.detail(0),
    queryFn: () => getConversationClient(id),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useConversationMessages(
  conversationId: number,
  p: Omit<ListMessagesParams, "page"> = {},
) {
  const { perPage = 20 } = p;
  const enabled = conversationId > 0;
  return useInfiniteQuery({
    queryKey: conversationsKeys.messagesInfinite(conversationId, {
      perPage,
    }),
    queryFn: ({ pageParam }) =>
      listMessagesClient(conversationId, {
        page: pageParam ?? 1,
        perPage,
      }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
    enabled,
  });
}

export function useCreateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateConversationBody) =>
      createConversationClient(body),
    onSuccess: (created) => {
      qc.invalidateQueries({
        queryKey: conversationsKeys.list(),
      }).catch(console.error);
      qc.setQueryData(conversationsKeys.detail(created.id), created);
    },
  });
}

export function useSendMessage(conversationId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SendMessageBody) =>
      sendMessageClient(conversationId, body),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: conversationsKeys.messages(conversationId),
        exact: false,
      }).catch(console.error);
      qc.invalidateQueries({
        queryKey: conversationsKeys.messagesInfinite(conversationId),
        exact: false,
      }).catch(console.error);
      qc.invalidateQueries({
        queryKey: conversationsKeys.list(),
      }).catch(console.error);
      qc.invalidateQueries({
        queryKey: conversationsKeys.detail(conversationId),
      }).catch(console.error);
    },
  });
}

export function useMarkMessageRead(conversationId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (messageId: number) =>
      markMessageReadClient(conversationId, messageId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: conversationsKeys.list(),
      }).catch(console.error);
      qc.invalidateQueries({
        queryKey: conversationsKeys.detail(conversationId),
      }).catch(console.error);
    },
  });
}
