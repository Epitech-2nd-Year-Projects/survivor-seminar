"server-only";

import { cookies, headers } from "next/headers";
import { parseAndThrowApiError } from "./errors";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

async function buildApiUrl(path: string): Promise<string> {
  if (/^https?:\/\//i.test(API_BASE)) {
    return new URL(path, API_BASE).toString();
  }
  const h = headers();
  const host = (await h).get("x-forwarded-host") ?? (await h).get("host");
  const proto = (await h).get("x-forwarded-proto") ?? "http";
  if (!host) throw new Error("Cannot resolve host for server fetch");
  const origin = `${proto}://${host}`;
  return new URL(`${API_BASE}${path}`, origin).toString();
}

type FetchOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  next?:
    | { revalidate?: number; tags?: string[] }
    | { revalidate?: false; tags?: string[] };
  cache?: RequestCache;
};

export async function apiFetchServer<T>(
  path: string,
  opts: FetchOptions = {},
): Promise<T> {
  const cookieHeader = (await cookies())
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const url = await buildApiUrl(path);

  const res = await fetch(url, {
    method: opts.method ?? "GET",
    headers: {
      Accept: "application/json",
      ...(opts.body ? { "Content-Type": "application/json" } : {}),
      cookie: cookieHeader,
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: opts.cache,
    next: opts.next,
  });

  if (!res.ok) {
    await parseAndThrowApiError(res);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
