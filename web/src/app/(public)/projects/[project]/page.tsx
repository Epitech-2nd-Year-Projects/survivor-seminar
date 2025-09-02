import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Project } from "@/types";
import Image from "next/image";
import { notFound } from "next/navigation";

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

export default async function Project({
  params,
}: {
  params: Promise<{ project: number }>;
}) {
  const { project: projectId } = await params;
  const projectData = projects.find((p) => p.id === Number(projectId));

  if (!projectData) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-4">
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
              {projectData.name}
              <CardDescription>
                {projectData.description ?? "No description provided."}
              </CardDescription>
            </div>
          </div>
          <CardAction className="flex gap-2">
            {projectData.address ? (
              <Badge variant="secondary">📍 {projectData.address}</Badge>
            ) : null}
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  );
}
