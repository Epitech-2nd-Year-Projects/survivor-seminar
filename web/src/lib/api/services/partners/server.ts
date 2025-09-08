import "server-only";
import { apiFetchServer } from "@/lib/api/http/server";
import type {
  ListResponseDTO,
  ItemResponseDTO,
} from "@/lib/api/contracts/common";
import {
  mapPaginatedPartners,
  toPartnersQuery,
  type ListPartnersParams,
} from "./shared";
import { mapPartner, type PartnerDTO } from "../../contracts/partners";

export async function listPartnersServer(
  p?: ListPartnersParams,
  revalidate = 60,
) {
  const res = await apiFetchServer<ListResponseDTO<PartnerDTO>>(
    `/partners${toPartnersQuery(p)}`,
    { next: { revalidate, tags: ["events"] } },
  );
  return mapPaginatedPartners(res);
}

export async function getPartnerServer(id: number, revalidate = 60) {
  const res = await apiFetchServer<ItemResponseDTO<PartnerDTO>>(
    `/partners/${id}`,
    { next: { revalidate, tags: [`event:${id}`] } },
  );
  return mapPartner(res.data);
}
