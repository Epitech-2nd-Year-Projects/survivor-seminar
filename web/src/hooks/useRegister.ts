"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { RegisterFormData, RegisterResponse, User } from "@/types/auth";
import { registerUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<RegisterResponse, Error, RegisterFormData>({
    mutationFn: registerUser,
    onSuccess: ({ user }) => {
      queryClient.setQueryData<User>(["currentUser"], user);
      router.push("/dashboard");
    },
  });
}
