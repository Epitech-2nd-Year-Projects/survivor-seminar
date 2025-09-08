import { apiFetchClient } from "@/lib/api/http/client";
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

export type CreateUserBody = {
  email: string;
  name: string;
  role: string;
  password: string;
  image_url?: string;
};

export type UpdateUserBody = Partial<CreateUserBody>;

export async function listUsersClient(p?: ListUsersParams) {
  const res = await apiFetchClient<ListResponseDTO<UserDTO>>(
    `/users${toUsersQuery(p)}`,
  );
  return mapPaginatedUsers(res);
}

export async function getUserClient(id: number) {
  const res = await apiFetchClient<ItemResponseDTO<UserDTO>>(`/users/${id}`);
  return mapUser(res.data);
}

export async function getUserByEmailClient(email: string) {
  const res = await apiFetchClient<ItemResponseDTO<UserDTO>>(
    `/users/email/${email}`,
  );
  return mapUser(res.data);
}

export async function getUserMeClient() {
  const res = await apiFetchClient<ItemResponseDTO<UserDTO>>(`/users/me`);
  return mapUser(res.data);
}

export async function createUserClient(body: CreateUserBody) {
  const res = await apiFetchClient<ItemResponseDTO<UserDTO>>(`/admin/users`, {
    method: "POST",
    body,
  });
  return mapUser(res.data);
}

export async function updateUserClient(id: number, body: UpdateUserBody) {
  const res = await apiFetchClient<ItemResponseDTO<UserDTO>>(
    `/admin/users/${id}`,
    { method: "PATCH", body },
  );
  return mapUser(res.data);
}

export async function deleteUserClient(id: number) {
  await apiFetchClient<void>(`/admin/users/${id}`, { method: "DELETE" });
}
