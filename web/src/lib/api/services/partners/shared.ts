import type { ListResponseDTO, Paginated } from "@/lib/api/contracts/common";
import {
  mapPartner,
  type PartnerDTO,
  type Partner as PartnerModel,
} from "../../contracts/partners";

export type PartnersSortField =
  | "id"
  | "name"
  | "email"
  | "legal_status"
  | "partnership_type"
  | "created_at";

export type SortOrder = "asc" | "desc";

export type ListPartnersParams = {
  page?: number;
  perPage?: number;
  sort?: PartnersSortField;
  order?: SortOrder;
};

export function toPartnersQuery(p?: ListPartnersParams): string {
  const qs = new URLSearchParams();
  if (p?.page) qs.set("page", String(p.page));
  if (p?.perPage) qs.set("per_page", String(p.perPage));
  if (p?.sort) qs.set("sort", p.sort);
  if (p?.order) qs.set("order", p.order);
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export function mapPaginatedPartners(
  dto: ListResponseDTO<PartnerDTO>,
): Paginated<PartnerModel> {
  return {
    data: dto.data.map(mapPartner),
    page: dto.pagination.page,
    perPage: dto.pagination.per_page,
    total: dto.pagination.total,
    hasNext: dto.pagination.has_next,
    hasPrev: dto.pagination.has_prev,
  };
}
