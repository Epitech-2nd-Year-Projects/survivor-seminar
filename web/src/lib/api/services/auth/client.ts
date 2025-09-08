import { apiFetchClient } from "@/lib/api/http/client";
import { mapUser, type UserDTO, type User } from "@/lib/api/contracts/users";
import type { AuthTokenPairDTO } from "../../contracts/auth";

export type RegisterBody = {
  email: string;
  name: string;
  role: "founder" | "investor";
  password: string;
  image_url?: string;
  founder_id?: number;
  investor_id?: number;
};

export type LoginBody = { email: string; password: string };

type RegisterResponse = {
  user: UserDTO;
  message: string;
};

type LoginResponse = {
  user: UserDTO;
  tokens: AuthTokenPairDTO;
};

export async function registerClient(body: RegisterBody): Promise<User> {
  const res = await apiFetchClient<RegisterResponse>(`/auth/register`, {
    method: "POST",
    body,
  });
  return mapUser(res.user);
}

export async function loginClient(body: LoginBody): Promise<User> {
  const res = await apiFetchClient<LoginResponse>(`/auth/login`, {
    method: "POST",
    body,
  });
  return mapUser(res.user);
}

export async function refreshClient(): Promise<void> {
  await apiFetchClient<void>(`/auth/refresh`, {
    method: "POST",
    tryRefresh: false,
  });
}

export async function logoutClient(): Promise<void> {
  await apiFetchClient<void>(`/auth/logout`, { method: "POST" });
}

export async function verifyEmailClient(token: string) {
  return apiFetchClient<{ message: string }>(
    `/auth/verify?token=${encodeURIComponent(token)}`,
  );
}

export async function forgotPasswordClient(email: string) {
  return apiFetchClient<{ message: string }>(`/auth/forgot-password`, {
    method: "POST",
    body: { email },
  });
}

export async function resetPasswordClient(token: string, newPassword: string) {
  return apiFetchClient<{ message: string }>(`/auth/reset-password`, {
    method: "POST",
    body: { token, new_password: newPassword },
  });
}
