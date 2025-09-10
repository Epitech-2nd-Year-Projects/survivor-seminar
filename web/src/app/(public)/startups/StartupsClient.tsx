"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DropdownMenu } from "@/components/ui/dropdown-menu-style";
import { Skeleton } from "@/components/ui/skeleton";
import { userMessageFromError } from "@/lib/api/http/messages";
import { useStartupsList } from "@/lib/api/services/startups/hooks";
import { capitalize } from "@/lib/utils";
import { GlobeIcon, ListRestartIcon, MailIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

function useUrlState() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const get = (k: string) => sp.get(k) ?? undefined;
  const set = (next: Record<string, string | undefined>) => {
    const n = new URLSearchParams(Array.from(sp.entries()));
    for (const [k, v] of Object.entries(next)) {
      if (!v) n.delete(k);
      else n.set(k, v);
    }
    router.replace(`${pathname}?${n.toString()}`);
  };

  return {
    page: Number(get("page") ?? "1"),
    perPage: Number(get("per_page") ?? "20"),
    set,
  };
}

export default function StartupsClient() {
  const router = useRouter();
  const { page, perPage } = useUrlState();

  const { data, isLoading, isError, error } = useStartupsList({
    page,
    perPage,
  });

  const listStartups = data?.data ?? [];

  const [selectedMaturity, setSelectedMaturity] = useState<
    string | undefined
  >();
  const [selectedSector, setSelectedSector] = useState<string | undefined>();
  const [selectedLocation, setSelectedLocation] = useState<
    string | undefined
  >();

  const [openFilter, setOpenFilter] = useState<
    "maturity" | "sector" | "city" | null
  >(null);

  const maturityOptions = useMemo(
    () =>
      Array.from(
        new Set(
          listStartups
            .map((p) => p.maturity)
            .filter((m): m is string => m != null),
        ),
      ).sort(),
    [listStartups],
  );

  const sectorOptions = useMemo(
    () =>
      Array.from(
        new Set(
          listStartups
            .map((p) => p.sector)
            .filter((m): m is string => m != null),
        ),
      ).sort(),
    [listStartups],
  );

  const locationOptions = useMemo(
    () =>
      Array.from(
        new Set(
          listStartups
            .map((p) => p.address?.split(",").pop()?.trim())
            .filter((c): c is string => !!c),
        ),
      ).sort(),
    [listStartups],
  );

  const visibleStartups = useMemo(
    () =>
      listStartups.filter((p) => {
        const city = p.address?.split(",").pop()?.trim();
        return (
          (!selectedMaturity || p.maturity === selectedMaturity) &&
          (!selectedSector || p.sector === selectedSector) &&
          (!selectedLocation || city === selectedLocation)
        );
      }),
    [listStartups, selectedMaturity, selectedSector, selectedLocation],
  );

  const resetFilters = () => {
    setSelectedMaturity(undefined);
    setSelectedSector(undefined);
    setSelectedLocation(undefined);
  };

  if (isError) {
    return <div>Error: {userMessageFromError(error)}</div>;
  }

  const showSkeletons = isLoading && !data;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <DropdownMenu
          open={openFilter === "maturity"}
          onOpenChange={(o) => setOpenFilter(o ? "maturity" : null)}
          options={[
            {
              label: "All maturities",
              onClick: () => setSelectedMaturity(undefined),
            },
            ...maturityOptions.map((m) => ({
              label: capitalize(m),
              onClick: () => setSelectedMaturity(m),
            })),
          ]}
        >
          {selectedMaturity
            ? `Maturity: ${capitalize(selectedMaturity)}`
            : "Select a maturity"}
        </DropdownMenu>
        <DropdownMenu
          open={openFilter === "sector"}
          onOpenChange={(o) => setOpenFilter(o ? "sector" : null)}
          options={[
            {
              label: "All sectors",
              onClick: () => setSelectedSector(undefined),
            },
            ...sectorOptions.map((m) => ({
              label: capitalize(m),
              onClick: () => setSelectedSector(m),
            })),
          ]}
        >
          {selectedSector
            ? `Sector: ${capitalize(selectedSector)}`
            : "Select a sector"}
        </DropdownMenu>
        <DropdownMenu
          open={openFilter === "city"}
          onOpenChange={(o) => setOpenFilter(o ? "city" : null)}
          options={[
            {
              label: "All cities",
              onClick: () => setSelectedLocation(undefined),
            },
            ...locationOptions.map((location) => ({
              label: location,
              onClick: () => setSelectedLocation(location),
            })),
          ]}
        >
          {selectedLocation ? `City: ${selectedLocation}` : "Select a city"}
        </DropdownMenu>
        <Button
          disabled={isLoading}
          variant="secondary"
          size="icon"
          className="size-8"
          onClick={resetFilters}
        >
          <ListRestartIcon />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {showSkeletons
          ? Array.from({ length: 12 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle>
                    <Skeleton className="h-5 w-3/4" />
                  </CardTitle>
                  <CardDescription>
                    <Skeleton className="h-4 w-1/2" />
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-5/6" />
                </CardContent>
              </Card>
            ))
          : visibleStartups.map((startup) => (
              <Card
                key={startup.id}
                className="focus:ring-primary transform cursor-pointer transition duration-200 ease-out hover:scale-105 hover:shadow-lg focus:scale-105 focus:ring-2 focus:outline-none"
                onClick={() => router.push(`/startups/${startup.id}`)}
              >
                <CardHeader>
                  <CardTitle>{startup.name}</CardTitle>
                  <CardDescription className="flex gap-1">
                    <Badge variant="secondary">
                      {startup.address ?? "No address provided"}
                    </Badge>
                  </CardDescription>
                  <CardAction className="flex gap-2">
                    {startup.email && (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="size-8"
                      >
                        <a href={`mailto:${startup.email}`}>
                          <MailIcon />
                        </a>
                      </Button>
                    )}
                    {startup.websiteUrl ? (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="size-8"
                      >
                        <a
                          href={startup.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <GlobeIcon />
                        </a>
                      </Button>
                    ) : null}
                  </CardAction>
                </CardHeader>
                <CardContent>
                  {startup.description ?? "No description provided."}
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  );
}
