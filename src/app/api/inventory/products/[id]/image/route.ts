import { NextRequest, NextResponse } from "next/server";

const PRODUCT_ID = /^[A-Za-z0-9_-]+$/;

function apiUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(
    /\/$/,
    "",
  );
}

/**
 * Same-origin proxy for a private product photo.
 * The browser downloads the bytes from this app. Node reads them from the API,
 * so a flaky HTTP/3 connection to the API host cannot blank the photo.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!PRODUCT_ID.test(id)) {
    return NextResponse.json(
      { success: false, message: "Product image not found" },
      { status: 404 },
    );
  }

  const headers = new Headers();
  for (const name of [
    "authorization",
    "x-organization-slug",
    "x-organization-id",
    "x-user-id",
  ]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  if (!headers.has("authorization")) {
    const token = request.cookies.get("nevada_access_token")?.value;
    if (token) headers.set("authorization", `Bearer ${token}`);
  }
  if (!headers.has("x-organization-slug")) {
    const slug = request.cookies.get("nevada_org_slug")?.value;
    if (slug) headers.set("x-organization-slug", slug);
  }

  if (!headers.has("authorization")) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${apiUrl()}/inventory/products/${id}/image`, {
      headers,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Product image unavailable" },
      { status: 502 },
    );
  }

  if (!upstream.ok || !upstream.body) {
    return new NextResponse(null, { status: upstream.status });
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": "private, no-store",
    },
  });
}
