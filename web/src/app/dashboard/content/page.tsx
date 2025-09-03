"use client";

import * as React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { ArrowUpDown, ChevronUp, ChevronDown, MoreHorizontal, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Status = "draft" | "published" | "archived";
type Project = {
  id: string;
  name: string;
  sector: "Energy" | "AgriTech" | "Mobility" | "FinTech";
  maturity: "MVP" | "Seed" | "Series A";
  location: string;
  status: Status;
  updatedAt: string;
};

const DATA: Project[] = [
  { id: "1", name: "NeoCharge", sector: "Energy",   maturity: "Seed",     location: "Paris, FR",  status: "published", updatedAt: "2025-02-21T09:10:00Z" },
  { id: "2", name: "AgriSense", sector: "AgriTech", maturity: "MVP",      location: "Lyon, FR",   status: "draft",     updatedAt: "2025-02-20T15:45:00Z" },
  { id: "3", name: "FleetAI",   sector: "Mobility", maturity: "Series A", location: "Berlin, DE", status: "published", updatedAt: "2025-02-22T11:20:00Z" },
  { id: "4", name: "Finly",     sector: "FinTech",  maturity: "Seed",     location: "Madrid, ES", status: "archived",  updatedAt: "2025-02-18T08:05:00Z" },
];

type SortKey = keyof Pick<Project, "name" | "sector" | "maturity" | "location" | "status" | "updatedAt">;

export default function ContentPage() {
  const [query, setQuery] = React.useState("");
  const [sector, setSector] = React.useState<string>("all");
  const [status, setStatus] = React.useState<string>("all");

  const [sortKey, setSortKey] = React.useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");

  const [toDelete, setToDelete] = React.useState<Project | null>(null);

  const sectors = React.useMemo(() => {
    const set = new Set(DATA.map((p) => p.sector));
    return ["all", ...Array.from(set)];
  }, []);
  const statuses = ["all", "published", "draft", "archived"] as const;

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = DATA.filter((p) => {
      const matchesQ =
        !q ||
        p.name.toLowerCase().includes(q);
      const matchesSector = sector === "all" || p.sector === sector;
      const matchesStatus = status === "all" || p.status === status;
      return matchesQ && matchesSector && matchesStatus;
    });

    arr.sort((a, b) => {
      const A = a[sortKey];
      const B = b[sortKey];
      if (sortKey === "updatedAt") {
        const ta = new Date(String(A)).getTime();
        const tb = new Date(String(B)).getTime();
        return sortDir === "asc" ? ta - tb : tb - ta;
      }
      return sortDir === "asc"
        ? String(A).localeCompare(String(B))
        : String(B).localeCompare(String(A));
    });

    return arr;
  }, [query, sector, status, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "updatedAt" ? "desc" : "asc");
    }
  }

  // reset
  function resetAll() {
    setQuery("");
    setSector("all");
    setStatus("all");
    setSortKey("updatedAt");
    setSortDir("desc");
  }

  const headClass = (key: SortKey) =>
    "cursor-pointer select-none " + (sortKey === key ? "font-medium" : "");

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) {
      return <ArrowUpDown className="ml-1 inline h-4 w-4 align-text-bottom" />;
    }
    return sortDir === "asc" ? (
      <ChevronUp className="ml-1 inline h-4 w-4 align-text-bottom" />
    ) : (
      <ChevronDown className="ml-1 inline h-4 w-4 align-text-bottom" />
    );
  };

  function confirmDelete(p: Project) {
    setToDelete(p);
  }
  function reallyDelete() {
    setToDelete(null);
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Content Management</h1>
          <p className="text-sm text-muted-foreground">Gérez vos fiches projets (données factices).</p>
        </div>
        <Link href="/dashboard/content/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:gap-3">
            <Input
              className="w-full md:w-80"
              placeholder="Search name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <Select value={sector} onValueChange={setSector}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent className="z-50">
                {sectors.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "all" ? "All sectors" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="z-50">
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "all" ? "All status" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={resetAll}>Reset</Button>

            <span className="ml-auto text-sm text-muted-foreground">
              Results: <Badge variant="secondary">{rows.length}</Badge>
            </span>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    onClick={() => toggleSort("name")}
                    className={headClass("name")}
                    aria-sort={sortKey === "name" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                  >
                    Name <SortIcon column="name" />
                  </TableHead>
                  <TableHead
                    onClick={() => toggleSort("sector")}
                    className={headClass("sector")}
                    aria-sort={sortKey === "sector" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                  >
                    Sector <SortIcon column="sector" />
                  </TableHead>
                  <TableHead
                    onClick={() => toggleSort("maturity")}
                    className={headClass("maturity")}
                    aria-sort={sortKey === "maturity" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                  >
                    Maturity <SortIcon column="maturity" />
                  </TableHead>
                  <TableHead
                    onClick={() => toggleSort("location")}
                    className={headClass("location")}
                    aria-sort={sortKey === "location" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                  >
                    Location <SortIcon column="location" />
                  </TableHead>
                  <TableHead
                    onClick={() => toggleSort("status")}
                    className={headClass("status")}
                    aria-sort={sortKey === "status" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                  >
                    Status <SortIcon column="status" />
                  </TableHead>
                  <TableHead
                    onClick={() => toggleSort("updatedAt")}
                    className={headClass("updatedAt")}
                    aria-sort={sortKey === "updatedAt" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                  >
                    Updated <SortIcon column="updatedAt" />
                  </TableHead>
                  <TableHead className="w-1 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((p) => (
                  <TableRow key={p.id} className="hover:bg-accent/40">
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/content/${p.id}/edit`} className="hover:underline">
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell>{p.sector}</TableCell>
                    <TableCell>{p.maturity}</TableCell>
                    <TableCell>{p.location}</TableCell>
                    <TableCell>
                      {p.status === "published" ? (
                        <Badge>Published</Badge>
                      ) : p.status === "draft" ? (
                        <Badge variant="secondary">Draft</Badge>
                      ) : (
                        <Badge variant="outline">Archived</Badge>
                      )}
                    </TableCell>
                    <TableCell>{new Date(p.updatedAt).toLocaleString([], { dateStyle: "medium" })}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Row actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/projects/${p.id}`} target="_blank">Preview</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/content/${p.id}/edit`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => confirmDelete(p)}>
                            Delete…
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      No results
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete project</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <p className="text-sm">
            Are you sure you want to delete{" "}
            <span className="font-medium">{toDelete?.name}</span> ?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={reallyDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
