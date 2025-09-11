"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { foundersKeys } from "./keys";
import { getFounderClient, listFoundersClient } from "./client";
import type { ListFoundersParams } from "./shared";

export function useFoundersList(p?: ListFoundersParams) {
  return useQuery({
    queryKey: foundersKeys.list(p),
    queryFn: () => listFoundersClient(p),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useInfiniteFounders(p: Omit<ListFoundersParams, "page"> = {}) {
  const { perPage = 20, ...rest } = p;
  return useInfiniteQuery({
    queryKey: foundersKeys.infinite({ perPage, ...rest }),
    queryFn: ({ pageParam }) =>
      listFoundersClient({ page: pageParam ?? 1, perPage, ...rest }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
  });
}

export function useFounder(id: number) {
  return useQuery({
    queryKey: foundersKeys.detail(id),
    queryFn: () => getFounderClient(id),
    placeholderData: keepPreviousData,
  });
}
