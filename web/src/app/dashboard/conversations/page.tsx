"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  useConversationsList,
  useCreateConversation,
} from "@/lib/api/services/conversations/hooks";
import { useInfiniteUsers, useUserMe } from "@/lib/api/services/users/hooks";
import type {
  Conversation,
  ConversationWithUnread,
} from "@/lib/api/contracts/conversations";
import { UserRole, type User } from "@/lib/api/contracts/users";
import type { CreateConversationBody } from "@/lib/api/services/conversations/client";
import { userMessageFromError } from "@/lib/api/http/messages";
import { Loader2, MessageSquare, Plus, Users } from "lucide-react";

export default function ConversationsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const perPage = 20;

  const { data, isLoading, isError, error, isFetching } = useConversationsList({
    page,
    perPage,
    sort: "updated_at",
    order: "desc",
  });

  const items = data?.data ?? [];
  const hasNext = data?.hasNext ?? false;
  const hasPrev = data?.hasPrev ?? false;

  if (isError) {
    return <div className="p-4">Error: {userMessageFromError(error)}</div>;
  }

  return (
    <div className="flex h-full flex-1 flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Conversations</h1>
          <p className="text-muted-foreground text-sm">
            Browse your conversations and start a new one.
          </p>
        </div>
        <CreateConversationButton
          onCreated={(id) => router.push(`/dashboard/conversations/${id}`)}
        />
      </div>

      <Card className="flex flex-1 flex-col">
        <CardHeader className="py-3">
          <CardTitle className="text-base">All conversations</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="flex min-h-0 flex-1 flex-col p-0">
          {isLoading && !data ? (
            <div className="flex flex-1 items-center justify-center p-8">
              <div className="text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading conversations...
              </div>
            </div>
          ) : items.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="divide-y">
              {items.map((item) => (
                <ConversationRow
                  key={item.data.id}
                  item={item}
                  onClick={() =>
                    router.push(`/dashboard/conversations/${item.data.id}`)
                  }
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between p-3">
            <div className="text-muted-foreground text-sm">
              Page {page}
              {isFetching && (
                <span className="ml-2 inline-flex items-center gap-1">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Updating...
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!hasPrev || page === 1 || isFetching}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNext || isFetching}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ConversationRow({
  item,
  onClick,
}: {
  item: ConversationWithUnread;
  onClick: () => void;
}) {
  const { data: me } = useUserMe();
  const c = item.data;

  const title = useMemo(() => deriveConversationTitle(c, me?.id), [c, me?.id]);

  const lastMessage = c.lastMessage?.content ?? "No messages yet";
  const time = formatTime(c.updatedAt ?? c.createdAt);

  const participants = (c.participants ?? []).filter(
    (p) => p.userId !== me?.id,
  );

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-left",
        "hover:bg-muted/50 focus:bg-muted/70 focus:outline-none",
      )}
    >
      <div className="relative flex w-10 shrink-0">
        <AvatarStack participants={participants.slice(0, 3)} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="truncate font-medium">{title}</div>
          {item.unreadCount > 0 && (
            <Badge variant="secondary">{item.unreadCount}</Badge>
          )}
          <div className="text-muted-foreground ml-auto text-xs">{time}</div>
        </div>
        <div className="text-muted-foreground truncate text-sm">
          {lastMessage}
        </div>
      </div>
    </button>
  );
}

function AvatarStack({
  participants,
}: {
  participants: NonNullable<Conversation["participants"]>[number][];
}) {
  const a = participants[0]?.user;
  const b = participants[1]?.user;
  const c = participants[2]?.user;

  return (
    <div className="relative h-10 w-10">
      <SmallAvatar user={a} className="absolute top-0 left-0 z-30 h-6 w-6" />
      <SmallAvatar user={b} className="absolute top-1.5 right-0 z-20 h-6 w-6" />
      <SmallAvatar user={c} className="absolute bottom-0 left-2 z-10 h-6 w-6" />
    </div>
  );
}

function SmallAvatar({
  user,
  className,
}: {
  user?: User | null;
  className?: string;
}) {
  const name = getUserLabel(user);
  return (
    <Avatar className={cn("h-8 w-8", className)}>
      <AvatarImage src={user?.imageUrl ?? ""} />
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
      <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
        <MessageSquare className="text-muted-foreground h-6 w-6" />
      </div>
      <div className="text-lg font-medium">You have no conversations yet</div>
      <div className="text-muted-foreground max-w-md text-sm">
        Start a new direct message or group conversation with your teammates.
      </div>
      <CreateConversationButton />
    </div>
  );
}

function CreateConversationButton({
  onCreated,
}: {
  onCreated?: (id: number) => void;
}) {
  const router = useRouter();
  const { data: me } = useUserMe();
  const {
    data: usersPages,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteUsers({ perPage: 20 });

  const allUsers = usersPages?.pages.flatMap((p) => p.data) ?? [];

  const users =
    me?.id != null
      ? allUsers.filter((u) => u.id !== me.id && u.role === UserRole.Investor)
      : allUsers;

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [title, setTitle] = useState("");

  const { mutateAsync: createConversation, isPending } =
    useCreateConversation();

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.name, u.email].filter(Boolean).join(" ").toLowerCase().includes(q),
    );
  }, [filter, users]);

  async function handleSubmit() {
    if (selected.length === 0) return;

    const body: CreateConversationBody = {
      title: title.trim() ?? null,
      participant_ids: selected,
      is_group: selected.length > 1,
    } as CreateConversationBody;

    const created = await createConversation(body);
    setOpen(false);
    setSelected([]);
    setTitle("");
    setFilter("");
    onCreated?.(created.id);
    if (!onCreated) router.push(`/dashboard/conversations/${created.id}`);
  }

  function toggle(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New conversation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Start a conversation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              placeholder="e.g. Design sync"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <p className="text-muted-foreground text-xs">
              Leave empty for direct messages. Add multiple people for a group
              chat.
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Select participants</Label>
            <Input
              placeholder="Filter by name or email"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <div className="rounded-md border">
              <ScrollArea className="h-64">
                <div className="divide-y">
                  {filtered.map((u) => (
                    <div
                      key={u.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => toggle(u.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggle(u.id);
                        }
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2 text-left",
                        "hover:bg-muted/50",
                      )}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={u.imageUrl! ?? ""} />
                        <AvatarFallback>
                          {getInitials(getUserLabel(u))}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">
                          {getUserLabel(u)}
                        </div>
                        <div className="text-muted-foreground truncate text-xs">
                          {u.email}
                        </div>
                      </div>
                      <Checkbox
                        checked={selected.includes(u.id)}
                        onCheckedChange={() => toggle(u.id)}
                        className="pointer-events-none"
                      />
                    </div>
                  ))}
                  {filtered.length === 0 && (
                    <div className="text-muted-foreground p-4 text-center text-sm">
                      No users found
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
            {hasNextPage && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? "Loading..." : "Load more users"}
              </Button>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || selected.length === 0}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Create
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function deriveConversationTitle(c: Conversation, meId?: number): string {
  if (c.title) return c.title;
  const parts = c.participants ?? [];
  if (!c.isGroup) {
    const other = meId ? parts.find((p) => p.userId !== meId) : parts[0];
    return (
      other?.user?.name ?? other?.user?.email ?? `User ${other?.userId ?? ""}`
    );
  }
  const names = parts
    .filter((p) => p.userId !== meId)
    .map((p) => p.user?.name ?? p.user?.email)
    .filter(Boolean) as string[];
  return names.length ? names.join(", ") : "Group conversation";
}

function getUserLabel(u?: User | null): string {
  return u?.name ?? u?.email ?? (u ? `User ${u.id}` : "User");
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts[1]?.[0] ?? "";
  return (first + last).toUpperCase() ?? "U";
}

function formatTime(d: Date) {
  try {
    const date = new Date(d);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString();
  } catch {
    return "";
  }
}
