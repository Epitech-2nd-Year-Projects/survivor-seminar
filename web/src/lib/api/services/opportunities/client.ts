import { apiFetchClient } from "@/lib/api/http/client";
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

export type CreateOpportunitiesBody = {
  title: string;
  type: string;
  organism: string;
  description?: string;
  criteria?: string;
  external_link?: string;
  deadline?: string;
};

export type UpdateOpportunityBody = Partial<CreateOpportunitiesBody>;

export async function listOpportunitiesClient(p?: ListOpportunitiesParams) {
  const res = await apiFetchClient<ListResponseDTO<OpportunityDTO>>(
    `/opportunities${toOpportunitiesQuery(p)}`,
  );
  return mapPaginatedOpportunities(res);
}

export async function getOpportunityClient(id: number) {
  const res = await apiFetchClient<ItemResponseDTO<OpportunityDTO>>(
    `/opportunities/${id}`,
  );
  return mapOpportunity(res.data);
}

export async function createOpportunityClient(body: CreateOpportunitiesBody) {
  const res = await apiFetchClient<ItemResponseDTO<OpportunityDTO>>(
    `/admin/opportunities`,
    { method: "POST", body },
  );
  return mapOpportunity(res.data);
}

export async function updateOpportunityClient(
  id: number,
  body: UpdateOpportunityBody,
) {
  const res = await apiFetchClient<ItemResponseDTO<OpportunityDTO>>(
    `/admin/opportunities/${id}`,
    { method: "PATCH", body },
  );
  return mapOpportunity(res.data);
}

export async function deleteOpportunityClient(id: number) {
  await apiFetchClient<void>(`/admin/opportunities/${id}`, {
    method: "DELETE",
  });
}
