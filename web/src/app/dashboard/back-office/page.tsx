"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { Startup } from "@/lib/api/contracts/startups";
import type { User } from "@/lib/api/contracts/users";
import type { Event } from "@/lib/api/contracts/events";
import type { News } from "@/lib/api/contracts/news";

import ProjectsTable from "@/components/tables/projectTable";
import UsersTable from "@/components/tables/usersTable";
import EventsTable from "@/components/tables/eventsTable";
import NewsTable from "@/components/tables/newsTable";

import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";

import { useUsersList } from "@/lib/api/services/users/hooks";
import { useStartupsList } from "@/lib/api/services/startups/hooks";
import { useEventsList } from "@/lib/api/services/events/hooks";
import { useNewsList } from "@/lib/api/services/news/hooks";

import TableSkeletonWide from "@/components/tablesSkeletonWide";
import EditDialogUser from "@/components/editDialogUser";
import EditDialogStartup from "@/components/editDialogStartup";
import EditDialogEvent from "@/components/editDialogEvent";
import EditDialogNews from "@/components/editDialogNews";

import { useUpdateUser, useDeleteUser } from "@/lib/api/services/users/hooks";
import {
  useUpdateStartup,
  useDeleteStartup,
} from "@/lib/api/services/startups/hooks";
import {
  useUpdateEvent,
  useDeleteEvent,
} from "@/lib/api/services/events/hooks";
import { useUpdateNews, useDeleteNews } from "@/lib/api/services/news/hooks";

import { CheckCircle2 } from "lucide-react";

const ENTITIES = ["Users", "Startups", "Events", "News"] as const;
type Entity = (typeof ENTITIES)[number];
const isEntity = (v: string): v is Entity =>
  (ENTITIES as readonly string[]).includes(v);

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return typeof err === "string" ? err : JSON.stringify(err);
  } catch {
    return String(err);
  }
}

function tryRefetch(refetch: unknown): void {
  if (typeof refetch === "function") {
    void (refetch as () => Promise<unknown>)();
  }
}

