"use client";

import { useState } from "react";
import UsersTable, { type User } from "@/components/tables/usersTable";
import StartupsTable, { type Startup } from "@/components/tables/startupTable";
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

const data: User[] = [
  {
    id: "101",
    name: "Jane Doe",
    email: "jane@x.io",
    role: "admin",
    founder_id: "12",
    investor_id: "0",
    createdAt: "2024-02-01",
  },
  {
    id: "102",
    name: "Marc Lee",
    email: "marc@x.io",
    role: "manager",
    founder_id: null,
    investor_id: "7",
    createdAt: "2023-11-10",
  },
];

const startups: Startup[] = [
  {
    id: 1,
    name: "Acme AI",
    email: "hello@acme.ai",
    sector: "AI",
    maturity: "series",
    legal_status: "SAS",
    address: "10 rue de la Paix, Paris",
    phone: "+33 1 23 45 67 89",
  },
  {
    id: 2,
    name: "GreenVolt",
    email: "contact@greenvolt.io",
    sector: "Energy",
    maturity: "pause A",
    legal_status: "SASU",
  },
];

export default function BackOfficePage() {
  const [entity, setEntity] = useState("Users");
  const router = useRouter();

  return (
    <main className="space-y-4 p-4">
      <div className="w-56 sm:w-64">
        <Select value={entity} onValueChange={setEntity}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select element to edit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Users">Users</SelectItem>
            <SelectItem value="Startups">Startups</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {entity === "Users" && (
        <UsersTable
          users={data}
          onCreate={() => router.push("/dashboard/users/new")}
          onView={(u) => router.push(`/dashboard/users/${u.id}`)}
          onEdit={(u) => router.push(`/dashboard/users/${u.id}/edit`)}
          onDelete={(u) => console.log("delete", u)}
        />
      )}
      {entity === "Startups" && (
        <StartupsTable
          startups={startups}
          onCreate={() => router.push("/dashboard/startups/new")}
          onView={(s) => router.push(`/dashboard/startups/${s.id}`)}
          onEdit={(s) => router.push(`/dashboard/startups/${s.id}/edit`)}
          onDelete={(s) => console.log("delete", s)}
        />
      )}
    </main>
  );
}
