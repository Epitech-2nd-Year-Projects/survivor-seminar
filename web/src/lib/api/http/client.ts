import { parseAndThrowApiError } from "./errors";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type FetchOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  csrfToken?: string;
  tryRefresh?: boolean;
};

let refreshPromise: Promise<void> | null = null;

async function refreshSession() {
  refreshPromise ??= fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    credentials: "include",
  })
    .then(async (res) => {
      if (!res.ok) {
        await parseAndThrowApiError(res);
      }
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

export async function apiFetchClient<T>(
  path: string,
  opts: FetchOptions = {},
): Promise<T> {
  const headers: HeadersInit = {
    Accept: "application/json",
    ...(opts.body ? { "Content-Type": "application/json" } : {}),
  };
  if (opts.csrfToken) headers["X-CSRF-Token"] = opts.csrfToken;

  const doFetch = () =>
    fetch(`${API_BASE_URL}${path}`, {
      method: opts.method ?? "GET",
      headers,
      credentials: "include",
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: opts.signal,
    });

  let res = await doFetch();

  if (res.status === 401 && opts.tryRefresh !== false) {
    try {
      await refreshSession();
      res = await doFetch();
    } catch {}
  }

  if (!res.ok) {
    await parseAndThrowApiError(res);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
