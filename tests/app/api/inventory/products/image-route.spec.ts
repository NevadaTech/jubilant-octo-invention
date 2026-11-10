import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/inventory/products/[id]/image/route";

describe("GET /api/inventory/products/:id/image", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("Given: no session When: the photo is requested Then: should reject it", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/inventory/products/prod-001/image"),
      { params: Promise.resolve({ id: "prod-001" }) },
    );

    expect(response.status).toBe(401);
  });

  it("Given: the API has the photo When: the proxy is called Then: should stream the bytes from the API", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com");
    const bytes = new Uint8Array([137, 80, 78, 71]);
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(bytes, {
        status: 200,
        headers: { "Content-Type": "image/png" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(
      new NextRequest("http://localhost/api/inventory/products/prod-001/image", {
        headers: { Authorization: "Bearer token-1" },
      }),
      { params: Promise.resolve({ id: "prod-001" }) },
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/inventory/products/prod-001/image",
      expect.objectContaining({
        cache: "no-store",
        headers: expect.any(Headers),
      }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(bytes);
  });
});
