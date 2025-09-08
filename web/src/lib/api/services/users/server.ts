import "server-only";
import { apiFetchServer } from "@/lib/api/http/server";
import type {
  ListResponseDTO,
  ItemResponseDTO,
} from "@/lib/api/contracts/common";
import {
  mapPaginatedUsers,
  toUsersQuery,
  type ListUsersParams,
} from "./shared";
import { mapUser, type UserDTO } from "../../contracts/users";

export async function listEventsServer(p?: ListUsersParams, revalidate = 60) {
  const res = await apiFetchServer<ListResponseDTO<UserDTO>>(
    `/users${toUsersQuery(p)}`,
    { next: { revalidate, tags: ["events"] } },
  );
  return mapPaginatedUsers(res);
}

export async function getEventServer(id: number, revalidate = 60) {
  const res = await apiFetchServer<ItemResponseDTO<UserDTO>>(`/users/${id}`, {
    next: { revalidate, tags: [`event:${id}`] },
  });
  return mapUser(res.data);
}
