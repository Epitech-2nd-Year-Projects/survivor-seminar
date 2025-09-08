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
import type { User } from "@/lib/api/contracts/users";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
      }).format(typeof date === "string" ? new Date(date) : date)
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
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
          <CardDescription>List of users, roles & IDs.</CardDescription>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users, mails"
            className="w-full sm:w-56"
          />
          <Button onClick={onCreate} className="w-full sm:w-auto">
            New User
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <ScrollArea className="h-[60vh] w-full">
            <Table className="min-w-[900px]">
              <TableHeader className="bg-background sticky top-0 z-10">
                <TableRow>
                  <TableHead className="min-w-[220px]">User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden md:table-cell">Role</TableHead>
                  <TableHead className="hidden text-center lg:table-cell">
                    Founder ID
                  </TableHead>
                  <TableHead className="hidden text-center lg:table-cell">
                    Investor ID
                  </TableHead>
                  <TableHead className="hidden text-center md:table-cell">
                    ID
                  </TableHead>
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
                    <TableRow key={user.id} className="text-sm">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage
                              src={user.imageUrl ?? ""}
                              alt={user.name}
                            />
                            <AvatarFallback>
                              {initials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="grid">
                            <span className="leading-tight font-medium">
                              {user.name}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {formatDateFR(user.createdAt)
                                ? `Member since ${formatDateFR(user.createdAt)}`
                                : "—"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        {user.email}
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
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

                      <TableCell className="hidden text-center lg:table-cell">
                        {user.founderId}
                      </TableCell>
                      <TableCell className="hidden text-center lg:table-cell">
                        {user.investorId}
                      </TableCell>
                      <TableCell className="hidden text-center md:table-cell">
                        {user.id}
                      </TableCell>

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
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
