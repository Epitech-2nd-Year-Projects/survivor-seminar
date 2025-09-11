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
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  CalendarDays,
  MapPin,
} from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import type { Event } from "@/lib/api/contracts/events";

type Props = {
  events: Event[];
  title?: string;
  onCreate?: () => void;
  onView?: (e: Event) => void;
  onEdit?: (e: Event) => void;
  onDelete?: (e: Event) => void;
  emptyLabel?: string;
};

const initials = (s?: string | null) =>
  (s ?? "EV")
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

const truncate = (s?: string | null, n = 48) =>
  !s ? "—" : s.length > n ? s.slice(0, n - 1) + "…" : s;

const formatDateFR = (date?: string | Date | null) =>
  date
    ? new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "medium",
        timeZone: "Europe/Paris",
      }).format(typeof date === "string" ? new Date(date) : date)
    : "";
const typeVariant = (
  t?: string | null,
): "default" | "secondary" | "outline" => {
  const v = (t ?? "").toLowerCase();
  if (v.includes("conf") || v.includes("meet") || v.includes("talk"))
    return "default";
  if (v.includes("work") || v.includes("bootcamp")) return "secondary";
  return "outline";
};

export default function EventsTable({
  events,
  title = "Events",
  onCreate,
  onView,
  onEdit,
  onDelete,
  emptyLabel = "No events",
}: Props) {
  const [query, setQuery] = React.useState("");
  const showActions = Boolean(onView ?? onEdit ?? onDelete);

  const filtered = React.useMemo(() => {
    if (!query) return events;
    const q = norm(query);
    return events.filter((e) =>
      norm(
        `${e.name ?? ""} ${e.eventType ?? ""} ${e.location ?? ""} ${e.targetAudience ?? ""} ${e.description ?? ""}`,
      ).includes(q),
    );
  }, [events, query]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
          <CardDescription>Upcoming & past events.</CardDescription>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Input
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value)
            }
            placeholder="Search name, type, location…"
            className="w-full sm:w-64"
          />
          {onCreate ? (
            <Button onClick={onCreate} className="w-full sm:w-auto">
              New Event
            </Button>
          ) : null}
        </div>
      </CardHeader>

      <CardContent>
        <div className="border">
          <ScrollArea className="h-[60vh] w-full">
            <Table className="min-w-[1100px]">
              <TableHeader className="bg-background sticky top-0 z-10">
                <TableRow>
                  <TableHead className="min-w-[240px]">Event</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Audience
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Location
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Start</TableHead>
                  <TableHead className="hidden md:table-cell">End</TableHead>
                  <TableHead className="hidden text-center lg:table-cell">
                    Capacity
                  </TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Description
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
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9 + (showActions ? 1 : 0)}
                      className="text-muted-foreground text-center"
                    >
                      {emptyLabel}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((e) => (
                    <TableRow key={e.id} className="text-sm">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage
                              src={e.imageUrl ?? ""}
                              alt={e.name ?? "event"}
                            />
                            <AvatarFallback>{initials(e.name)}</AvatarFallback>
                          </Avatar>
                          <div className="grid">
                            <span className="leading-tight font-medium">
                              {e.name ?? "—"}
                            </span>
                            <span className="text-muted-foreground flex items-center gap-2 text-xs">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {formatDateFR(e.startDate)}
                              <span aria-hidden>•</span>
                              <MapPin className="h-3.5 w-3.5" />
                              {e.location ?? "—"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {e.eventType ? (
                          <Badge variant={typeVariant(e.eventType)}>
                            {e.eventType}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>

                      <TableCell className="hidden lg:table-cell">
                        {e.targetAudience ?? "—"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {e.location ?? "—"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDateFR(e.startDate)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDateFR(e.endDate)}
                      </TableCell>
                      <TableCell className="hidden text-center lg:table-cell">
                        {typeof e.capacity === "number" ? e.capacity : "—"}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {truncate(e.description, 42)}
                      </TableCell>
                      <TableCell className="hidden text-center md:table-cell">
                        {e.id}
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
                                  onClick={() => onView(e)}
                                >
                                  <Eye className="h-4 w-4" /> View
                                </DropdownMenuItem>
                              )}
                              {onEdit && (
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() => onEdit(e)}
                                >
                                  <Pencil className="h-4 w-4" /> Edit
                                </DropdownMenuItem>
                              )}
                              {onDelete && (
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive gap-2"
                                  onClick={() => onDelete(e)}
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
