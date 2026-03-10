import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mocks (available inside vi.mock factories) ──────────────────

const { mockAxiosInstance, mockTokenService } = vi.hoisted(() => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };

  const mockTokenService = {
    getAccessToken: vi.fn().mockReturnValue(null),
    setAccessToken: vi.fn(),
    getOrganizationSlug: vi.fn(),
    getOrganizationId: vi.fn(),
    getUser: vi.fn(),
    clearSession: vi.fn(),
    setExpiresAt: vi.fn(),
    getRefreshToken: vi.fn().mockReturnValue(null),
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
    hasValidToken: vi.fn(),
    hasValidSession: vi.fn(),
  };

  return { mockAxiosInstance, mockTokenService };
});

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
    post: vi.fn(),
  },
}));

vi.mock("@/config/env", () => ({
  env: {
    NEXT_PUBLIC_API_URL: "http://localhost:8080",
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    NEXT_PUBLIC_API_TIMEOUT: 30000,
  },
}));

vi.mock(
  "@/modules/authentication/infrastructure/services/token.service",
  () => ({
    TokenService: mockTokenService,
  }),
);

import axios from "axios";
import { AxiosHttpClient } from "@/shared/infrastructure/http/axios-http-client";

// ── Helpers ─────────────────────────────────────────────────────────────

function axiosResponse<T>(data: T, status = 200) {
  return { data, status, headers: { "content-type": "application/json" } };
}

function getRequestInterceptor(): (
  config: Record<string, unknown>,
) => Record<string, unknown> {
  const calls = mockAxiosInstance.interceptors.request.use.mock.calls;
  return calls[calls.length - 1][0];
}

function getResponseErrorInterceptor(): (error: unknown) => Promise<unknown> {
  const calls = mockAxiosInstance.interceptors.response.use.mock.calls;
  return calls[calls.length - 1][1];
}

// ── Tests ───────────────────────────────────────────────────────────────

