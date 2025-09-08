import type { ListNewsParams } from "./shared";

export const newsKeys = {
  all: ["news"] as const,
  list: (p?: ListNewsParams) => [...newsKeys.all, "list", p] as const,
  infinite: (p?: Omit<ListNewsParams, "page">) =>
    [...newsKeys.all, "infinite", p] as const,
  detail: (id: number) => [...newsKeys.all, "detail", id] as const,
};
