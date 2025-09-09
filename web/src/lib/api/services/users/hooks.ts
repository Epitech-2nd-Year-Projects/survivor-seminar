"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { usersKeys } from "./keys";
import {
  createUserClient,
  deleteUserClient,
  getUserByEmailClient,
  getUserClient,
  getUserMeClient,
  listUsersClient,
  updateUserClient,
  type CreateUserBody,
  type UpdateUserBody,
} from "./client";
import type { ListUsersParams } from "./shared";

export function useUsersList(p?: ListUsersParams) {
  return useQuery({
    queryKey: usersKeys.list(p),
    queryFn: () => listUsersClient(p),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useInfiniteUsers(p: Omit<ListUsersParams, "page"> = {}) {
  const { perPage = 20, ...rest } = p;
  return useInfiniteQuery({
    queryKey: usersKeys.infinite({ perPage, ...rest }),
    queryFn: ({ pageParam }) =>
      listUsersClient({ page: pageParam ?? 1, perPage, ...rest }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
  });
}

export function useUser(id: number) {
  const enabled = typeof id === "number" && id > 0;
  return useQuery({
    queryKey: enabled ? usersKeys.detailById(id) : usersKeys.detailById(0),
    queryFn: () => getUserClient(id),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useUserByEmail(email: string) {
  const enabled = !!email;
  return useQuery({
    queryKey: enabled
      ? usersKeys.detailByEmail(email)
      : usersKeys.detailByEmail(""),
    queryFn: () => getUserByEmailClient(email),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useUserMe() {
  return useQuery({
    queryKey: usersKeys.me(),
    queryFn: () => getUserMeClient(),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateUserBody) => createUserClient(body),
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: usersKeys.list() }).catch(console.error);
      qc.setQueryData(usersKeys.detailById(created.id), created);
      qc.setQueryData(usersKeys.detailByEmail(created.email), created);
    },
  });
}

export function useUpdateUser(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateUserBody) => updateUserClient(id, body),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: usersKeys.list() }).catch(console.error);
      qc.setQueryData(usersKeys.detailById(updated.id), updated);
      qc.setQueryData(usersKeys.detailByEmail(updated.email), updated);
      qc.invalidateQueries({ queryKey: usersKeys.me() }).catch(console.error);
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteUserClient(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: usersKeys.list() }).catch(console.error);
      qc.removeQueries({ queryKey: usersKeys.detailById(id) });
    },
  });
}
