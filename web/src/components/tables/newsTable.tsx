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
  Tag,
} from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import type { News } from "@/lib/api/contracts/news";

type Props = {
  news: News[];
  title?: string;
  onCreate?: () => void;
  onView?: (n: News) => void;
  onEdit?: (n: News) => void;
  onDelete?: (n: News) => void;
  emptyLabel?: string;
};

const initials = (s?: string | null) =>
  (s ?? "NW")
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

const truncate = (s?: string | null, n = 64) =>
  !s ? "—" : s.length > n ? s.slice(0, n - 1) + "…" : s;

const formatDateFR = (date?: string | null) =>
  date
    ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(
        new Date(date),
      )
    : "—";

export default function NewsTable({
  news,
  title = "News",
  onCreate,
  onView,
  onEdit,
  onDelete,
  emptyLabel = "No news",
}: Props) {
  const showActions = Boolean(onView ?? onEdit ?? onDelete);
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!query) return news;
    const q = norm(query);
    return news.filter((n) =>
      norm(
        `${n.title ?? ""} ${n.category ?? ""} ${n.location ?? ""} ${n.description ?? ""} ${String(n.startupId ?? "")}`,
      ).includes(q),
    );
  }, [news, query]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
          <CardDescription>Announcements & press notes.</CardDescription>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Input
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value)
            }
            placeholder="Search title, category, location…"
            className="w-full sm:w-72"
          />
          {onCreate ? (
            <Button onClick={onCreate} className="w-full sm:w-auto">
              New News
            </Button>
          ) : null}
        </div>
      </CardHeader>

      <CardContent>
        <div className="border">
          <ScrollArea className="h-[60vh] w-full">
            <Table className="min-w-[1150px]">
              <TableHeader className="bg-background sticky top-0 z-10">
                <TableRow>
                  <TableHead className="min-w-[300px]">Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Location
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="hidden text-center md:table-cell">
                    Startup ID
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
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
                      colSpan={7 + (showActions ? 1 : 0)}
                      className="text-muted-foreground text-center"
                    >
                      {emptyLabel}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((n) => (
                    <TableRow key={n.id} className="text-sm">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage
                              src={n.imageUrl ?? ""}
                              alt={n.title ?? "news"}
                            />
                            <AvatarFallback>{initials(n.title)}</AvatarFallback>
                          </Avatar>
                          <div className="grid">
                            <span className="leading-tight font-medium">
                              {n.title ?? "—"}
                            </span>
                            <span className="text-muted-foreground flex items-center gap-2 text-xs">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {formatDateFR(n.newsData)}
                              {n.location ? (
                                <>
                                  <span aria-hidden>•</span>
                                  <MapPin className="h-3.5 w-3.5" />
                                  {n.location}
                                </>
                              ) : null}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="hidden sm:table-cell">
                        {formatDateFR(n.newsData)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {n.location ?? "—"}
                      </TableCell>
                      <TableCell>
                        {n.category ? (
                          <Badge
                            variant="outline"
                            className="inline-flex items-center gap-1"
                          >
                            <Tag className="h-3.5 w-3.5" />
                            {n.category}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="hidden text-center md:table-cell">
                        {typeof n.startupId === "number" ? n.startupId : "—"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {truncate(n.description, 80)}
                      </TableCell>
                      <TableCell className="hidden text-center md:table-cell">
                        {n.id}
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
                                  onClick={() => onView(n)}
                                >
                                  <Eye className="h-4 w-4" /> View
                                </DropdownMenuItem>
                              )}
                              {onEdit && (
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() => onEdit(n)}
                                >
                                  <Pencil className="h-4 w-4" /> Edit
                                </DropdownMenuItem>
                              )}
                              {onDelete && (
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive gap-2"
                                  onClick={() => onDelete(n)}
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
