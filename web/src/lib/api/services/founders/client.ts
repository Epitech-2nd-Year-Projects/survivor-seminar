import { apiFetchClient } from "@/lib/api/http/client";
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

export async function listFoundersClient(p?: ListFoundersParams) {
  const res = await apiFetchClient<ListResponseDTO<FounderDTO>>(
    `/founders${toFoundersQuery(p)}`,
  );
  return mapPaginatedFounders(res);
}

export async function getFounderClient(id: number) {
  const res = await apiFetchClient<ItemResponseDTO<FounderDTO>>(
    `/founders/${id}`,
  );
  return mapFounder(res.data);
}
