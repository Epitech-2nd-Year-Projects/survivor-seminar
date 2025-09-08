"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { opportunitiesKeys } from "./keys";
import {
  createOpportunityClient,
  deleteOpportunityClient,
  getOpportunityClient,
  listOpportunitiesClient,
  updateOpportunityClient,
  type CreateOpportunitiesBody,
} from "./client";
import type { ListOpportunitiesParams } from "./shared";

export function useOpportunitiesList(p?: ListOpportunitiesParams) {
  return useQuery({
    queryKey: opportunitiesKeys.list(p),
    queryFn: () => listOpportunitiesClient(p),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useInfiniteOpportunities(
  p: Omit<ListOpportunitiesParams, "page"> = {},
) {
  const { perPage = 20, ...rest } = p;
  return useInfiniteQuery({
    queryKey: opportunitiesKeys.infinite({ perPage, ...rest }),
    queryFn: ({ pageParam }) =>
      listOpportunitiesClient({ page: pageParam ?? 1, perPage, ...rest }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
  });
}

export function useOpportunity(id: number) {
  return useQuery({
    queryKey: opportunitiesKeys.detail(id),
    queryFn: () => getOpportunityClient(id),
    placeholderData: keepPreviousData,
  });
}

export function useCreateOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateOpportunitiesBody) =>
      createOpportunityClient(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: opportunitiesKeys.all }).catch(
        console.error,
      );
    },
  });
}

export function useUpdateOpportunity(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateOpportunitiesBody) =>
      updateOpportunityClient(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: opportunitiesKeys.all }).catch(
        console.error,
      );
      qc.invalidateQueries({ queryKey: opportunitiesKeys.detail(id) }).catch(
        console.error,
      );
    },
  });
}

export function useDeleteOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteOpportunityClient(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: opportunitiesKeys.all }).catch(
        console.error,
      );
    },
  });
}
