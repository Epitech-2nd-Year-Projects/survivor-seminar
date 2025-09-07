import "server-only";
import { apiFetchServer } from "@/lib/api/http/server";
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

export async function listInvestorsServer(
  p?: ListInvestorsParams,
  revalidate = 60,
) {
  const res = await apiFetchServer<ListResponseDTO<InvestorDTO>>(
    `/investors${toInvestorsQuery(p)}`,
    { next: { revalidate, tags: ["events"] } },
  );
  return mapPaginatedInvestors(res);
}

export async function getInvestorServer(id: number, revalidate = 60) {
  const res = await apiFetchServer<ItemResponseDTO<InvestorDTO>>(
    `/investors/${id}`,
    { next: { revalidate, tags: [`event:${id}`] } },
  );
  return mapInvestor(res.data);
}
