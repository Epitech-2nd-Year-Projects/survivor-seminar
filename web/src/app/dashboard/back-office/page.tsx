// app/dashboard/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ProjectsTable from "@/components/tables/projectTable";
import UsersTable from "@/components/tables/usersTable";

import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";

import type { Startup } from "@/lib/api/contracts/startups";
import type { User } from "@/lib/api/contracts/users";
import { useUsersList } from "@/lib/api/services/users/hooks";
import { useStartupsList } from "@/lib/api/services/startups/hooks";
import TableSkeletonWide from "@/components/tablesSkeletonWide";

const ENTITIES = ["Users", "Startups"] as const;
type Entity = (typeof ENTITIES)[number];
const isEntity = (v: string): v is Entity =>
  (ENTITIES as readonly string[]).includes(v);

export default function BackOfficePage() {
  const [entity, setEntity] = useState<Entity>("Startups");
  const router = useRouter();

  const startupsQ = useStartupsList();
  const usersQ = useUsersList();

  const listStartups = startupsQ.data?.data ?? [];
  const listUsers = usersQ.data?.data ?? [];

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
              Error: {startupsQ.error?.message}
            </div>
          )}

          {listStartups && (
            <ProjectsTable
              projects={listStartups}
              onCreate={() => router.push("/projects/new")}
              onView={(s) => router.push(`/projects/${s.id}`)}
              onEdit={(s) => router.push(`/projects/${s.id}/edit`)}
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
              Error: {usersQ.error?.message}
            </div>
          )}

          {listUsers && (
            <UsersTable
              users={listUsers}
              onCreate={() => router.push("/users/new")}
              onView={(u) => router.push(`/users/${u.id}`)}
              onEdit={(u) => router.push(`/users/${u.id}/edit`)}
              onDelete={(u) => console.log("delete", u)}
              emptyLabel="No users"
            />
          )}
        </>
      )}
    </main>
  );
}
