import type { ListResponseDTO, Paginated } from "@/lib/api/contracts/common";
import {
  mapOpportunity,
  type OpportunityDTO,
  type Opportunity as OpportunityModel,
} from "../../contracts/opportunities";

export type OpportunitiesSortField =
  | "id"
  | "title"
  | "type"
  | "organism"
  | "deadline"
  | "created_at"
  | "updated_at";

export type SortOrder = "asc" | "desc";

export type ListOpportunitiesParams = {
  page?: number;
  perPage?: number;
  sort?: OpportunitiesSortField;
  order?: SortOrder;
};

export function toOpportunitiesQuery(p?: ListOpportunitiesParams): string {
  const qs = new URLSearchParams();
  if (p?.page) qs.set("page", String(p.page));
  if (p?.perPage) qs.set("per_page", String(p.perPage));
  if (p?.sort) qs.set("sort", p.sort);
  if (p?.order) qs.set("order", p.order);
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export function mapPaginatedOpportunities(
  dto: ListResponseDTO<OpportunityDTO>,
): Paginated<OpportunityModel> {
  return {
    data: dto.data.map(mapOpportunity),
    page: dto.pagination.page,
    perPage: dto.pagination.per_page,
    total: dto.pagination.total,
    hasNext: dto.pagination.has_next,
    hasPrev: dto.pagination.has_previous,
  };
}
