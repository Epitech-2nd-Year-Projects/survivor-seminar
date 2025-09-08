import type { ListStartupsParams } from "./shared";

export const startupsKeys = {
  all: ["startups"] as const,
  list: (p?: ListStartupsParams) => [...startupsKeys.all, "list", p] as const,
  infinite: (p?: Omit<ListStartupsParams, "page">) =>
    [...startupsKeys.all, "infinite", p] as const,
  detail: (id: number) => [...startupsKeys.all, "detail", id] as const,
};
