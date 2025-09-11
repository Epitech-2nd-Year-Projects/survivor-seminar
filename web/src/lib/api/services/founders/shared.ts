import type { ListResponseDTO, Paginated } from "@/lib/api/contracts/common";
import {
  mapFounder,
  type FounderDTO,
  type Founder as FounderModel,
} from "../../contracts/founders";

export type FoundersSortField = "id" | "created_at";

export type SortOrder = "asc" | "desc";

export type ListFoundersParams = {
  page?: number;
  perPage?: number;
  sort?: FoundersSortField;
  order?: SortOrder;
};

export function toFoundersQuery(p?: ListFoundersParams): string {
  const qs = new URLSearchParams();
  if (p?.page) qs.set("page", String(p.page));
  if (p?.perPage) qs.set("per_page", String(p.perPage));
  if (p?.sort) qs.set("sort", p.sort);
  if (p?.order) qs.set("order", p.order);
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export function mapPaginatedFounders(
  dto: ListResponseDTO<FounderDTO>,
): Paginated<FounderModel> {
  return {
    data: dto.data.map(mapFounder),
    page: dto.pagination.page,
    perPage: dto.pagination.per_page,
    total: dto.pagination.total,
    hasNext: dto.pagination.has_next,
    hasPrev: dto.pagination.has_prev,
  };
}
