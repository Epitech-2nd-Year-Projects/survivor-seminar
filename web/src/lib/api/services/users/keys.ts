import type { ListUsersParams } from "./shared";

export const usersKeys = {
  all: ["users"] as const,
  list: (p?: ListUsersParams) => [...usersKeys.all, "list", p] as const,
  infinite: (p?: Omit<ListUsersParams, "page">) =>
    [...usersKeys.all, "infinite", p] as const,
  details: () => [...usersKeys.all, "details"] as const,
  detailById: (id: number) => [...usersKeys.all, { id }] as const,
  detailByEmail: (email: string) => [...usersKeys.all, { email }] as const,
  me: () => [...usersKeys.all, "me"] as const,
};
