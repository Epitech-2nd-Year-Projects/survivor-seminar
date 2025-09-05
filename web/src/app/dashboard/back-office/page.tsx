"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProjectsTable from "@/components/tables/projectTable";
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import { fetchProjects, fetchUsers } from "@/lib/fetchers";
import type { Project } from "@/types/projects";
import type { User } from "@/types/users";
import UsersTable from "@/components/tables/usersTable";

export default function BackOfficePage() {
  const [entity, setEntity] = useState("Startups");
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let alive = true;
    if (entity === "Startups") {
      setLoading(true);
      setError(null);
      fetchProjects()
        .then((rows) => {
          if (alive) setProjects(rows);
        })
        .catch((e) => {
          if (alive) setError((e as Error).message);
        })
        .finally(() => {
          if (alive) setLoading(false);
        });
    }
    if (entity === "Users") {
      setLoading(true);
      setError(null);
      fetchUsers()
        .then((rows) => {
          if (alive) setUsers(rows);
        })
        .catch((e) => {
          if (alive) setError((e as Error).message);
        })
        .finally(() => {
          if (alive) setLoading(false);
        });
    }
    return () => {
      alive = false;
    };
  }, [entity]);

  return (
    <main className="mx-auto max-w-7xl space-y-4 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-64">
          <Select value={entity} onValueChange={(v) => setEntity(v)}>
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
          {loading && (
            <div className="text-muted-foreground text-sm">Loading…</div>
          )}
          {error && (
            <div className="text-destructive text-sm break-all">
              Error: {error}
            </div>
          )}
          {!loading && !error && (
            <ProjectsTable
              projects={projects}
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
          {loading && (
            <div className="text-muted-foreground text-sm">Loading…</div>
          )}
          {error && (
            <div className="text-destructive text-sm break-all">
              Error: {error}
            </div>
          )}
          {!loading && !error && (
            <UsersTable
              users={users}
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
