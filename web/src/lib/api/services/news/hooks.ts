"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { newsKeys } from "./keys";
import {
  createNewsClient,
  deleteNewsClient,
  getNewsClient,
  listNewsClient,
  updateNewsClient,
  type CreateNewsBody,
  type UpdateNewsBody,
} from "./client";
import type { ListNewsParams } from "./shared";

export function useNewsList(p?: ListNewsParams) {
  return useQuery({
    queryKey: newsKeys.list(p),
    queryFn: () => listNewsClient(p),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useInfiniteNews(p: Omit<ListNewsParams, "page"> = {}) {
  const { perPage = 20, ...rest } = p;
  return useInfiniteQuery({
    queryKey: newsKeys.infinite({ perPage, ...rest }),
    queryFn: ({ pageParam }) =>
      listNewsClient({ page: pageParam ?? 1, perPage, ...rest }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
  });
}

export function useNews(id: number) {
  return useQuery({
    queryKey: newsKeys.detail(id),
    queryFn: () => getNewsClient(id),
    placeholderData: keepPreviousData,
  });
}

export function useCreateNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateNewsBody) => createNewsClient(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: newsKeys.all }).catch(console.error);
    },
  });
}

export function useUpdateNews(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateNewsBody) => updateNewsClient(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: newsKeys.all }).catch(console.error);
      qc.invalidateQueries({ queryKey: newsKeys.detail(id) }).catch(
        console.error,
      );
    },
  });
}

export function useDeleteNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteNewsClient(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: newsKeys.all }).catch(console.error);
    },
  });
}
