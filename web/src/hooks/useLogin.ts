"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { LoginFormData, LoginResponse, User } from "@/types/auth";
import { loginUser } from "@/lib/auth";

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, Error, LoginFormData>({
    mutationFn: loginUser,
    onSuccess: ({ user }) => {
      queryClient.setQueryData<User>(["currentUser"], user);
      router.push("/dashboard");
    },
  });
}
