import type { ListOpportunitiesParams } from "./shared";

export const opportunitiesKeys = {
  all: ["opportunities"] as const,
  list: (p?: ListOpportunitiesParams) =>
    [...opportunitiesKeys.all, "list", p] as const,
  infinite: (p?: Omit<ListOpportunitiesParams, "page">) =>
    [...opportunitiesKeys.all, "infinite", p] as const,
  detail: (id: number) => [...opportunitiesKeys.all, "detail", id] as const,
};
