import type {
  User,
  Event,
  News,
  Opportunity,
  Pagination,
  Project,
} from "@/types";

interface GetProjectsApiResponse {
  data: Project[];
  pagination: Pagination;
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

interface GetEventsApiResponse {
  data: Event[];
  pagination: Pagination;
}

interface GetNewsApiResponse {
  data: News[];
  pagination: Pagination;
}

interface GetOpportunitiesApiResponse {
  data: Opportunity[];
  pagination: Pagination;
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

export async function fetchEvents(): Promise<Event[]> {
  const res = await fetch("/api/v1/events");

  if (!res.ok) {
    throw new Error(`Failed to fetch events: ${res.status}`);
  }

  const json = (await res.json()) as GetEventsApiResponse;
  return json.data;
}

export async function fetchNews(): Promise<News[]> {
  const res = await fetch("/api/v1/news");

  if (!res.ok) {
    throw new Error(`Failed to fetch news: ${res.status}`);
  }

  const json = (await res.json()) as GetNewsApiResponse;
  return json.data;
}

export async function fetchOpportunities(): Promise<Opportunity[]> {
  const res = await fetch("/api/v1/opportunities");

  if (!res.ok) {
    throw new Error(`Failed to fetch opportunities: ${res.status}`);
  }

  const json = (await res.json()) as GetOpportunitiesApiResponse;
  return json.data;
}
