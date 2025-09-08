"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { investorsKeys } from "./keys";
import {
  createInvestorClient,
  deleteInvestorClient,
  getInvestorClient,
  listInvestorsClient,
  updateInvestorClient,
  type CreateInvestorBody,
} from "./client";
import type { ListInvestorsParams } from "./shared";

export function useInvestorsList(p?: ListInvestorsParams) {
  return useQuery({
    queryKey: investorsKeys.list(p),
    queryFn: () => listInvestorsClient(p),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useInfiniteInvestors(
  p: Omit<ListInvestorsParams, "page"> = {},
) {
  const { perPage = 20, ...rest } = p;
  return useInfiniteQuery({
    queryKey: investorsKeys.infinite({ perPage, ...rest }),
    queryFn: ({ pageParam }) =>
      listInvestorsClient({ page: pageParam ?? 1, perPage, ...rest }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
  });
}

export function useInvestor(id: number) {
  return useQuery({
    queryKey: investorsKeys.detail(id),
    queryFn: () => getInvestorClient(id),
    placeholderData: keepPreviousData,
  });
}

export function useCreateInvestor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateInvestorBody) => createInvestorClient(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: investorsKeys.all }).catch(
        console.error,
      );
    },
  });
}

export function useUpdateInvestor(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateInvestorBody) => updateInvestorClient(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: investorsKeys.all }).catch(
        console.error,
      );
      qc.invalidateQueries({ queryKey: investorsKeys.detail(id) }).catch(
        console.error,
      );
    },
  });
}

export function useDeleteInvestor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteInvestorClient(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: investorsKeys.all }).catch(
        console.error,
      );
    },
  });
}
