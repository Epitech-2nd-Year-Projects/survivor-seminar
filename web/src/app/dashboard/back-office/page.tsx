// app/dashboard/back-office/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Startup } from "@/lib/api/contracts/startups";
import type { User } from "@/lib/api/contracts/users";

import ProjectsTable from "@/components/tables/projectTable";
import UsersTable from "@/components/tables/usersTable";

import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";

import { useUsersList } from "@/lib/api/services/users/hooks";
import { useStartupsList } from "@/lib/api/services/startups/hooks";
import TableSkeletonWide from "@/components/tablesSkeletonWide";
import EditDialogUser from "@/components/editDialogUser";
import EditDialogStartup from "@/components/editDialogStartup";
import { useUpdateUser } from "@/lib/api/services/users/hooks";
import { updateStartupClient } from "@/lib/api/services/startups/client";
import { toast as sonnerToast } from "sonner";

type ToastFn = (message: string) => void;
const toast: ToastFn = (message) => {
  (sonnerToast as unknown as (msg: string) => void)(message);
};

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

const ENTITIES = ["Users", "Startups"] as const;
type Entity = (typeof ENTITIES)[number];
const isEntity = (v: string): v is Entity =>
  (ENTITIES as readonly string[]).includes(v);

export default function BackOfficePage() {
  const [entity, setEntity] = useState<Entity>("Startups");
  const router = useRouter();

  const startupsQ = useStartupsList();
  const usersQ = useUsersList();

  const [editOpen, setEditOpen] = useState(false);
  const [editingType, setEditingType] = useState<"startup" | "user" | null>(
    null,
  );
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingStartup, setEditingStartup] = useState<Startup | null>(null);

  const {
    mutateAsync: updateUserAsync,
    isError: isUpdateUserError,
    error: updateUserErrObj,
  } = useUpdateUser(editingUser?.id ?? 0);

  const listStartups = startupsQ.data?.data ?? [];
  const listUsers = usersQ.data?.data ?? [];

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

  const closeEditors = () => {
    setEditOpen(false);
    setEditingStartup(null);
    setEditingUser(null);
    setEditingType(null);
  };

  return (
    <main className="mx-auto max-w-7xl space-y-4 p-4 sm:p-6">
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
              onDelete={(s) => console.log("delete", s)}
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
              onDelete={(u) => console.log("delete", u)}
              emptyLabel="No users"
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
          onSubmit={async (id, body) => {
            try {
              await updateStartupClient(id, body);
              toast("Startup updated.");
              tryRefetch(startupsQ.refetch);
            } catch (e: unknown) {
              toast(`Failed to update startup: ${getErrorMessage(e)}`);
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
              toast("User updated.");
              tryRefetch(usersQ.refetch);
            } catch (e: unknown) {
              toast(`Failed to update user: ${getErrorMessage(e)}`);
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
    </main>
  );
}