function SuccessOverlay(props: { open: boolean; message: string | null }) {
  const { open, message } = props;
  if (!open || !message) return null;

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center">
        <div
          className="flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-white shadow-lg"
          style={{ animation: "popIn 220ms ease-out" }}
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          <span className="text-sm font-medium">{message}</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes popIn {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          60% {
            transform: scale(1.03);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

export default function BackOfficePage() {
  const [entity, setEntity] = useState<Entity>("Startups");
  const router = useRouter();

  const startupsQ = useStartupsList(undefined, { redirectOn401: true });
  const usersQ = useUsersList(undefined, { redirectOn401: true });
  const eventsQ = useEventsList(undefined);
  const newsQ = useNewsList(undefined);

  const [editOpen, setEditOpen] = useState(false);
  const [editingType, setEditingType] = useState<
    "startup" | "user" | "event" | "news" | null
  >(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingStartup, setEditingStartup] = useState<Startup | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingNews, setEditingNews] = useState<News | null>(null);

  const {
    mutateAsync: deleteUserAsync,
    isError: isDeleteUserError,
    error: deleteUserErrObj,
  } = useDeleteUser();

  const {
    mutateAsync: deleteStartupAsync,
    isError: isDeleteStartupError,
    error: deleteStartupErrObj,
  } = useDeleteStartup();

  const {
    mutateAsync: deleteEventAsync,
    isError: isDeleteEventError,
    error: deleteEventErrObj,
  } = useDeleteEvent();

  const {
    mutateAsync: deleteNewsAsync,
    isError: isDeleteNewsError,
    error: deleteNewsErrObj,
  } = useDeleteNews();

  const {
    mutateAsync: updateUserAsync,
    isError: isUpdateUserError,
    error: updateUserErrObj,
  } = useUpdateUser(editingUser?.id ?? 0);

  const {
    mutateAsync: updateStartupAsync,
    isError: isUpdateStartupError,
    error: updateStartupErrObj,
  } = useUpdateStartup(editingStartup?.id ?? 0);

  const {
    mutateAsync: updateEventAsync,
    isError: isUpdateEventError,
    error: updateEventErrObj,
  } = useUpdateEvent(editingEvent?.id ?? 0);

  const {
    mutateAsync: updateNewsAsync,
    isError: isUpdateNewsError,
    error: updateNewsErrObj,
  } = useUpdateNews(editingNews?.id ?? 0);

  const listStartups: Startup[] = startupsQ.data?.data ?? [];
  const listUsers: User[] = usersQ.data?.data ?? [];
  const listEvents: Event[] = eventsQ.data?.data ?? [];
  const listNews: News[] = newsQ.data?.data ?? [];

  const [successOpen, setSuccessOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setSuccessOpen(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSuccessOpen(false), 1100);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleEditStartup = (startup: Startup) => {
    setEditingType("startup");
    setEditingStartup(startup);
    setEditOpen(true);
  };
  const handleEditUser = (user: User) => {
    setEditingType("user");
    setEditingUser(user);
    setEditOpen(true);
  };
  const handleEditEvent = (ev: Event) => {
    setEditingType("event");
    setEditingEvent(ev);
    setEditOpen(true);
  };
  const handleEditNews = (n: News) => {
    setEditingType("news");
    setEditingNews(n);
    setEditOpen(true);
  };

  const closeEditors = () => {
    setEditOpen(false);
    setEditingStartup(null);
    setEditingUser(null);
    setEditingEvent(null);
    setEditingNews(null);
    setEditingType(null);
  };

  return (
    <main className="max-w-7xl space-y-4 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-64">
          <Select
            value={entity}
            onValueChange={(v) => {
              if (isEntity(v)) setEntity(v);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select element to edit" />
            </SelectTrigger>
            <SelectContent>
              {ENTITIES.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {entity === "Startups" && (
        <>
          {startupsQ.isLoading && (
            <TableSkeletonWide
              title="Startups"
              subtitle="Loading startups…"
              rows={12}
            />
          )}
          {startupsQ.isError && (
            <div className="text-destructive text-sm break-all">
              Error: {getErrorMessage(startupsQ.error)}
            </div>
          )}
          {listStartups && (
            <ProjectsTable
              projects={listStartups}
              onCreate={() => router.push("/projects/new")}
              onView={(s) => router.push(`/projects/${s.id}`)}
              onEdit={handleEditStartup}
              onDelete={async (s) => {
                try {
                  await deleteStartupAsync(s.id);
                  if (editingStartup?.id === s.id) closeEditors();
                  showSuccess("Startup deleted");
                  tryRefetch(startupsQ.refetch);
                } catch (err) {
                  console.error("Failed to delete startup:", err);
                }
              }}
              emptyLabel="No startups"
            />
          )}
        </>
      )}

      {entity === "Users" && (
        <>
          {usersQ.isLoading && (
            <TableSkeletonWide
              title="Users"
              subtitle="Loading users…"
              rows={12}
            />
          )}
          {usersQ.isError && (
            <div className="text-destructive text-sm break-all">
              Error: {getErrorMessage(usersQ.error)}
            </div>
          )}
          {listUsers && (
            <UsersTable
              users={listUsers}
              onCreate={() => router.push("/users/new")}
              onView={(u) => router.push(`/users/${u.id}`)}
              onEdit={handleEditUser}
              onDelete={async (u) => {
                try {
                  await deleteUserAsync(u.id);
                  if (editingUser?.id === u.id) closeEditors();
                  showSuccess("User deleted");
                  tryRefetch(usersQ.refetch);
                } catch (err) {
                  console.error("Failed to delete user:", err);
                }
              }}
              emptyLabel="No users"
            />
          )}
        </>
      )}

      {entity === "Events" && (
        <>
          {eventsQ.isLoading && (
            <TableSkeletonWide
              title="Events"
              subtitle="Loading events…"
              rows={12}
            />
          )}
          {eventsQ.isError && (
            <div className="text-destructive text-sm break-all">
              Error: {getErrorMessage(eventsQ.error)}
            </div>
          )}
          {listEvents && (
            <EventsTable
              events={listEvents}
              onCreate={() => router.push("/events/new")}
              onView={(e) => router.push(`/events/${e.id}`)}
              onEdit={handleEditEvent}
              onDelete={async (e) => {
                try {
                  await deleteEventAsync(e.id);
                  if (editingEvent?.id === e.id) closeEditors();
                  showSuccess("Event deleted");
                  tryRefetch(eventsQ.refetch);
                } catch (err) {
                  console.error("Failed to delete event:", err);
                }
              }}
              emptyLabel="No events"
            />
          )}
        </>
      )}

      {entity === "News" && (
        <>
          {newsQ.isLoading && (
            <TableSkeletonWide
              title="News"
              subtitle="Loading news…"
              rows={12}
            />
          )}
          {newsQ.isError && (
            <div className="text-destructive text-sm break-all">
              Error: {getErrorMessage(newsQ.error)}
            </div>
          )}
          {listNews && (
            <NewsTable
              news={listNews}
              onCreate={() => router.push("/news/new")}
              onView={(n) => router.push(`/news/${n.id}`)}
              onEdit={handleEditNews}
              onDelete={async (n) => {
                try {
                  await deleteNewsAsync(n.id);
                  if (editingNews?.id === n.id) closeEditors();
                  showSuccess("News deleted");
                  tryRefetch(newsQ.refetch);
                } catch (err) {
                  console.error("Failed to delete news:", err);
                }
              }}
              emptyLabel="No news"
            />
          )}
        </>
      )}

      {editingType === "startup" && (
        <EditDialogStartup
          key={editingStartup?.id ?? "startup-empty"}
          open={editOpen}
          onOpenChange={(o) => {
            setEditOpen(o);
            if (!o) setEditingType(null);
          }}
          startup={editingStartup}
          onSubmit={async (_id, body) => {
            if (!editingStartup) return;
            try {
              await updateStartupAsync(body);
              showSuccess("Startup updated");
              tryRefetch(startupsQ.refetch);
            } catch (err: unknown) {
              console.error("Failed to update startup:", err);
            } finally {
              closeEditors();
            }
          }}
        />
      )}

      {editingType === "user" && (
        <EditDialogUser
          key={editingUser?.id ?? "user-empty"}
          open={editOpen}
          onOpenChange={(o) => {
            setEditOpen(o);
            if (!o) setEditingType(null);
          }}
          user={editingUser}
          onSubmit={async (_id, body) => {
            if (!editingUser) return;
            try {
              await updateUserAsync(body);
              showSuccess("User updated");
              tryRefetch(usersQ.refetch);
            } catch (err: unknown) {
              console.error("Failed to update user:", err);
            } finally {
              closeEditors();
            }
          }}
        />
      )}

      {editingType === "event" && (
        <EditDialogEvent
          key={editingEvent?.id ?? "event-empty"}
          open={editOpen}
          onOpenChange={(o) => {
            setEditOpen(o);
            if (!o) setEditingType(null);
          }}
          event={editingEvent}
          onSubmit={async (_id, body) => {
            if (!editingEvent) return;
            try {
              await updateEventAsync(body);
              showSuccess("Event updated");
              tryRefetch(eventsQ.refetch);
            } catch (err: unknown) {
              console.error("Failed to update event:", err);
            } finally {
              closeEditors();
            }
          }}
        />
      )}

      {editingType === "news" && (
        <EditDialogNews
          key={editingNews?.id ?? "news-empty"}
          open={editOpen}
          onOpenChange={(o) => {
            setEditOpen(o);
            if (!o) setEditingType(null);
          }}
          news={editingNews}
          onSubmit={async (_id, body) => {
            if (!editingNews) return;
            try {
              await updateNewsAsync(body);
              showSuccess("News updated");
              tryRefetch(newsQ.refetch);
            } catch (err: unknown) {
              console.error("Failed to update news:", err);
            } finally {
              closeEditors();
            }
          }}
        />
      )}

      {isUpdateUserError && (
        <p className="text-destructive text-sm break-all">
          Update error: {getErrorMessage(updateUserErrObj)}
        </p>
      )}
      {isDeleteUserError && (
        <p className="text-destructive text-sm break-all">
          Delete error: {getErrorMessage(deleteUserErrObj)}
        </p>
      )}
      {isUpdateStartupError && (
        <p className="text-destructive text-sm break-all">
          Update error: {getErrorMessage(updateStartupErrObj)}
        </p>
      )}
      {isDeleteStartupError && (
        <p className="text-destructive text-sm break-all">
          Delete error: {getErrorMessage(deleteStartupErrObj)}
        </p>
      )}
      {isUpdateEventError && (
        <p className="text-destructive text-sm break-all">
          Update error: {getErrorMessage(updateEventErrObj)}
        </p>
      )}
      {isDeleteEventError && (
        <p className="text-destructive text-sm break-all">
          Delete error: {getErrorMessage(deleteEventErrObj)}
        </p>
      )}
      {isUpdateNewsError && (
        <p className="text-destructive text-sm break-all">
          Update error: {getErrorMessage(updateNewsErrObj)}
        </p>
      )}
      {isDeleteNewsError && (
        <p className="text-destructive text-sm break-all">
          Delete error: {getErrorMessage(deleteNewsErrObj)}
        </p>
      )}

      <SuccessOverlay open={successOpen} message={successMsg} />
    </main>
  );
}
