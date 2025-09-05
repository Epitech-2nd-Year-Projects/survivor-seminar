import type { Project, User } from "@/types";

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

interface GetUsersApiResponse {
  data: User[];
}

interface GetUserApiResponse {
  data: User;
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

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch("/api/v1/users");

  if (!res.ok) {
    throw new Error(`Failed to fetch projects: ${res.status}`);
  }

  const json = (await res.json()) as GetUsersApiResponse;
  return json.data;
}

export async function fetchUser(id: number): Promise<User> {
  const res = await fetch(`/api/v1/users/${id}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch project: ${res.status}`);
  }

  const json = (await res.json()) as GetUserApiResponse;
  return json.data;
}
