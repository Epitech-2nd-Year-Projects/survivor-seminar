"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { partnersKeys } from "./keys";
import {
  createPartnerClient,
  deletePartnerClient,
  getPartnerClient,
  listPartnersClient,
  updatePartnerClient,
  type CreatePartnerBody,
} from "./client";
import type { ListPartnersParams } from "./shared";

export function usePartnersList(p?: ListPartnersParams) {
  return useQuery({
    queryKey: partnersKeys.list(p),
    queryFn: () => listPartnersClient(p),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useInfinitePartners(p: Omit<ListPartnersParams, "page"> = {}) {
  const { perPage = 20, ...rest } = p;
  return useInfiniteQuery({
    queryKey: partnersKeys.infinite({ perPage, ...rest }),
    queryFn: ({ pageParam }) =>
      listPartnersClient({ page: pageParam ?? 1, perPage, ...rest }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
  });
}

export function usePartner(id: number) {
  return useQuery({
    queryKey: partnersKeys.detail(id),
    queryFn: () => getPartnerClient(id),
    placeholderData: keepPreviousData,
  });
}

export function useCreatePartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePartnerBody) => createPartnerClient(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: partnersKeys.all }).catch(console.error);
    },
  });
}

export function useUpdatePartner(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePartnerBody) => updatePartnerClient(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: partnersKeys.all }).catch(console.error);
      qc.invalidateQueries({ queryKey: partnersKeys.detail(id) }).catch(
        console.error,
      );
    },
  });
}

export function useDeletePartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePartnerClient(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: partnersKeys.all }).catch(console.error);
    },
  });
}
