"use client";

import * as React from "react";
import type { Project } from "@/types";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

type Props = {
  projects: Project[];
  title?: string;
  onCreate?: () => void;
  onView?: (p: Project) => void;
  onEdit?: (p: Project) => void;
  onDelete?: (p: Project) => void;
  emptyLabel?: string;
};

const initials = (s: string) =>
  s
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

const truncate = (s?: string | null, n = 40) =>
  !s ? "—" : s.length > n ? s.slice(0, n - 1) + "…" : s;

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const maturityVariant = (m?: string | null): BadgeVariant => {
  const v = (m ?? "").toLowerCase();
  if (v.includes("pre") || v.includes("idea") || v.includes("proto"))
    return "secondary";
  if (v.includes("seed")) return "outline";
  if (v.includes("series") || v.includes("growth") || v.includes("scale"))
    return "default";
  if (v.includes("pause") || v.includes("hold")) return "destructive";
  return "outline";
};

const formatDateFR = (d?: string | null) =>
  d
    ? new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "medium",
        timeZone: "Europe/Paris",
      }).format(new Date(d))
    : "";

export default function ProjectsTable({
  projects,
  title = "Projects",
  onCreate,
  onView,
  onEdit,
  onDelete,
  emptyLabel = "No projects",
}: Props) {
  const [query, setQuery] = React.useState("");
  const showActions = Boolean(onView ?? onEdit ?? onDelete);

  const filtered = React.useMemo(() => {
    if (!query) return projects;
    const q = norm(query);
    return projects.filter((p) =>
      norm(`${p.name} ${p.email} ${p.sector ?? ""}`).includes(q),
    );
  }, [projects, query]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            List of startups (projects) & details.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value)
            }
            placeholder="Search name, email, sector..."
            className="w-64"
          />
          <Button onClick={onCreate}>New Project</Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <ScrollArea className="h-[60vh] w-full">
            <Table className="min-w-[1100px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[280px]">Project</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Legal status</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Maturity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Needs</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-center">Founders</TableHead>
                  <TableHead className="text-center">ID</TableHead>
                  {showActions && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={12 + (showActions ? 1 : 0)}
                      className="text-muted-foreground text-center"
                    >
                      {emptyLabel}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{initials(p.name)}</AvatarFallback>
                          </Avatar>
                          <div className="grid">
                            <span className="font-medium">{p.name}</span>
                            <span className="text-muted-foreground text-xs">
                              {p.sector ?? "—"}
                              {p.created_at
                                ? ` • since ${formatDateFR(p.created_at)}`
                                : ""}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>{p.email}</TableCell>
                      <TableCell>{p.phone ?? "—"}</TableCell>
                      <TableCell>{p.legal_status ?? "—"}</TableCell>

                      <TableCell>
                        {p.sector ? (
                          <Badge variant="outline">{p.sector}</Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>

                      <TableCell>
                        {p.maturity ? (
                          <Badge variant={maturityVariant(p.maturity)}>
                            {p.maturity}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>

                      <TableCell>{p.project_status ?? "—"}</TableCell>
                      <TableCell>{truncate(p.needs, 28)}</TableCell>

                      <TableCell>
                        {p.website_url ? (
                          <a
                            href={p.website_url}
                            target="_blank"
                            rel="noreferrer"
                            className="underline underline-offset-2"
                          >
                            {truncate(p.website_url, 22)}
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>

                      <TableCell>{truncate(p.address, 28)}</TableCell>

                      <TableCell className="text-center">
                        {Array.isArray(p.founders) ? p.founders.length : 0}
                      </TableCell>

                      <TableCell className="text-center">{p.id}</TableCell>

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
                            <DropdownMenuContent align="end" className="w-44">
                              {onView && (
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() => onView(p)}
                                >
                                  <Eye className="h-4 w-4" /> View
                                </DropdownMenuItem>
                              )}
                              {onEdit && (
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() => onEdit(p)}
                                >
                                  <Pencil className="h-4 w-4" /> Edit
                                </DropdownMenuItem>
                              )}
                              {onDelete && (
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive gap-2"
                                  onClick={() => onDelete(p)}
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
