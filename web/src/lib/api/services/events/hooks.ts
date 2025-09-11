"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { eventsKeys } from "./keys";
import {
  createEventClient,
  deleteEventClient,
  getEventClient,
  listEventsClient,
  updateEventClient,
  type CreateEventBody,
  type UpdateEventBody,
} from "./client";
import type { ListEventsParams } from "./shared";

export function useEventsList(p?: ListEventsParams) {
  return useQuery({
    queryKey: eventsKeys.list(p),
    queryFn: () => listEventsClient(p),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useInfiniteEvents(p: Omit<ListEventsParams, "page"> = {}) {
  const { perPage = 20, ...rest } = p;
  return useInfiniteQuery({
    queryKey: eventsKeys.infinite({ perPage, ...rest }),
    queryFn: ({ pageParam }) =>
      listEventsClient({ page: pageParam ?? 1, perPage, ...rest }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
  });
}

export function useEvent(id: number) {
  return useQuery({
    queryKey: eventsKeys.detail(id),
    queryFn: () => getEventClient(id),
    placeholderData: keepPreviousData,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateEventBody) => createEventClient(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: eventsKeys.all }).catch(console.error);
    },
  });
}

export function useUpdateEvent(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateEventBody) => updateEventClient(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: eventsKeys.all }).catch(console.error);
      qc.invalidateQueries({ queryKey: eventsKeys.detail(id) }).catch(
        console.error,
      );
    },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteEventClient(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: eventsKeys.all }).catch(console.error);
    },
  });
}
