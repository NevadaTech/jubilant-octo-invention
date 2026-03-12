import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Server-side fetch helper for RSC data prefetching.
 * Reads auth token and org slug from cookies to make authenticated API calls.
 */
export async function serverFetch<T>(
  path: string,
  options?: { params?: Record<string, unknown> },
): Promise<T> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("nevada_access_token")?.value;
  const orgSlug = cookieStore.get("nevada_org_slug")?.value;

  const url = new URL(`${API_URL}${path}`);
  if (options?.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const res = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(orgSlug ? { "X-Organization-Slug": orgSlug } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Server fetch failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
