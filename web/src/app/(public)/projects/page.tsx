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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProjects } from "@/lib/fetchers";
import { capitalize } from "@/lib/utils";
import type { Project } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { GlobeIcon, ListRestartIcon, MailIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function Projects() {
  const router = useRouter();

  const {
    data: projects = [],
    isLoading,
    isError,
    error,
  } = useQuery<Project[], Error>({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const [selectedMaturity, setSelectedMaturity] = useState<string | undefined>(
    undefined,
  );
  const [selectedSector, setSelectedSector] = useState<string | undefined>(
    undefined,
  );
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>(
    undefined,
  );

  const maturityOptions = useMemo(() => {
    return Array.from(
      new Set(
        projects.map((p) => p.maturity).filter((m): m is string => m != null),
      ),
    ).sort();
  }, [projects]);

  const sectorOptions = useMemo(() => {
    return Array.from(
      new Set(
        projects.map((p) => p.sector).filter((m): m is string => m != null),
      ),
    ).sort();
  }, [projects]);

  const locationOptions = useMemo(
    () =>
      Array.from(
        new Set(
          projects
            .map((p) => p.address?.split(",").pop()?.trim())
            .filter((c): c is string => !!c),
        ),
      ).sort(),
    [projects],
  );

  const visibleProjects = useMemo(
    () =>
      projects.filter((p) => {
        const city = p.address?.split(",").pop()?.trim();
        return (
          (!selectedMaturity || p.maturity === selectedMaturity) &&
          (!selectedSector || p.sector === selectedSector) &&
          (!selectedLocation || city === selectedLocation)
        );
      }),
    [projects, selectedMaturity, selectedSector, selectedLocation],
  );

  const resetFilters = () => {
    setSelectedMaturity(undefined);
    setSelectedSector(undefined);
    setSelectedLocation(undefined);
  };

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Select
          disabled={isLoading}
          value={selectedMaturity ?? ""}
          onValueChange={setSelectedMaturity}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a maturity" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Maturity</SelectLabel>
              {maturityOptions.map((m) => (
                <SelectItem key={m} value={m}>
                  {capitalize(m)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          disabled={isLoading}
          value={selectedSector ?? ""}
          onValueChange={setSelectedSector}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a sector" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sector</SelectLabel>
              {sectorOptions.map((m) => (
                <SelectItem key={m} value={m}>
                  {capitalize(m)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          disabled={isLoading}
          value={selectedLocation ?? ""}
          onValueChange={setSelectedLocation}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a city" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>City</SelectLabel>
              {locationOptions.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
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
        {isLoading
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
          : visibleProjects.map((project) => (
              <Card
                key={project.id}
                className="focus:ring-primary transform cursor-pointer transition duration-200 ease-out hover:scale-105 hover:shadow-lg focus:scale-105 focus:ring-2 focus:outline-none"
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription className="flex gap-1">
                    {
                      <Badge variant="secondary">
                        {project.address ?? "No address provided"}
                      </Badge>
                    }
                  </CardDescription>
                  <CardAction className="flex gap-2">
                    <Button variant="secondary" size="icon" className="size-8">
                      <a href={`mailto:${project.email}`}>
                        <MailIcon />
                      </a>
                    </Button>
                    {project.website_url ? (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="size-8"
                      >
                        <a href={project.website_url}>
                          <GlobeIcon />
                        </a>
                      </Button>
                    ) : null}
                  </CardAction>
                </CardHeader>
                <CardContent>
                  {project.description ?? "No description provided."}
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  );
}
