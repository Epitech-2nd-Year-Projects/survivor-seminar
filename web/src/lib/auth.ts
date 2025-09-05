import type {
  LoginFormData,
  LoginResponse,
  RegisterFormData,
  RegisterResponse,
  User,
} from "@/types/auth";

export async function registerUser(
  newUser: RegisterFormData,
): Promise<RegisterResponse> {
  const res = await fetch("/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(newUser),
  });

  if (!res.ok) {
    const errPayload = (await res.json().catch(() => ({}))) as {
      message?: string;
    };
    throw new Error(errPayload.message ?? "Registration failed");
  }

  const payload = (await res.json()) as RegisterResponse;
  return payload;
}

export async function loginUser(creds: LoginFormData): Promise<LoginResponse> {
  const res = await fetch("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(creds),
  });

  if (!res.ok) {
    const errPayload = (await res.json().catch(() => ({}))) as {
      message?: string;
    };
    throw new Error(errPayload.message ?? "Login failed");
  }

  const payload = (await res.json()) as LoginResponse;
  return payload;
}

export async function fetchCurrentUser(): Promise<User> {
  const res = await fetch("/api/v1/auth/me", {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch current user");
  }

  const payload = (await res.json()) as User;
  return payload;
}
