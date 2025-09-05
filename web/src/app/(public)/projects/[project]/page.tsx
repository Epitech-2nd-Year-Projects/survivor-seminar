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
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProject } from "@/lib/fetchers";
import type { Project } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  DownloadIcon,
  GlobeIcon,
  MapPinnedIcon,
  RadioTowerIcon,
} from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { use, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { PitchDeckSlides } from "@/components/pitch-deck-slides";

type ProjectPageProps = {
  params: Promise<{ project: string }>;
};

export default function ProjectPage({ params }: ProjectPageProps) {
  const { project: projectSlug } = use(params);
  const projectId = Number(projectSlug);

  const deckRef = useRef<HTMLDivElement>(null);

  const {
    data: project,
    isLoading,
    isError,
    error,
  } = useQuery<Project, Error>({
    queryKey: ["project", projectId],
    queryFn: () => fetchProject(projectId),
    enabled: !isNaN(projectId),
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <CardTitle>
                  <Skeleton className="h-12 w-12 rounded-md" />
                </CardTitle>
                <div>
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
              <CardAction className="flex gap-2">
                <Skeleton className="h-6 w-20" />
              </CardAction>
            </CardHeader>
          </Card>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Founders</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-center gap-2 md:justify-start">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center gap-2"
                >
                  <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-zinc-800">
                    <Skeleton className="h-16 w-16 rounded-full" />
                  </div>
                  <Badge variant="secondary">
                    <Skeleton className="h-4 w-1/2" />
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
              <CardDescription>
                <Skeleton className="h-4 w-1/2" />
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project) {
    notFound();
  }

  const exportPDF = async () => {
    if (!deckRef.current) return;

    const slides = deckRef.current.querySelectorAll<HTMLDivElement>(".slide");
    const doc = new jsPDF({
      unit: "px",
      format: [1122, 793],
      orientation: "landscape",
    });

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      if (!slide) continue;
      const canvas = await html2canvas(slide, {
        scale: 2,
        onclone: (clonedDoc) => {
          clonedDoc.querySelectorAll<HTMLElement>("*").forEach((cloneEl) => {
            const cs = window.getComputedStyle(cloneEl);
            cloneEl.style.cssText = cs.cssText;
            cloneEl.removeAttribute("class");
          });
        },
      });
      const imgData = canvas.toDataURL("image/png");
      doc.addImage(imgData, "PNG", 0, 0, 1122, 793);
      if (i < slides.length - 1) doc.addPage();
    }

    doc.save(`${project.name}-pitch-deck.pdf`);
  };

  return (
    <>
      <div ref={deckRef} className="ppt-container">
        <PitchDeckSlides project={project} />
      </div>
      <div className="flex flex-col gap-4">
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <CardTitle>
                  <Image
                    src="/LoginImage.png"
                    alt="Logo"
                    width={120}
                    height={120}
                    className="rounded-md border-2 border-zinc-800"
                  />
                </CardTitle>
                <div>
                  {project.name}
                  <CardDescription>
                    {project.description ?? "No description provided."}
                  </CardDescription>
                </div>
              </div>
              <CardAction className="flex gap-2">
                {project.address ? (
                  <Badge variant="secondary" className="whitespace-normal">
                    <MapPinnedIcon className="h-4 w-4" />
                    {project.address}
                  </Badge>
                ) : null}
                <Button variant="secondary" onClick={exportPDF}>
                  <DownloadIcon className="h-4 w-4" />
                  Export PDF
                </Button>
              </CardAction>
            </CardHeader>
          </Card>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Founders</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-center gap-2 md:justify-start">
              {project.founders.map((founder) => (
                <div
                  key={founder.id}
                  className="flex flex-col items-center justify-center gap-2"
                >
                  <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-zinc-800">
                    <Image
                      src="/Founder.jpg"
                      alt="Founder"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Badge variant="secondary">{founder.name}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
              <CardDescription>
                You can contact {project.name} by emailing{" "}
                <a
                  href={`mailto:${project.email}`}
                  className="font-white font-bold underline"
                >
                  {project.email}
                </a>
                {project.phone ? (
                  <>
                    <br />
                    or by calling{" "}
                    <a
                      href={`tel:${project.phone}`}
                      className="font-white font-bold underline"
                    >
                      {project.phone}
                    </a>
                  </>
                ) : null}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {project.website_url ? (
                <Button variant="secondary">
                  <GlobeIcon />
                  <a href={project.website_url}>
                    Visit {project.name}&apos;s website
                  </a>
                </Button>
              ) : null}
              {project.social_media_url ? (
                <Button variant="secondary">
                  <RadioTowerIcon />
                  <a href={project.social_media_url}>
                    Follow {project.name} on social media
                  </a>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {project.legal_status ? (
              <Badge variant="secondary">{project.legal_status}</Badge>
            ) : null}
            {project.project_status ? (
              <Badge variant="secondary">{project.project_status}</Badge>
            ) : null}
            {project.needs ? (
              <Badge variant="secondary">{project.needs}</Badge>
            ) : null}
            {project.sector ? (
              <Badge variant="secondary">{project.sector}</Badge>
            ) : null}
            {project.maturity ? (
              <Badge variant="secondary">{project.maturity}</Badge>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
