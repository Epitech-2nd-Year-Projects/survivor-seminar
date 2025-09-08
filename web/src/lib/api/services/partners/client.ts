import { apiFetchClient } from "@/lib/api/http/client";
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

export type CreatePartnerBody = {
  name: string;
  legal_status?: string;
  address?: string;
  email: string;
  phone?: string;
  description?: string;
  partnership_type?: string;
};

export type UpdatePartnerBody = Partial<CreatePartnerBody>;

export async function listPartnersClient(p?: ListPartnersParams) {
  const res = await apiFetchClient<ListResponseDTO<PartnerDTO>>(
    `/partners${toPartnersQuery(p)}`,
  );
  return mapPaginatedPartners(res);
}

export async function getPartnerClient(id: number) {
  const res = await apiFetchClient<ItemResponseDTO<PartnerDTO>>(
    `/partners/${id}`,
  );
  return mapPartner(res.data);
}

export async function createPartnerClient(body: CreatePartnerBody) {
  const res = await apiFetchClient<ItemResponseDTO<PartnerDTO>>(
    `/admin/partners`,
    { method: "POST", body },
  );
  return mapPartner(res.data);
}

export async function updatePartnerClient(id: number, body: UpdatePartnerBody) {
  const res = await apiFetchClient<ItemResponseDTO<PartnerDTO>>(
    `/admin/partners/${id}`,
    { method: "PATCH", body },
  );
  return mapPartner(res.data);
}

export async function deletePartnerClient(id: number) {
  await apiFetchClient<void>(`/admin/partners/${id}`, { method: "DELETE" });
}
