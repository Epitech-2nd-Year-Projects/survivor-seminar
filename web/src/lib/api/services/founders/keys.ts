import type { ListFoundersParams } from "./shared";

export const foundersKeys = {
  all: ["founders"] as const,
  list: (p?: ListFoundersParams) => [...foundersKeys.all, "list", p] as const,
  infinite: (p?: Omit<ListFoundersParams, "page">) =>
    [...foundersKeys.all, "infinite", p] as const,
  detail: (id: number) => [...foundersKeys.all, "detail", id] as const,
};
