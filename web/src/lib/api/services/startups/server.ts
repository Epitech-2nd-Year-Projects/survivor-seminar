import "server-only";
import { apiFetchServer } from "@/lib/api/http/server";
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

export async function listStartupsServer(
  p?: ListStartupsParams,
  revalidate = 60,
) {
  const res = await apiFetchServer<ListResponseDTO<StartupDTO>>(
    `/startups${toStartupsQuery(p)}`,
    { next: { revalidate, tags: ["startups"] } },
  );
  return mapPaginatedStartups(res);
}

export async function getStartupServer(id: number, revalidate = 60) {
  const res = await apiFetchServer<ItemResponseDTO<StartupDTO>>(
    `/startups/${id}`,
    { next: { revalidate, tags: [`startup:${id}`] } },
  );
  return mapStartup(res.data);
}
