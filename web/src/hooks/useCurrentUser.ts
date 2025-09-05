"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@/types/auth";
import { fetchCurrentUser } from "@/lib/auth";

export function useCurrentUser() {
  const queryClient = useQueryClient();
  return useQuery<User, Error>({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
    initialData: () => queryClient.getQueryData<User>(["currentUser"]),
    staleTime: 1000 * 60 * 5,
  });
}
