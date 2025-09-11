"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu } from "@/components/ui/dropdown-menu-style";
import { userMessageFromError } from "@/lib/api/http/messages";
import { useStartupsList } from "@/lib/api/services/startups/hooks";
import { capitalize } from "@/lib/utils";
import { ListRestartIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { BentoGrid, type BentoItem } from "@/components/ui/bento-grid";
import { Globe, Star } from "lucide-react";

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

  const toItems = (items: typeof visibleStartups): BentoItem[] =>
    items.map((s) => {
      const city = s.address?.split(",").pop()?.trim();
      const desc = (s.description ?? "No description provided.").trim();
      const truncated = desc.length > 140 ? `${desc.slice(0, 140)}…` : desc;
      const title = s.name.length > 48 ? `${s.name.slice(0, 48)}…` : s.name;
      return {
        title,
        meta: s.sector ?? city ?? "",
        description: truncated,
        icon: <Globe className="w-4 h-4" />,
        status: s.maturity ? capitalize(s.maturity) : "Active",
        tags: [s.sector, city].filter(Boolean).slice(0, 2) as string[],
        href: `/startups/${s.id}`,
        hasWebsite: !!s.websiteUrl,
        hasEmail: !!s.email,
        hasPhone: !!s.phone,
      };
    });

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

      {showSkeletons ? (
        <BentoGrid
          items={Array.from({ length: 12 }).map((_, i) => ({
            title: "Loading…",
            meta: "",
            description: "Fetching startups data…",
            icon: <Star className="w-4 h-4 text-gray-400" />,
            status: "",
            tags: [],
          }))}
        />
      ) : (
        <BentoGrid items={toItems(visibleStartups)} />
      )}
    </div>
  );
}
