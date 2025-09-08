import type { ListResponseDTO, Paginated } from "@/lib/api/contracts/common";
import {
  mapNews,
  type NewsDTO,
  type News as NewsModel,
} from "../../contracts/news";

export type NewsSortField =
  | "id"
  | "title"
  | "news_date"
  | "category"
  | "startup_id"
  | "created_at"
  | "updated_at";

export type SortOrder = "asc" | "desc";

export type ListNewsParams = {
  page?: number;
  perPage?: number;
  sort?: NewsSortField;
  order?: SortOrder;
};

export function toNewsQuery(p?: ListNewsParams): string {
  const qs = new URLSearchParams();
  if (p?.page) qs.set("page", String(p.page));
  if (p?.perPage) qs.set("per_page", String(p.perPage));
  if (p?.sort) qs.set("sort", p.sort);
  if (p?.order) qs.set("order", p.order);
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export function mapPaginatedNews(
  dto: ListResponseDTO<NewsDTO>,
): Paginated<NewsModel> {
  return {
    data: dto.data.map(mapNews),
    page: dto.pagination.page,
    perPage: dto.pagination.per_page,
    total: dto.pagination.total,
    hasNext: dto.pagination.has_next,
    hasPrev: dto.pagination.has_previous,
  };
}
