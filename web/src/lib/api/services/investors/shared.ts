import type { ListResponseDTO, Paginated } from "@/lib/api/contracts/common";
import {
  mapInvestor,
  type InvestorDTO,
  type Investor as InvestorModel,
} from "@/lib/api/contracts/investors";

export type InvestorsSortField =
  | "id"
  | "name"
  | "email"
  | "created_at"
  | "investor_type"
  | "investment_focus";

export type SortOrder = "asc" | "desc";

export type ListInvestorsParams = {
  page?: number;
  perPage?: number;
  sort?: InvestorsSortField;
  order?: SortOrder;
};

export function toInvestorsQuery(p?: ListInvestorsParams): string {
  const qs = new URLSearchParams();
  if (p?.page) qs.set("page", String(p.page));
  if (p?.perPage) qs.set("per_page", String(p.perPage));
  if (p?.sort) qs.set("sort", p.sort);
  if (p?.order) qs.set("order", p.order);
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export function mapPaginatedInvestors(
  dto: ListResponseDTO<InvestorDTO>,
): Paginated<InvestorModel> {
  return {
    data: dto.data.map(mapInvestor),
    page: dto.pagination.page,
    perPage: dto.pagination.per_page,
    total: dto.pagination.total,
    hasNext: dto.pagination.has_next,
    hasPrev: dto.pagination.has_prev,
  };
}
