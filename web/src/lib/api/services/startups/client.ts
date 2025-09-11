import { apiFetchClient } from "@/lib/api/http/client";
import type {
  ListResponseDTO,
  ItemResponseDTO,
} from "@/lib/api/contracts/common";
import {
  mapPaginatedStartups,
  toStartupsQuery,
  type ListStartupsParams,
} from "./shared";
import { mapStartup, type StartupDTO } from "../../contracts/startups";

export type CreateStartupBody = {
  name: string;
  email?: string | null;
  phone?: string | null;
  legal_status?: string | null;
  address?: string | null;
  website_url?: string | null;
  social_media_url?: string | null;
  project_status?: string | null;
  needs?: string | null;
  sector?: string | null;
  maturity?: string | null;
  description?: string | null;
};

export type UpdateStartupBody = Partial<CreateStartupBody>;

export async function listStartupsClient(p?: ListStartupsParams) {
  const res = await apiFetchClient<ListResponseDTO<StartupDTO>>(
    `/startups${toStartupsQuery(p)}`,
  );
  return mapPaginatedStartups(res);
}

export async function getStartupClient(id: number) {
  const res = await apiFetchClient<ItemResponseDTO<StartupDTO>>(
    `/startups/${id}`,
  );
  return mapStartup(res.data);
}

export async function incrementStartupViewsClient(id: number) {
  await apiFetchClient<void>(`/startups/${id}/views`, {
    method: "POST",
  });
}

export async function createStartupClient(body: CreateStartupBody) {
  const res = await apiFetchClient<ItemResponseDTO<StartupDTO>>(
    `/admin/startups`,
    { method: "POST", body },
  );
  return mapStartup(res.data);
}

export async function updateStartupClient(id: number, body: UpdateStartupBody) {
  const res = await apiFetchClient<ItemResponseDTO<StartupDTO>>(
    `/admin/startups/${id}`,
    { method: "PATCH", body },
  );
  return mapStartup(res.data);
}

export async function deleteStartupClient(id: number) {
  await apiFetchClient<void>(`/admin/startups/${id}`, { method: "DELETE" });
}
