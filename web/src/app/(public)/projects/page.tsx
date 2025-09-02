"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
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
import { capitalize } from "@/lib/utils";
import type { Project } from "@/types";
import {
  GlobeIcon,
  ListRestartIcon,
  MailIcon,
  PhoneCallIcon,
  RadioTowerIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

const projects: Project[] = [
  {
    id: 1,
    name: "Alpha Tech",
    legalStatus: "LLC",
    address: "123 Maple Street, Springfield",
    email: "contact@alphatech.com",
    phone: "(555) 123-4567",
    createdAt: "2023-06-15T10:30:00Z",
    description: "A cutting-edge AI-driven marketing platform.",
    websiteUrl: "https://www.alphatech.com",
    socialMediaUrl: "https://twitter.com/alphatech",
    projectStatus: "active",
    needs: "seed funding",
    sector: "Marketing Tech",
    maturity: "early",
    founders: [
      { id: 1, name: "Alice Johnson", startupId: 1 },
      { id: 2, name: "Bob Smith", startupId: 1 },
    ],
  },
  {
    id: 2,
    name: "Beta Innovations",
    legalStatus: "Corporation",
    address: null,
    email: "info@betainnovations.io",
    phone: null,
    createdAt: "2022-01-20T14:45:00Z",
    description: null,
    websiteUrl: "https://betainnovations.io",
    socialMediaUrl: null,
    projectStatus: "pilot",
    needs: "partnerships",
    sector: "Healthcare",
    maturity: "prototype",
    founders: [{ id: 3, name: "Carlos Reyes", startupId: 2 }],
  },
  {
    id: 3,
    name: "Gamma Robotics",
    legalStatus: null,
    address: "456 Oak Avenue, Metropolis",
    email: "hello@gammarobotics.com",
    phone: "(555) 987-6543",
    createdAt: "2021-11-05T08:15:00Z",
    description: "Robotic solutions for warehouse automation.",
    websiteUrl: null,
    socialMediaUrl: "https://linkedin.com/company/gammarobotics",
    projectStatus: "development",
    needs: null,
    sector: "Robotics",
    maturity: "growth",
    founders: [
      { id: 4, name: "Dana Lee", startupId: 3 },
      { id: 5, name: "Evan Zhou", startupId: 3 },
    ],
  },
];

export default function Projects() {
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
  }, []);

  const sectorOptions = useMemo(() => {
    return Array.from(
      new Set(
        projects.map((p) => p.sector).filter((m): m is string => m != null),
      ),
    ).sort();
  }, []);

  const locationOptions = useMemo(
    () =>
      Array.from(
        new Set(
          projects
            .map((p) => p.address?.split(",").pop()?.trim())
            .filter((c): c is string => !!c),
        ),
      ).sort(),
    [],
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
    [selectedMaturity, selectedSector, selectedLocation],
  );

  const resetFilters = () => {
    setSelectedMaturity(undefined);
    setSelectedSector(undefined);
    setSelectedLocation(undefined);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Select
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
        <Select value={selectedSector ?? ""} onValueChange={setSelectedSector}>
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
          variant="secondary"
          size="icon"
          className="size-8"
          onClick={resetFilters}
        >
          <ListRestartIcon />
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visibleProjects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription className="flex gap-1">
                {
                  <Badge variant="secondary">
                    {project.address ?? "No address provided"}
                  </Badge>
                }
                {project.legalStatus ? (
                  <Badge variant="outline">{project.legalStatus}</Badge>
                ) : null}
              </CardDescription>
              <CardAction className="flex gap-2">
                {project.socialMediaUrl ? (
                  <Button variant="secondary" size="icon" className="size-8">
                    <a href={project.socialMediaUrl}>
                      <RadioTowerIcon />
                    </a>
                  </Button>
                ) : null}
                {project.websiteUrl ? (
                  <Button variant="secondary" size="icon" className="size-8">
                    <a href={project.websiteUrl}>
                      <GlobeIcon />
                    </a>
                  </Button>
                ) : null}
              </CardAction>
            </CardHeader>
            <CardContent>
              {project.description ?? "No description provided."}
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="secondary" size="icon" className="size-8">
                <a href={`mailto:${project.email}`}>
                  <MailIcon />
                </a>
              </Button>
              {project.phone ? (
                <Button variant="secondary" size="icon" className="size-8">
                  <a href={`tel:${project.phone}`}>
                    <PhoneCallIcon />
                  </a>
                </Button>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {project.maturity ? (
                  <Badge variant="outline" className="capitalize">
                    {project.maturity}
                  </Badge>
                ) : null}
                {project.projectStatus ? (
                  <Badge variant="outline" className="capitalize">
                    {project.projectStatus}
                  </Badge>
                ) : null}
                {project.needs ? (
                  <Badge variant="outline" className="capitalize">
                    {project.needs}
                  </Badge>
                ) : null}
                {project.sector ? (
                  <Badge variant="outline" className="capitalize">
                    {project.sector}
                  </Badge>
                ) : null}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
