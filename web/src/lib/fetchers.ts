import type { Project } from "@/types";

interface GetProjectsApiResponse {
  data: Project[];
  pagination: {
    has_next: boolean;
    has_prev: boolean;
    page: number;
    per_page: number;
    total: number;
  };
}

interface GetProjectApiResponse {
  data: Project;
}

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch("/api/v1/startups");

  if (!res.ok) {
    throw new Error(`Failed to fetch projects: ${res.status}`);
  }

  const json = (await res.json()) as GetProjectsApiResponse;
  return json.data;
}

export async function fetchProject(id: number): Promise<Project> {
  const res = await fetch(`/api/v1/startups/${id}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch project: ${res.status}`);
  }

  const json = (await res.json()) as GetProjectApiResponse;
  return json.data;
}
