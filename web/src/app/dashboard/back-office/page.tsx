// app/dashboard/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import ProjectsTable from "@/components/tables/projectTable";
import UsersTable from "@/components/tables/usersTable";

import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";

import { fetchProjects, fetchUsers } from "@/lib/fetchers";
import type { Project, User } from "@/types";
import TableSkeletonWide from "@/components/tablesSkeletonWide";

const ENTITIES = ["Users", "Startups"] as const;
type Entity = (typeof ENTITIES)[number];
const isEntity = (v: string): v is Entity =>
  (ENTITIES as readonly string[]).includes(v);

export default function BackOfficePage() {
  const [entity, setEntity] = useState<Entity>("Startups");
  const router = useRouter();

  const projectsQ = useQuery<Project[], Error>({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    enabled: entity === "Startups",
    staleTime: 5 * 60_000,
    retry: 2,
    placeholderData: (prev) => prev,
  });

  const usersQ = useQuery<User[], Error>({
    queryKey: ["users"],
    queryFn: fetchUsers,
    enabled: entity === "Users",
    staleTime: 5 * 60_000,
    retry: 2,
    placeholderData: (prev) => prev,
  });

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
              <SelectItem value="Users">Users</SelectItem>
              <SelectItem value="Startups">Startups</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {entity === "Startups" && (
        <>
          {projectsQ.isLoading && (
            <TableSkeletonWide
              title="Startups"
              subtitle="Loading startups…"
              rows={12}
            />
          )}

          {projectsQ.isError && (
            <div className="text-destructive text-sm break-all">
              Error: {projectsQ.error?.message}
            </div>
          )}

          {projectsQ.data && (
            <ProjectsTable
              projects={projectsQ.data}
              onCreate={() => router.push("/projects/new")}
              onView={(p) => router.push(`/projects/${p.id}`)}
              onEdit={(p) => router.push(`/projects/${p.id}/edit`)}
              onDelete={(p) => console.log("delete", p)}
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

          {usersQ.data && (
            <UsersTable
              users={usersQ.data}
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
