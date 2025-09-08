import { apiFetchClient } from "@/lib/api/http/client";
import type {
  ListResponseDTO,
  ItemResponseDTO,
} from "@/lib/api/contracts/common";
import {
  mapPaginatedInvestors,
  toInvestorsQuery,
  type ListInvestorsParams,
} from "./shared";
import { mapInvestor, type InvestorDTO } from "../../contracts/investors";

export type CreateInvestorBody = {
  name: string;
  legal_status?: string;
  address?: string;
  email: string;
  phone?: string;
  description?: string;
  investor_type?: string;
  investment_focus?: string;
};

export type UpdateInvestorBody = Partial<CreateInvestorBody>;

export async function listInvestorsClient(p?: ListInvestorsParams) {
  const res = await apiFetchClient<ListResponseDTO<InvestorDTO>>(
    `/investors${toInvestorsQuery(p)}`,
  );
  return mapPaginatedInvestors(res);
}

export async function getInvestorClient(id: number) {
  const res = await apiFetchClient<ItemResponseDTO<InvestorDTO>>(
    `/investors/${id}`,
  );
  return mapInvestor(res.data);
}

export async function createInvestorClient(body: CreateInvestorBody) {
  const res = await apiFetchClient<ItemResponseDTO<InvestorDTO>>(
    `/admin/investors`,
    { method: "POST", body },
  );
  return mapInvestor(res.data);
}

export async function updateInvestorClient(
  id: number,
  body: UpdateInvestorBody,
) {
  const res = await apiFetchClient<ItemResponseDTO<InvestorDTO>>(
    `/admin/investors/${id}`,
    { method: "PATCH", body },
  );
  return mapInvestor(res.data);
}

export async function deleteInvestorClient(id: number) {
  await apiFetchClient<void>(`/admin/investors/${id}`, { method: "DELETE" });
}
