import type { ListResponseDTO, Paginated } from "@/lib/api/contracts/common";
import {
  mapStartup,
  type StartupDTO,
  type Startup as StartupModel,
} from "../../contracts/startups";

export type StartupsSortField = "id";

export type SortOrder = "asc" | "desc";

export type ListStartupsParams = {
  page?: number;
  perPage?: number;
  sort?: StartupsSortField;
  order?: SortOrder;
};

export function toStartupsQuery(p?: ListStartupsParams): string {
  const qs = new URLSearchParams();
  if (p?.page) qs.set("page", String(p.page));
  if (p?.perPage) qs.set("per_page", String(p.perPage));
  if (p?.sort) qs.set("sort", p.sort);
  if (p?.order) qs.set("order", p.order);
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export function mapPaginatedStartups(
  dto: ListResponseDTO<StartupDTO>,
): Paginated<StartupModel> {
  return {
    data: dto.data.map(mapStartup),
    page: dto.pagination.page,
    perPage: dto.pagination.per_page,
    total: dto.pagination.total,
    hasNext: dto.pagination.has_next,
    hasPrev: dto.pagination.has_prev,
  };
}
