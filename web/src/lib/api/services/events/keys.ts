import type { ListEventsParams } from "./shared";

export const eventsKeys = {
  all: ["events"] as const,
  list: (p?: ListEventsParams) => [...eventsKeys.all, "list", p] as const,
  infinite: (p?: Omit<ListEventsParams, "page">) =>
    [...eventsKeys.all, "infinite", p] as const,
  detail: (id: number) => [...eventsKeys.all, "detail", id] as const,
};
