import type { ListPartnersParams } from "./shared";

export const partnersKeys = {
  all: ["partners"] as const,
  list: (p?: ListPartnersParams) => [...partnersKeys.all, "list", p] as const,
  infinite: (p?: Omit<ListPartnersParams, "page">) =>
    [...partnersKeys.all, "infinite", p] as const,
  detail: (id: number) => [...partnersKeys.all, "detail", id] as const,
};
