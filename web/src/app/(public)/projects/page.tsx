import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ProjectBadge {
  variant: "default" | "destructive";
  label: string;
}

interface Project {
  name: string;
  description: string;
  imageUrl: string;
  badges: ProjectBadge[];
}

const projects: Project[] = [
  {
    name: "Netflix",
    description: "Netflix is the world's leading streaming service",
    imageUrl: "/projects/Netflix.png",
    badges: [
      {
        variant: "default",
        label: "🎥 Streaming",
      },
      {
        variant: "destructive",
        label: "🔴 Live",
      },
    ],
  },
  {
    name: "TreeLife",
    description: "TreeLife is a tree-planting app that helps you save trees",
    imageUrl: "/projects/TreeLife.png",
    badges: [
      {
        variant: "default",
        label: "🌳 Environment",
      },
    ],
  },
  {
    name: "TekWeather",
    description: "TekWeather is a weather app that helps you plan your day",
    imageUrl: "/projects/TekWeather.png",
    badges: [
      {
        variant: "default",
        label: "🌡️ Weather",
      },
      {
        variant: "destructive",
        label: "🔴 Live",
      },
    ],
  },
];

export default function Projects() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <div
          key={project.name}
          className="flex items-center gap-4 rounded-md bg-zinc-800 p-6"
        >
          <div className="rounded-lg border-2 border-zinc-600 bg-zinc-900 p-6">
            <Image
              src={project.imageUrl}
              alt={project.name}
              width={64}
              height={64}
              className="rounded-lg"
            />
          </div>
          <div className="flex grow flex-col gap-2">
            <div className="text-2xl font-semibold">{project.name}</div>
            <div className="flex items-center gap-2">
              {project.badges.map((badge) => (
                <Badge key={badge.label} variant={badge.variant}>
                  {badge.label}
                </Badge>
              ))}
            </div>
            <Button variant="outline">See more</Button>
          </div>
        </div>
      ))}
    </div>
  );
}
