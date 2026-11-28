import { describe, it, expect, vi, beforeEach } from "vitest";
import { proxyToBackend } from "@/shared/infrastructure/http/api-proxy";

const API_URL = "https://api.example.com";
const APP = "https://app.example.com";

function backendJson(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

describe("proxyToBackend", () => {
  let fetchImpl: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchImpl = vi.fn();
  });

  function run(
    request: Request,
    path: string[],
    accessToken: string | null = "cookie-token",
  ) {
    return proxyToBackend(request, path, {
      apiUrl: API_URL,
      accessToken,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
  }

  it("Given: a GET with a cookie token When: proxied Then: forwards path, query, bearer and allow-listed headers only", async () => {
    fetchImpl.mockResolvedValue(backendJson({ data: [1] }));
    const request = new Request(
      `${APP}/api/proxy/inventory/products?page=2&q=a%20b`,
      {
        headers: {
          Accept: "application/json",
          "X-Organization-Slug": "acme",
          "X-Organization-ID": "org-1",
          "X-User-ID": "user-1",
          Cookie: "nevada_access_token=cookie-token; other=1",
          Authorization: "Bearer attacker-token",
          Host: "app.example.com",
        },
      },
    );

    const response = await run(request, ["inventory", "products"]);

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${API_URL}/inventory/products?page=2&q=a%20b`);
    expect(init.method).toBe("GET");
    const headers = new Headers(init.headers);
    expect(headers.get("authorization")).toBe("Bearer cookie-token");
    expect(headers.get("x-organization-slug")).toBe("acme");
    expect(headers.get("x-organization-id")).toBe("org-1");
    expect(headers.get("x-user-id")).toBe("user-1");
    expect(headers.get("accept")).toBe("application/json");
    expect(headers.get("cookie")).toBeNull();
    expect(headers.get("host")).toBeNull();
    expect(init.body).toBeUndefined();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "application/json; charset=utf-8",
    );
    expect(await response.json()).toEqual({ data: [1] });
  });

  it("Given: no access-token cookie When: proxied Then: returns 401 without calling the backend", async () => {
    const request = new Request(`${APP}/api/proxy/users/me`);

    const response = await run(request, ["users", "me"], null);

    expect(response.status).toBe(401);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("Given: a same-origin POST When: proxied Then: forwards the raw body and content type", async () => {
    fetchImpl.mockResolvedValue(backendJson({ ok: true }, 201));
    const request = new Request(`${APP}/api/proxy/sales`, {
      method: "POST",
      headers: { Origin: APP, "Content-Type": "application/json" },
      body: JSON.stringify({ total: 10 }),
    });

    const response = await run(request, ["sales"]);

    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${API_URL}/sales`);
    expect(init.method).toBe("POST");
    expect(new Headers(init.headers).get("content-type")).toBe(
      "application/json",
    );
    expect(new TextDecoder().decode(init.body as ArrayBuffer)).toBe(
      '{"total":10}',
    );
    expect(response.status).toBe(201);
  });

  it.each(["POST", "PUT", "PATCH", "DELETE"])(
    "Given: a %s from another origin When: proxied Then: returns 403 without calling the backend",
    async (method) => {
      const request = new Request(`${APP}/api/proxy/sales/1`, {
        method,
        headers: { Origin: "https://evil.example.com" },
      });

      const response = await run(request, ["sales", "1"]);

      expect(response.status).toBe(403);
      expect(fetchImpl).not.toHaveBeenCalled();
    },
  );

  it("Given: a mutating request without Origin When: proxied Then: returns 403 without calling the backend", async () => {
    const request = new Request(`${APP}/api/proxy/sales/1`, {
      method: "DELETE",
    });

    const response = await run(request, ["sales", "1"]);

    expect(response.status).toBe(403);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it.each([
    [["..", "admin"]],
    [["inventory", "."]],
    [["a/b"]],
    [["a\\b"]],
    [[]],
  ])(
    "Given: an unsafe path %j When: proxied Then: returns 400 without calling the backend",
    async (path) => {
      const request = new Request(`${APP}/api/proxy/x`);

      const response = await run(request, path as string[]);

      expect(response.status).toBe(400);
      expect(fetchImpl).not.toHaveBeenCalled();
    },
  );

  it("Given: a binary download When: proxied Then: keeps bytes, content type and content disposition", async () => {
    const bytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0xff]);
    fetchImpl.mockResolvedValue(
      new Response(bytes, {
        status: 200,
        headers: {
          "content-type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "content-disposition": 'attachment; filename="report.xlsx"',
          "set-cookie": "backend=1",
        },
      }),
    );
    const request = new Request(`${APP}/api/proxy/reports/stock/export`);

    const response = await run(request, ["reports", "stock", "export"]);

    expect(response.headers.get("content-disposition")).toBe(
      'attachment; filename="report.xlsx"',
    );
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(bytes);
  });

  it("Given: a backend error status When: proxied Then: passes the status and body through", async () => {
    fetchImpl.mockResolvedValue(backendJson({ message: "Not found" }, 404));
    const request = new Request(`${APP}/api/proxy/sales/999`);

    const response = await run(request, ["sales", "999"]);

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ message: "Not found" });
  });

  it.each([
    "https://app.example.com.evil.com",
    "null",
    "http://app.example.com",
  ])(
    "Given: a lookalike Origin %s When: a POST is proxied Then: returns 403 without calling the backend",
    async (origin) => {
      const request = new Request(`${APP}/api/proxy/sales`, {
        method: "POST",
        headers: { Origin: origin },
      });

      const response = await run(request, ["sales"]);

      expect(response.status).toBe(403);
      expect(fetchImpl).not.toHaveBeenCalled();
    },
  );

  it("Given: a cross-origin POST without a cookie When: proxied Then: returns 403 before the 401", async () => {
    const request = new Request(`${APP}/api/proxy/sales`, {
      method: "POST",
      headers: { Origin: "https://evil.example.com" },
    });

    const response = await run(request, ["sales"], null);

    expect(response.status).toBe(403);
  });

  it.each([
    [["@evil.com"], `${API_URL}/%40evil.com`],
    [["%2e%2e"], `${API_URL}/%252e%252e`],
    [["evil.com:80"], `${API_URL}/evil.com%3A80`],
  ])(
    "Given: a tricky segment %j When: proxied Then: stays on the API origin",
    async (path, expectedUrl) => {
      fetchImpl.mockResolvedValue(backendJson({}));
      const request = new Request(`${APP}/api/proxy/x`);

      await run(request, path as string[]);

      expect(fetchImpl.mock.calls[0][0]).toBe(expectedUrl);
    },
  );

  it("Given: a multipart upload When: proxied Then: forwards the boundary content type and bytes unchanged", async () => {
    fetchImpl.mockResolvedValue(backendJson({ ok: true }, 201));
    const form = new FormData();
    form.append("file", new Blob(["a,b\n1,2"], { type: "text/csv" }), "x.csv");
    const original = new Request(`${APP}/api/proxy/imports/preview`, {
      method: "POST",
      headers: { Origin: APP },
      body: form,
    });
    const contentType = original.headers.get("content-type")!;
    const expectedBytes = new Uint8Array(await original.clone().arrayBuffer());

    await run(original, ["imports", "preview"]);

    const init = fetchImpl.mock.calls[0][1] as RequestInit;
    expect(contentType).toMatch(/boundary=/);
    expect(new Headers(init.headers).get("content-type")).toBe(contentType);
    expect(new Uint8Array(init.body as ArrayBuffer)).toEqual(expectedBytes);
  });

  it.each([204, 304])(
    "Given: a %i response without body When: proxied Then: passes the status through",
    async (status) => {
      fetchImpl.mockResolvedValue(new Response(null, { status }));
      const request = new Request(`${APP}/api/proxy/sales/1`);

      const response = await run(request, ["sales", "1"]);

      expect(response.status).toBe(status);
    },
  );

  it("Given: a backend response with sensitive headers When: proxied Then: drops set-cookie, location and content-encoding", async () => {
    fetchImpl.mockResolvedValue(
      new Response("{}", {
        status: 200,
        headers: {
          "content-type": "application/json",
          "set-cookie": "session=x",
          location: "https://evil.example.com",
          "content-encoding": "gzip",
        },
      }),
    );
    const request = new Request(`${APP}/api/proxy/sales`);

    const response = await run(request, ["sales"]);

    expect(response.headers.get("set-cookie")).toBeNull();
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("content-encoding")).toBeNull();
  });

  it("Given: the backend is unreachable When: proxied Then: returns 502", async () => {
    fetchImpl.mockRejectedValue(new TypeError("fetch failed"));
    const request = new Request(`${APP}/api/proxy/sales`);

    const response = await run(request, ["sales"]);

    expect(response.status).toBe(502);
  });
});
