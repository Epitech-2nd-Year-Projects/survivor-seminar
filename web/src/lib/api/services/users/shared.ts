import type { ListResponseDTO, Paginated } from "@/lib/api/contracts/common";
import {
  mapUser,
  type UserDTO,
  type User as UserModel,
} from "@/lib/api/contracts/users";

export type UsersSortField =
  | "id"
  | "email"
  | "name"
  | "role"
  | "created_at"
  | "updated_at";

export type SortOrder = "asc" | "desc";

export type ListUsersParams = {
  page?: number;
  perPage?: number;
  sort?: UsersSortField;
  order?: SortOrder;
};

export function toUsersQuery(p?: ListUsersParams): string {
  const qs = new URLSearchParams();
  if (p?.page) qs.set("page", String(p.page));
  if (p?.perPage) qs.set("per_page", String(p.perPage));
  if (p?.sort) qs.set("sort", p.sort);
  if (p?.order) qs.set("order", p.order);
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export function mapPaginatedUsers(
  dto: ListResponseDTO<UserDTO>,
): Paginated<UserModel> {
  return {
    data: dto.data.map(mapUser),
    page: dto.pagination.page,
    perPage: dto.pagination.per_page,
    total: dto.pagination.total,
    hasNext: dto.pagination.has_next,
    hasPrev: dto.pagination.has_previous,
  };
}
