import "server-only";
import { apiFetchServer } from "@/lib/api/http/server";
import type {
  ListResponseDTO,
  ItemResponseDTO,
} from "@/lib/api/contracts/common";
import {
  mapPaginatedFounders,
  toFoundersQuery,
  type ListFoundersParams,
} from "./shared";
import { mapFounder, type FounderDTO } from "../../contracts/founders";

export async function listFoundersServer(
  p?: ListFoundersParams,
  revalidate = 60,
) {
  const res = await apiFetchServer<ListResponseDTO<FounderDTO>>(
    `/founders${toFoundersQuery(p)}`,
    { next: { revalidate, tags: ["founders"] } },
  );
  return mapPaginatedFounders(res);
}

export async function getFounderServer(id: number, revalidate = 60) {
  const res = await apiFetchServer<ItemResponseDTO<FounderDTO>>(
    `/founders/${id}`,
    {
      next: { revalidate, tags: [`founder:${id}`] },
    },
  );
  return mapFounder(res.data);
}
