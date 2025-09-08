"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  loginClient,
  logoutClient,
  registerClient,
  verifyEmailClient,
  forgotPasswordClient,
  resetPasswordClient,
  type LoginBody,
  type RegisterBody,
} from "./client";
import { authKeys } from "./keys";
import { getUserMeClient } from "../users/client";
import { usersKeys } from "../users/keys";

export function useMe() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => getUserMeClient(),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: LoginBody) => loginClient(body),
    onSuccess: (user) => {
      qc.setQueryData(authKeys.me(), user);
      qc.setQueryData(usersKeys.detailById(user.id), user);
      qc.setQueryData(usersKeys.detailByEmail(user.email), user);
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RegisterBody) => registerClient(body),
    onSuccess: () => {
      // TODO: Show a toast and route to "check your email".
      qc.removeQueries({ queryKey: authKeys.me() });
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => logoutClient(),
    onSuccess: () => {
      qc.removeQueries({ queryKey: authKeys.all });
      qc.removeQueries({ queryKey: usersKeys.all });
    },
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => verifyEmailClient(token),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => forgotPasswordClient(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (args: { token: string; newPassword: string }) =>
      resetPasswordClient(args.token, args.newPassword),
  });
}
