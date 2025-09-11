import "server-only";
import { apiFetchServer } from "@/lib/api/http/server";
import type {
  ListResponseDTO,
  ItemResponseDTO,
} from "@/lib/api/contracts/common";
import {
  mapPaginatedOpportunities,
  toOpportunitiesQuery,
  type ListOpportunitiesParams,
} from "./shared";
import {
  mapOpportunity,
  type OpportunityDTO,
} from "../../contracts/opportunities";

export async function listOpportunitiesServer(
  p?: ListOpportunitiesParams,
  revalidate = 60,
) {
  const res = await apiFetchServer<ListResponseDTO<OpportunityDTO>>(
    `/opportunities${toOpportunitiesQuery(p)}`,
    { next: { revalidate, tags: ["opportunities"] } },
  );
  return mapPaginatedOpportunities(res);
}

export async function getOpportunityServer(id: number, revalidate = 60) {
  const res = await apiFetchServer<ItemResponseDTO<OpportunityDTO>>(
    `/opportunities/${id}`,
    { next: { revalidate, tags: [`opportunity:${id}`] } },
  );
  return mapOpportunity(res.data);
}
