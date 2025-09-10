"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { userMessageFromError } from "@/lib/api/http/messages";
import {
  useConversation,
  useConversationMessages,
  useMarkMessageRead,
  useSendMessage,
} from "@/lib/api/services/conversations/hooks";
import { useUserMe } from "@/lib/api/services/users/hooks";
import type { Message } from "@/lib/api/contracts/conversations";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function ConversationPage({ params }: PageProps) {
  const { id: conversationSlug } = use(params);
  const conversationId = Number(conversationSlug);
  const {
    data: conversation,
    isLoading: isLoadingConversation,
    isError: isErrorConversation,
    error: errorConversation,
  } = useConversation(conversationId);

  const {
    data: messagesPages,
    isLoading: isLoadingMessages,
    isError: isErrorMessages,
    error: errorMessages,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useConversationMessages(conversationId, { perPage: 30 });

  const { data: me } = useUserMe();

  const { mutateAsync: sendMessage, isPending: isSending } =
    useSendMessage(conversationId);
  const { mutate: markRead } = useMarkMessageRead(conversationId);

  const [content, setContent] = useState("");

  const flatMessages = useMemo(
    () => messagesPages?.pages.flatMap((p) => p.data) ?? [],
    [messagesPages],
  );

  const endRef = useRef<HTMLDivElement>(null);
  const lastMarkedRef = useRef<number | null>(null);

  const title = useMemo(() => {
    if (conversation?.title) return conversation.title;
    if (!conversation) return "Conversation";

    const parts = conversation.participants ?? [];
    if (!conversation.isGroup) {
      const other = me ? parts.find((p) => p.userId !== me.id) : parts[0];
      return (
        other?.user?.name ?? other?.user?.email ?? `User ${other?.userId ?? ""}`
      );
    }

    const names = parts
      .map((p) => p.user?.name ?? p.user?.email)
      .filter(Boolean) as string[];
    return names.length ? names.join(", ") : "Group conversation";
  }, [conversation, me]);

  async function handleSend() {
    const text = content.trim();
    if (!text) return;
    await sendMessage({ content: text });
    setContent("");
    setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  useEffect(() => {
    const last = flatMessages[flatMessages.length - 1];
    if (last && last.id !== lastMarkedRef.current) {
      lastMarkedRef.current = last.id;
      markRead(last.id);
    }
  }, [flatMessages, markRead]);

  useEffect(() => {
    if (!isLoadingMessages) {
      endRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [isLoadingMessages, conversationId]);

  if (isErrorConversation) {
    return (
      <div className="p-4">
        Error: {userMessageFromError(errorConversation)}
      </div>
    );
  }
  if (isErrorMessages) {
    return (
      <div className="p-4">Error: {userMessageFromError(errorMessages)}</div>
    );
  }

  const showLoading =
    (isLoadingConversation && !conversation) ||
    (isLoadingMessages && !messagesPages);

  return (
    <div className="flex h-full flex-1 flex-col p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{title ?? "Conversation"}</h1>
          <p className="text-muted-foreground text-sm">
            {conversation?.isGroup ? "Group" : "Direct message"}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/conversations">Back to conversations</Link>
        </Button>
      </div>

      <Card className="flex h-[calc(100vh-200px)] flex-1 flex-col">
        <CardHeader className="py-3">
          <CardTitle className="text-base">{title ?? "Conversation"}</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="flex min-h-0 flex-1 flex-col p-0">
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {hasNextPage && (
              <div className="mb-4 flex justify-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? "Loading..." : "Load older messages"}
                </Button>
              </div>
            )}

            {showLoading && (
              <div className="text-muted-foreground py-8 text-center text-sm">
                Loading messages...
              </div>
            )}

            {!showLoading && flatMessages.length === 0 && (
              <div className="text-muted-foreground py-8 text-center text-sm">
                No messages yet. Start the conversation!
              </div>
            )}

            {flatMessages.map((m) => (
              <MessageRow
                key={m.id}
                message={m}
                isOwn={m.senderId === me?.id}
                isGroup={Boolean(conversation?.isGroup)}
              />
            ))}

            <div ref={endRef} />
          </div>

          <Separator />

          <div className="flex items-end gap-2 p-4">
            <Textarea
              placeholder="Type a message..."
              rows={2}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!isSending) handleSend().catch(console.error);
                }
              }}
            />
            <Button
              onClick={handleSend}
              disabled={isSending || !content.trim()}
            >
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MessageRow({
  message,
  isOwn,
  isGroup,
}: {
  message: Message;
  isOwn: boolean;
  isGroup: boolean;
}) {
  const senderName =
    message.sender?.name ?? message.sender?.email ?? `User ${message.senderId}`;

  const initials = getInitials(senderName);

  return (
    <div className={cn("mb-4 flex w-full gap-2", isOwn && "justify-end")}>
      {!isOwn && (
        <Avatar className="h-8 w-8 self-end">
          <AvatarImage src={message.sender?.imageUrl ?? ""} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "max-w-[75%] rounded-lg px-3 py-2",
          isOwn
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground",
        )}
      >
        {isGroup && !isOwn && (
          <div className="mb-1 text-xs font-medium opacity-80">
            {senderName}
          </div>
        )}
        <div className="break-words whitespace-pre-wrap">{message.content}</div>
        <div
          className={cn(
            "mt-1 text-right text-[10px] opacity-70",
            isOwn ? "text-primary-foreground" : "text-muted-foreground",
          )}
        >
          {formatTime(message.createdAt)}
        </div>
      </div>

      {isOwn && (
        <Avatar className="h-8 w-8 self-end">
          <AvatarImage src={message.sender?.imageUrl ?? ""} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts[1]?.[0] ?? "";
  return (first + last).toUpperCase() ?? "U";
}

function formatTime(d: Date) {
  try {
    return new Date(d).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}
