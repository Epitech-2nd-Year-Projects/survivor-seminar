"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { startupsKeys } from "./keys";
import {
  createStartupClient,
  deleteStartupClient,
  getStartupClient,
  listStartupsClient,
  updateStartupClient,
  type CreateStartupBody,
} from "./client";
import type { ListStartupsParams } from "./shared";

export function useStartupsList(p?: ListStartupsParams) {
  return useQuery({
    queryKey: startupsKeys.list(p),
    queryFn: () => listStartupsClient(p),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useInfiniteStartups(p: Omit<ListStartupsParams, "page"> = {}) {
  const { perPage = 20, ...rest } = p;
  return useInfiniteQuery({
    queryKey: startupsKeys.infinite({ perPage, ...rest }),
    queryFn: ({ pageParam }) =>
      listStartupsClient({ page: pageParam ?? 1, perPage, ...rest }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
  });
}

export function useStartup(id: number) {
  return useQuery({
    queryKey: startupsKeys.detail(id),
    queryFn: () => getStartupClient(id),
    placeholderData: keepPreviousData,
  });
}

export function useCreateStartup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateStartupBody) => createStartupClient(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: startupsKeys.all }).catch(console.error);
    },
  });
}

export function useUpdateStartup(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateStartupBody) => updateStartupClient(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: startupsKeys.all }).catch(console.error);
      qc.invalidateQueries({ queryKey: startupsKeys.detail(id) }).catch(
        console.error,
      );
    },
  });
}

export function useDeleteStartup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteStartupClient(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: startupsKeys.all }).catch(console.error);
    },
  });
}
