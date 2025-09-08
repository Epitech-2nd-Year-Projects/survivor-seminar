import type { ListInvestorsParams } from "./shared";

export const investorsKeys = {
  all: ["investors"] as const,
  list: (p?: ListInvestorsParams) => [...investorsKeys.all, "list", p] as const,
  infinite: (p?: Omit<ListInvestorsParams, "page">) =>
    [...investorsKeys.all, "infinite", p] as const,
  detail: (id: number) => [...investorsKeys.all, "detail", id] as const,
};
