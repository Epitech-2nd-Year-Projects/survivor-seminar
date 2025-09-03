"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type Props = {
  /** Préfixe du layout (ex: "/dashboard"). */
  basePath?: string;
  /** Libellé du premier maillon (ex: "Dashboard"). */
  rootLabel?: string;
  /** Pour renommer joliment certains segments. */
  titleMap?: Record<string, string>;
};

function humanize(segment: string, titleMap?: Record<string, string>) {
  if (titleMap && titleMap[segment]) return titleMap[segment];
  // "data-fetching" -> "Data fetching"
  const s = segment.replace(/-/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function DynamicBreadcrumbs({
  basePath = "/dashboard",
  rootLabel = "Dashboard",
  titleMap,
}: Props) {
  const pathname = usePathname();

  // On retire le préfixe du layout pour ne garder que la partie variable
  const relative = pathname.startsWith(basePath)
    ? pathname.slice(basePath.length)
    : pathname;

  const segments = relative.split("/").filter(Boolean);

  // on reconstruit les href cumulativement
  let acc = basePath === "/" ? "" : basePath;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Racine */}
        <BreadcrumbItem className="hidden md:block">
          {segments.length ? (
            <BreadcrumbLink asChild>
              <Link href={basePath || "/"}>{rootLabel}</Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage>{rootLabel}</BreadcrumbPage>
          )}
        </BreadcrumbItem>

        {/* Segments dynamiques */}
        {segments.map((seg, i) => {
          acc += `/${seg}`;
          const isLast = i === segments.length - 1;
          const label = humanize(seg, titleMap);

          return (
            <React.Fragment key={acc}>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={acc}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
