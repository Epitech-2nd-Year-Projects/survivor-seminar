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

export type Startup = {
  id: number | string;
  name: string;
  email: string;
  legal_status?: string | null;
  address?: string | null;
  phone?: string | null;
  sector?: string | null;
  maturity?: string | null;
  logoUrl?: string | null;
};

type Props = {
  startups: Startup[];
  title?: string;
  onCreate?: () => void;
  onView?: (s: Startup) => void;
  onEdit?: (s: Startup) => void;
  onDelete?: (s: Startup) => void;
  emptyLabel?: string;
};

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

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

const maturityVariant = (m?: string | null): BadgeVariant => {
  const v = (m ?? "").toLowerCase();
  if (v.includes("idea") || v.includes("prototype") || v.includes("pre"))
    return "secondary";
  if (v.includes("seed")) return "outline";
  if (
    v.includes("series") ||
    v.includes("growth") ||
    v.includes("scale") ||
    v.includes("mvp") ||
    v.includes("product")
  )
    return "default";
  if (v.includes("hold") || v.includes("pause")) return "destructive";
  return "outline";
};

const truncate = (s?: string | null, n = 40) =>
  !s ? "—" : s.length > n ? s.slice(0, n - 1) + "…" : s;

export default function StartupsTable({
  startups,
  title = "Startups",
  onCreate,
  onView,
  onEdit,
  onDelete,
  emptyLabel = "No startups",
}: Props) {
  const [query, setQuery] = React.useState("");
  const showActions = Boolean(onView ?? onEdit ?? onDelete);

  const filtered = React.useMemo(() => {
    if (!query) return startups;
    const q = norm(query);
    return startups.filter((s) =>
      norm(`${s.name} ${s.email} ${s.sector ?? ""}`).includes(q),
    );
  }, [startups, query]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>List of startups & details.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, sector..."
            className="w-64"
          />
          <Button onClick={onCreate}>New Startup</Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[280px]">Startup</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Legal status</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Maturity</TableHead>
                <TableHead>Address</TableHead>
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
                    colSpan={8 + (showActions ? 1 : 0)}
                    className="text-muted-foreground text-center"
                  >
                    {emptyLabel}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={s.logoUrl ?? ""} alt={s.name} />
                          <AvatarFallback>{initials(s.name)}</AvatarFallback>
                        </Avatar>
                        <div className="grid">
                          <span className="font-medium">{s.name}</span>
                          <span className="text-muted-foreground text-xs">
                            {s.sector ?? "—"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>{s.email}</TableCell>
                    <TableCell>{s.phone ?? "—"}</TableCell>
                    <TableCell>{s.legal_status ?? "—"}</TableCell>

                    <TableCell>
                      {s.sector ? (
                        <Badge variant="outline">{s.sector}</Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>

                    <TableCell>
                      {s.maturity ? (
                        <Badge variant={maturityVariant(s.maturity)}>
                          {s.maturity}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>

                    <TableCell>{truncate(s.address)}</TableCell>

                    <TableCell className="text-center">{s.id}</TableCell>

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
                                onClick={() => onView(s)}
                              >
                                <Eye className="h-4 w-4" /> View
                              </DropdownMenuItem>
                            )}
                            {onEdit && (
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => onEdit(s)}
                              >
                                <Pencil className="h-4 w-4" /> Edit
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive gap-2"
                                onClick={() => onDelete(s)}
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
