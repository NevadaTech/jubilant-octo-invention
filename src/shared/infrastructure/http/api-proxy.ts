/**
 * Same-origin BFF proxy core.
 *
 * The browser never holds the access token: it calls `/api/proxy/<path>` on
 * this app, and this server-side code reads the HttpOnly cookie and forwards
 * the request to the backend with `Authorization: Bearer <token>`. Frontend and
 * backend can live on different domains because only this server talks to the
 * backend.
 */

const FORWARDED_REQUEST_HEADERS = [
  "accept",
  "accept-language",
  "content-type",
  "x-organization-slug",
  "x-organization-id",
  "x-user-id",
  "x-api-version",
] as const;

const RETURNED_RESPONSE_HEADERS = [
  "content-type",
  "content-disposition",
  "cache-control",
] as const;

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const METHODS_WITHOUT_BODY = new Set(["GET", "HEAD"]);

export interface ProxyDeps {
  /** Backend base URL, e.g. `https://api.example.com`. */
  apiUrl: string;
  /** Access token read from the HttpOnly cookie, or null when absent. */
  accessToken: string | null;
  fetchImpl?: typeof fetch;
}

function jsonError(status: number, message: string): Response {
  return Response.json({ success: false, message }, { status });
}

function isSafeSegment(segment: string): boolean {
  return (
    segment.length > 0 &&
    segment !== "." &&
    segment !== ".." &&
    !segment.includes("/") &&
    !segment.includes("\\")
  );
}

/**
 * Builds the backend URL, or null when the path could leave the API origin.
 * Segments arrive already decoded from the catch-all route, so each one is
 * re-encoded before it is joined.
 */
function buildTargetUrl(
  apiUrl: string,
  path: string[],
  search: string,
): string | null {
  if (path.length === 0 || !path.every(isSafeSegment)) return null;

  const base = apiUrl.replace(/\/+$/, "");
  const target = `${base}/${path.map(encodeURIComponent).join("/")}${search}`;

  if (new URL(target).origin !== new URL(base).origin) return null;
  return target;
}

/** CSRF guard: a mutating request must come from this app's own origin. */
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  return origin === new URL(request.url).origin;
}

export async function proxyToBackend(
  request: Request,
  path: string[],
  deps: ProxyDeps,
): Promise<Response> {
  const method = request.method.toUpperCase();

  if (MUTATING_METHODS.has(method) && !isSameOrigin(request)) {
    return jsonError(403, "Cross-origin request rejected");
  }

  const target = buildTargetUrl(deps.apiUrl, path, new URL(request.url).search);
  if (!target) {
    return jsonError(400, "Invalid API path");
  }

  // No cookie means the access token expired: answer 401 so the client
  // refreshes through /api/auth/refresh and replays the request.
  if (!deps.accessToken) {
    return jsonError(401, "Not authenticated");
  }

  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("authorization", `Bearer ${deps.accessToken}`);

  const body = METHODS_WITHOUT_BODY.has(method)
    ? undefined
    : await request.arrayBuffer();

  const fetchImpl = deps.fetchImpl ?? fetch;
  let upstream: Response;
  try {
    upstream = await fetchImpl(target, {
      method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
    });
  } catch {
    return jsonError(502, "Backend unavailable");
  }

  const responseHeaders = new Headers();
  for (const name of RETURNED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}
