"use client";

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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

export default function TableSkeletonWide({
  title = "Loading",
  subtitle = "Fetching data…",
  rows = 10,
}: {
  title?: string;
  subtitle?: string;
  rows?: number;
}) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </div>
        <Skeleton className="h-9 w-28" />
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <ScrollArea className="h-[60vh] w-full">
            <Table className="min-w-[1100px]">
              <TableHeader className="bg-background sticky top-0 z-10">
                <TableRow>
                  <TableHead className="min-w-[220px]">Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Phone / Role
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Col A</TableHead>
                  <TableHead className="hidden lg:table-cell">Col B</TableHead>
                  <TableHead className="hidden xl:table-cell">Col C</TableHead>
                  <TableHead className="hidden text-center md:table-cell">
                    ID
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {Array.from({ length: rows }).map((_, i) => (
                  <TableRow key={i} className="text-sm">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-28" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Skeleton className="h-4 w-56" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-16 rounded-md" />
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell className="hidden text-center md:table-cell">
                      <Skeleton className="mx-auto h-4 w-12" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="ml-auto flex justify-end gap-2">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
