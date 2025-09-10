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
import { userMessageFromError } from "@/lib/api/http/messages";
import { useStartup } from "@/lib/api/services/startups/hooks";
import { generateStartupPdf } from "@/lib/generate-pdf";
import {
  DownloadIcon,
  GlobeIcon,
  MapPinnedIcon,
  RadioTowerIcon,
} from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { use } from "react";

type StartupPageProps = {
  params: Promise<{ id: string }>;
};

export default function StartupPage({ params }: StartupPageProps) {
  const { id: projectSlug } = use(params);
  const projectId = Number(projectSlug);

  const { data, isLoading, isError, error } = useStartup(projectId);

  if (isError) {
    console.log(error);
    return <div>Error: {userMessageFromError(error)}</div>;
  }

  const showSkeletons = isLoading && !data;

  if (showSkeletons) {
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

  if (!data) {
    notFound();
  }

  return (
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
                {data.name}
                <CardDescription>
                  {data.description ?? "No description provided."}
                </CardDescription>
              </div>
            </div>
            <CardAction className="flex gap-2">
              {data.address ? (
                <Badge variant="secondary" className="whitespace-normal">
                  <MapPinnedIcon className="h-4 w-4" />
                  {data.address}
                </Badge>
              ) : null}
              <Button
                variant="secondary"
                onClick={() =>
                  generateStartupPdf(data, { fileName: "startup-profile.pdf" })
                }
              >
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
            {/* TODO: Retrieve founders once API is ready */}
            {/*
            {data.founders.map((founder) => (
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
            */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
            <CardDescription>
              You can contact {data.name} by emailing{" "}
              <a
                href={`mailto:${data.email}`}
                className="font-white font-bold underline"
              >
                {data.email}
              </a>
              {data.phone ? (
                <>
                  <br />
                  or by calling{" "}
                  <a
                    href={`tel:${data.phone}`}
                    className="font-white font-bold underline"
                  >
                    {data.phone}
                  </a>
                </>
              ) : null}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {data.websiteUrl ? (
              <Button variant="secondary">
                <GlobeIcon />
                <a href={data.websiteUrl}>Visit {data.name}&apos;s website</a>
              </Button>
            ) : null}
            {data.socialMediaUrl ? (
              <Button variant="secondary">
                <RadioTowerIcon />
                <a href={data.socialMediaUrl}>
                  Follow {data.name} on social media
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
          {data.legalStatus ? (
            <Badge variant="secondary">{data.legalStatus}</Badge>
          ) : null}
          {data.projectStatus ? (
            <Badge variant="secondary">{data.projectStatus}</Badge>
          ) : null}
          {data.needs ? <Badge variant="secondary">{data.needs}</Badge> : null}
          {data.sector ? (
            <Badge variant="secondary">{data.sector}</Badge>
          ) : null}
          {data.maturity ? (
            <Badge variant="secondary">{data.maturity}</Badge>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
