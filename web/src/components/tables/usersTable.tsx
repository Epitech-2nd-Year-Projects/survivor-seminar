"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  founder_id?: string | null;
  investor_id?: string | null;
  createdAt?: string | Date | null;
  avatarUrl?: string | null;
};

type Props = {
  users: User[];
  title?: string;
  onCreate?: () => void;
  onView?: (u: User) => void;
  onEdit?: (u: User) => void;
  onDelete?: (u: User) => void;
  emptyLabel?: string;
};

const formatDateFR = (date?: string | Date | null) =>
  date
    ? new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "medium",
        timeZone: "Europe/Paris",
      }).format(new Date(date))
    : "";

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export default function UsersTable({
  users,
  title = "Users",
  onCreate,
  onView,
  onEdit,
  onDelete,
  emptyLabel = "No users",
}: Props) {
  const showActions = Boolean(onView ?? onEdit ?? onDelete);
  const [query, setQuery] = React.useState("");

  const filteredUsers = React.useMemo(() => {
    if (!query) return users;
    const q = norm(query);
    return users.filter((u) => norm(`${u.name} ${u.email}`).includes(q));
  }, [users, query]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>List of users, roles & IDs.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users, mails"
            className="w-56"
          />
          <Button onClick={onCreate}>New User</Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[280px]">User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-center">Founder ID</TableHead>
                <TableHead className="text-center">Investor ID</TableHead>
                <TableHead className="text-center">ID</TableHead>
                {showActions && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6 + (showActions ? 1 : 0)}
                    className="text-muted-foreground text-center"
                  >
                    {emptyLabel}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.avatarUrl ?? ""}
                            alt={user.name}
                          />
                          <AvatarFallback>{initials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="grid">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-muted-foreground text-xs">
                            {formatDateFR(user.createdAt)
                              ? `Member since ${formatDateFR(user.createdAt)}`
                              : "Former member"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>{user.email}</TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          user.role === "manager"
                            ? "secondary"
                            : user.role === "member"
                              ? "outline"
                              : "default"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center">
                      {user.founder_id ?? "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {user.investor_id ?? "-"}
                    </TableCell>
                    <TableCell className="text-center">{user.id}</TableCell>

                    {showActions && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            {onView && (
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => onView(user)}
                              >
                                <Eye className="h-4 w-4" /> View
                              </DropdownMenuItem>
                            )}
                            {onEdit && (
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => onEdit(user)}
                              >
                                <Pencil className="h-4 w-4" /> Edit
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive gap-2"
                                onClick={() => onDelete(user)}
                              >
                                <Trash2 className="h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