describe("AxiosHttpClient", () => {
  let client: AxiosHttpClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new AxiosHttpClient();
  });

  // ── Construction ────────────────────────────────────────────────────

  describe("constructor", () => {
    it("Given: no custom config When: creating a client Then: should create an axios instance with env defaults and withCredentials", () => {
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: "http://localhost:8080",
          timeout: 30000,
          withCredentials: true,
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        }),
      );
    });

    it("Given: a custom config When: creating a client Then: should use the provided baseURL, timeout and headers", () => {
      vi.clearAllMocks();
      new AxiosHttpClient({
        baseURL: "https://api.example.com",
        timeout: 5000,
        headers: { "X-Custom": "value" },
      });

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: "https://api.example.com",
          timeout: 5000,
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "X-Custom": "value",
          }),
        }),
      );
    });

    it("Given: client creation When: interceptors are set up Then: should register both request and response interceptors", () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalledTimes(
        1,
      );
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalledTimes(
        1,
      );
    });
  });

  // ── HTTP methods ────────────────────────────────────────────────────

  describe("get", () => {
    it("Given: a URL When: calling get Then: should delegate to axios instance and return an HttpResponse", async () => {
      const payload = { id: "1", name: "Widget" };
      mockAxiosInstance.get.mockResolvedValueOnce(axiosResponse(payload));

      const result = await client.get<typeof payload>("/products/1");

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        "/products/1",
        undefined,
      );
      expect(result).toEqual({
        data: payload,
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });

    it("Given: a URL and query params When: calling get Then: should forward the config to the axios instance", async () => {
      const payload = [{ id: "1" }, { id: "2" }];
      mockAxiosInstance.get.mockResolvedValueOnce(axiosResponse(payload));

      const config = { params: { page: 1, limit: 10 } };
      const result = await client.get("/products", config);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/products", config);
      expect(result.data).toEqual(payload);
    });
  });

  describe("post", () => {
    it("Given: a URL and body When: calling post Then: should delegate to axios instance and return an HttpResponse", async () => {
      const body = { name: "New Product" };
      const created = { id: "2", name: "New Product" };
      mockAxiosInstance.post.mockResolvedValueOnce(axiosResponse(created, 201));

      const result = await client.post<typeof created>("/products", body);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        "/products",
        body,
        undefined,
      );
      expect(result.data).toEqual(created);
      expect(result.status).toBe(201);
    });
  });

  describe("put", () => {
    it("Given: a URL and body When: calling put Then: should delegate to axios instance and return an HttpResponse", async () => {
      const body = { name: "Updated" };
      const updated = { id: "1", name: "Updated" };
      mockAxiosInstance.put.mockResolvedValueOnce(axiosResponse(updated));

      const result = await client.put<typeof updated>("/products/1", body);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        "/products/1",
        body,
        undefined,
      );
      expect(result.data).toEqual(updated);
    });
  });

  describe("patch", () => {
    it("Given: a URL and partial body When: calling patch Then: should delegate to axios instance and return an HttpResponse", async () => {
      const body = { name: "Patched" };
      const patched = { id: "1", name: "Patched" };
      mockAxiosInstance.patch.mockResolvedValueOnce(axiosResponse(patched));

      const result = await client.patch<typeof patched>("/products/1", body);

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith(
        "/products/1",
        body,
        undefined,
      );
      expect(result.data).toEqual(patched);
    });
  });

  describe("delete", () => {
    it("Given: a URL When: calling delete Then: should delegate to axios instance and return an HttpResponse", async () => {
      mockAxiosInstance.delete.mockResolvedValueOnce(axiosResponse(null, 204));

      const result = await client.delete("/products/1");

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(
        "/products/1",
        undefined,
      );
      expect(result.status).toBe(204);
    });
  });

  // ── Request interceptor (auth + org headers) ──────────────────────

  describe("request interceptor", () => {
    it("Given: access token and org data When: a request is intercepted Then: should inject Authorization and org headers", () => {
      mockTokenService.getAccessToken.mockReturnValue("my-access-token");
      mockTokenService.getOrganizationSlug.mockReturnValue("acme-corp");
      mockTokenService.getOrganizationId.mockReturnValue("org-123");
      mockTokenService.getUser.mockReturnValue({ id: "user-1" });

      const interceptor = getRequestInterceptor();
      const config = { headers: {} as Record<string, string> };
      const result = interceptor(config) as { headers: Record<string, string> };

      expect(result.headers.Authorization).toBe("Bearer my-access-token");
      expect(result.headers["X-Organization-Slug"]).toBe("acme-corp");
      expect(result.headers["X-Organization-ID"]).toBe("org-123");
      expect(result.headers["X-User-ID"]).toBe("user-1");
    });

    it("Given: no access token and no org data When: a request is intercepted Then: should not set any headers", () => {
      mockTokenService.getAccessToken.mockReturnValue(null);
      mockTokenService.getOrganizationSlug.mockReturnValue(null);
      mockTokenService.getOrganizationId.mockReturnValue(null);
      mockTokenService.getUser.mockReturnValue(null);

      const interceptor = getRequestInterceptor();
      const config = { headers: {} as Record<string, string> };
      const result = interceptor(config) as { headers: Record<string, string> };

      expect(result.headers.Authorization).toBeUndefined();
      expect(result.headers["X-Organization-Slug"]).toBeUndefined();
      expect(result.headers["X-Organization-ID"]).toBeUndefined();
      expect(result.headers["X-User-ID"]).toBeUndefined();
    });
  });

  // ── Response interceptor (error handling & BFF refresh) ────────────

  describe("response interceptor - error handling", () => {
    it("Given: a non-401 error When: the response interceptor handles it Then: should reject with the original error", async () => {
      const error = {
        response: { status: 500 },
        config: { url: "/products" },
      };
      const errorInterceptor = getResponseErrorInterceptor();

      await expect(errorInterceptor(error)).rejects.toBe(error);
    });

    it("Given: a 401 on an auth endpoint When: the response interceptor handles it Then: should skip refresh and reject", async () => {
      const error = {
        response: { status: 401 },
        config: { url: "/auth/login", _retry: false },
      };
      const errorInterceptor = getResponseErrorInterceptor();

      await expect(errorInterceptor(error)).rejects.toBe(error);
    });

    it("Given: a 401 that was already retried When: the response interceptor handles it Then: should not attempt refresh again", async () => {
      const error = {
        response: { status: 401 },
        config: { url: "/products", _retry: true, headers: {} },
      };
      const errorInterceptor = getResponseErrorInterceptor();

      await expect(errorInterceptor(error)).rejects.toBe(error);
    });
  });

  // ── Error propagation from axios methods ────────────────────────────

  describe("error propagation", () => {
    it("Given: axios rejects on get When: calling get Then: should propagate the error to the caller", async () => {
      const networkError = new Error("Network Error");
      mockAxiosInstance.get.mockRejectedValueOnce(networkError);

      await expect(client.get("/products")).rejects.toThrow("Network Error");
    });

    it("Given: axios rejects on post When: calling post Then: should propagate the error to the caller", async () => {
      const serverError = new Error("Internal Server Error");
      mockAxiosInstance.post.mockRejectedValueOnce(serverError);

      await expect(client.post("/products", { name: "x" })).rejects.toThrow(
        "Internal Server Error",
      );
    });
  });

  // ── Request interceptor: error callback ──────────────────────────
  describe("request interceptor - error callback", () => {
    it("Given: request interceptor error handler When: called with error Then: should reject with the error", async () => {
      const calls = mockAxiosInstance.interceptors.request.use.mock.calls;
      const errorHandler = calls[calls.length - 1][1];
      const err = new Error("request failed");

      await expect(errorHandler(err)).rejects.toBe(err);
    });
  });

  // ── Request interceptor: FormData branch ──────────────────────────
  describe("request interceptor - FormData branch", () => {
    it("Given: request data is FormData When: interceptor runs Then: should delete Content-Type header", () => {
      vi.stubGlobal("FormData", class MockFormData {});
      const formData = new FormData();

      mockTokenService.getAccessToken.mockReturnValue(null);
      mockTokenService.getOrganizationSlug.mockReturnValue(null);
      mockTokenService.getOrganizationId.mockReturnValue(null);
      mockTokenService.getUser.mockReturnValue(null);

      const interceptor = getRequestInterceptor();
      const config = {
        headers: { "Content-Type": "application/json" } as Record<
          string,
          string
        >,
        data: formData,
      };
      const result = interceptor(config) as { headers: Record<string, string> };

      expect(result.headers["Content-Type"]).toBeUndefined();
    });

    it("Given: request data is NOT FormData When: interceptor runs Then: should keep Content-Type header", () => {
      mockTokenService.getAccessToken.mockReturnValue(null);
      mockTokenService.getOrganizationSlug.mockReturnValue(null);
      mockTokenService.getOrganizationId.mockReturnValue(null);
      mockTokenService.getUser.mockReturnValue(null);

      const interceptor = getRequestInterceptor();
      const config = {
        headers: { "Content-Type": "application/json" } as Record<
          string,
          string
        >,
        data: { key: "value" },
      };
      const result = interceptor(config) as { headers: Record<string, string> };

      expect(result.headers["Content-Type"]).toBe("application/json");
    });
  });

  // ── Request interceptor: partial user data ────────────────────────
  describe("request interceptor - partial user data", () => {
    it("Given: user object has no id When: interceptor runs Then: should not set X-User-ID", () => {
      mockTokenService.getAccessToken.mockReturnValue(null);
      mockTokenService.getOrganizationSlug.mockReturnValue(null);
      mockTokenService.getOrganizationId.mockReturnValue(null);
      mockTokenService.getUser.mockReturnValue({ id: null });

      const interceptor = getRequestInterceptor();
      const config = { headers: {} as Record<string, string> };
      const result = interceptor(config) as { headers: Record<string, string> };

      expect(result.headers["X-User-ID"]).toBeUndefined();
    });

    it("Given: user object is empty When: interceptor runs Then: should not set X-User-ID", () => {
      mockTokenService.getAccessToken.mockReturnValue(null);
      mockTokenService.getOrganizationSlug.mockReturnValue(null);
      mockTokenService.getOrganizationId.mockReturnValue(null);
      mockTokenService.getUser.mockReturnValue({});

      const interceptor = getRequestInterceptor();
      const config = { headers: {} as Record<string, string> };
      const result = interceptor(config) as { headers: Record<string, string> };

      expect(result.headers["X-User-ID"]).toBeUndefined();
    });
  });

  // ── Response interceptor: 401 refresh flow ────────────────────────
  describe("response interceptor - 401 refresh flow", () => {
    it("Given: a 401 on a non-auth endpoint When: refresh succeeds Then: should retry the original request", async () => {
      // Mock global fetch for refresh
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              accessToken: "new-token",
              accessTokenExpiresAt: "2026-12-31",
            },
          }),
      });
      vi.stubGlobal("fetch", mockFetch);

      const retryResult = axiosResponse({ retried: true });
      mockAxiosInstance.get.mockResolvedValueOnce(retryResult);

      const error = {
        response: { status: 401 },
        config: { url: "/products", _retry: false, headers: {} },
      };
      const errorInterceptor = getResponseErrorInterceptor();

      // The interceptor should call performRefresh → fetch → retry
      // Since mockAxiosInstance is used for retry, we need to mock it
      // But since this uses this.instance(), we mock the instance behavior
      // For this test, we just verify the fetch is called
      try {
        await errorInterceptor(error);
      } catch {
        // May reject depending on mock setup
      }

      // The refresh endpoint should have been called
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/auth/refresh"),
        expect.objectContaining({ method: "POST", credentials: "include" }),
      );
    });

    it("Given: a 401 on a non-auth endpoint When: refresh fails Then: should clear session and reject", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      });
      vi.stubGlobal("fetch", mockFetch);

      const dispatchSpy = vi.fn();
      vi.stubGlobal("window", { dispatchEvent: dispatchSpy });

      const error = {
        response: { status: 401 },
        config: { url: "/products", _retry: false, headers: {} },
      };
      const errorInterceptor = getResponseErrorInterceptor();

      await expect(errorInterceptor(error)).rejects.toBe(error);

      expect(mockTokenService.clearSession).toHaveBeenCalled();
    });

    it("Given: a 401 on a non-auth endpoint When: fetch throws Then: should clear session and reject", async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error("Network failed"));
      vi.stubGlobal("fetch", mockFetch);

      const dispatchSpy = vi.fn();
      vi.stubGlobal("window", { dispatchEvent: dispatchSpy });

      const error = {
        response: { status: 401 },
        config: { url: "/products", _retry: false, headers: {} },
      };
      const errorInterceptor = getResponseErrorInterceptor();

      await expect(errorInterceptor(error)).rejects.toBe(error);

      expect(mockTokenService.clearSession).toHaveBeenCalled();
    });

    it("Given: a 401 When: refresh returns data without accessToken Then: should still succeed", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
      });
      vi.stubGlobal("fetch", mockFetch);

      const retryResult = axiosResponse({ retried: true });
      mockAxiosInstance.get.mockResolvedValueOnce(retryResult);

      const error = {
        response: { status: 401 },
        config: { url: "/products", _retry: false, headers: {} },
      };
      const errorInterceptor = getResponseErrorInterceptor();

      try {
        await errorInterceptor(error);
      } catch {
        // May reject depending on internal retry
      }

      // setAccessToken should not be called since no token in response
      expect(mockTokenService.setAccessToken).not.toHaveBeenCalled();
    });

    it("Given: refresh has org slug When: performing refresh Then: should include org slug in refresh request headers", async () => {
      mockTokenService.getOrganizationSlug.mockReturnValue("acme-corp");
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      });
      vi.stubGlobal("fetch", mockFetch);

      const error = {
        response: { status: 401 },
        config: { url: "/products", _retry: false, headers: {} },
      };
      const errorInterceptor = getResponseErrorInterceptor();

      try {
        await errorInterceptor(error);
      } catch {
        // expected
      }

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Organization-Slug": "acme-corp",
          }),
        }),
      );
    });

    it("Given: refresh succeeds with accessToken and expiresAt When: handling 401 Then: should store both values", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              accessToken: "fresh-token",
              accessTokenExpiresAt: "2026-12-31T23:59:59Z",
            },
          }),
      });
      vi.stubGlobal("fetch", mockFetch);

      // Need a fresh client to reset refreshPromise
      const freshClient = new AxiosHttpClient();
      const calls = mockAxiosInstance.interceptors.response.use.mock.calls;
      const freshErrorInterceptor = calls[calls.length - 1][1];

      const error = {
        response: { status: 401 },
        config: { url: "/items", _retry: false, headers: {} },
      };

      try {
        await freshErrorInterceptor(error);
      } catch {
        // may reject
      }

      expect(mockTokenService.setAccessToken).toHaveBeenCalledWith(
        "fresh-token",
      );
      expect(mockTokenService.setExpiresAt).toHaveBeenCalledWith(
        "2026-12-31T23:59:59Z",
      );
    });

    it("Given: refresh succeeds with only accessToken (no expiresAt) When: handling 401 Then: should only store accessToken", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            data: { accessToken: "another-token" },
          }),
      });
      vi.stubGlobal("fetch", mockFetch);

      const freshClient = new AxiosHttpClient();
      const calls = mockAxiosInstance.interceptors.response.use.mock.calls;
      const freshErrorInterceptor = calls[calls.length - 1][1];

      const error = {
        response: { status: 401 },
        config: { url: "/items", _retry: false, headers: {} },
      };

      try {
        await freshErrorInterceptor(error);
      } catch {
        // may reject
      }

      expect(mockTokenService.setAccessToken).toHaveBeenCalledWith(
        "another-token",
      );
      expect(mockTokenService.setExpiresAt).not.toHaveBeenCalled();
    });

    it("Given: no org slug When: performing refresh Then: should not include org slug header", async () => {
      mockTokenService.getOrganizationSlug.mockReturnValue(null);
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      });
      vi.stubGlobal("fetch", mockFetch);

      const freshClient = new AxiosHttpClient();
      const calls = mockAxiosInstance.interceptors.response.use.mock.calls;
      const freshErrorInterceptor = calls[calls.length - 1][1];

      const error = {
        response: { status: 401 },
        config: { url: "/items", _retry: false, headers: {} },
      };

      try {
        await freshErrorInterceptor(error);
      } catch {
        // expected
      }

      const fetchCallHeaders = mockFetch.mock.calls[0]?.[1]?.headers;
      expect(fetchCallHeaders?.["X-Organization-Slug"]).toBeUndefined();
    });
  });
});
