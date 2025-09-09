import type { ListConversationsParams, ListMessagesParams } from "./shared";

export const conversationsKeys = {
  all: ["conversations"] as const,
  list: (p?: ListConversationsParams) =>
    [...conversationsKeys.all, "list", p] as const,
  details: () => [...conversationsKeys.all, "details"] as const,
  detail: (id: number) => [...conversationsKeys.all, { id }] as const,
  messages: (conversationId: number, p?: ListMessagesParams) =>
    [...conversationsKeys.all, { conversationId }, "messages", p] as const,
  messagesInfinite: (
    conversationId: number,
    p?: Omit<ListMessagesParams, "page">,
  ) =>
    [
      ...conversationsKeys.all,
      { conversationId },
      "messages",
      "infinite",
      p,
    ] as const,
};
