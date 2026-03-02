import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

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
    getAccessToken: vi.fn(),
    getRefreshToken: vi.fn(),
    getOrganizationSlug: vi.fn(),
    getOrganizationId: vi.fn(),
    getUser: vi.fn(),
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
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

/**
 * Captures the request interceptor fulfilled callback registered via
 * `instance.interceptors.request.use(onFulfilled, onRejected)`.
 */
function getRequestInterceptor(): (config: Record<string, unknown>) => Record<string, unknown> {
  const calls = mockAxiosInstance.interceptors.request.use.mock.calls;
  return calls[calls.length - 1][0];
}

/**
 * Captures the response error interceptor callback registered via
 * `instance.interceptors.response.use(onFulfilled, onRejected)`.
 */
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
    it("Given: no custom config When: creating a client Then: should create an axios instance with env defaults", () => {
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: "http://localhost:8080",
          timeout: 30000,
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

  // ── Request interceptor (auth headers) ──────────────────────────────

  describe("request interceptor", () => {
    it("Given: a valid access token and org data When: a request is intercepted Then: should inject Authorization and org headers", () => {
      mockTokenService.getAccessToken.mockReturnValue("tok-abc");
      mockTokenService.getOrganizationSlug.mockReturnValue("acme-corp");
      mockTokenService.getOrganizationId.mockReturnValue("org-123");
      mockTokenService.getUser.mockReturnValue({ id: "user-1" });

      const interceptor = getRequestInterceptor();
      const config = { headers: {} as Record<string, string> };
      const result = interceptor(config) as { headers: Record<string, string> };

      expect(result.headers.Authorization).toBe("Bearer tok-abc");
      expect(result.headers["X-Organization-Slug"]).toBe("acme-corp");
      expect(result.headers["X-Organization-ID"]).toBe("org-123");
      expect(result.headers["X-User-ID"]).toBe("user-1");
    });

    it("Given: no access token or org data When: a request is intercepted Then: should not set any auth headers", () => {
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

    it("Given: an access token but no user When: a request is intercepted Then: should set Authorization but not X-User-ID", () => {
      mockTokenService.getAccessToken.mockReturnValue("tok-xyz");
      mockTokenService.getOrganizationSlug.mockReturnValue(null);
      mockTokenService.getOrganizationId.mockReturnValue(null);
      mockTokenService.getUser.mockReturnValue(null);

      const interceptor = getRequestInterceptor();
      const config = { headers: {} as Record<string, string> };
      const result = interceptor(config) as { headers: Record<string, string> };

      expect(result.headers.Authorization).toBe("Bearer tok-xyz");
      expect(result.headers["X-User-ID"]).toBeUndefined();
    });
  });

  // ── Response interceptor (error handling & refresh) ─────────────────

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
      expect(mockTokenService.getRefreshToken).not.toHaveBeenCalled();
    });

    it("Given: a 401 with no refresh token available When: the response interceptor handles it Then: should clear tokens and reject", async () => {
      mockTokenService.getRefreshToken.mockReturnValue(null);

      const error = {
        response: { status: 401 },
        config: { url: "/products", headers: {} },
      };
      const errorInterceptor = getResponseErrorInterceptor();

      await expect(errorInterceptor(error)).rejects.toBe(error);
      expect(mockTokenService.clearTokens).toHaveBeenCalled();
    });

    it("Given: a 401 with a valid refresh token When: refresh succeeds Then: should store new tokens and retry the original request", async () => {
      // Set up a callable instance mock so `this.instance(originalRequest)` works
      const retryResponse = axiosResponse({ id: "1" });
      const callableInstance = vi.fn().mockResolvedValueOnce(retryResponse);
      Object.assign(callableInstance, {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      });

      vi.clearAllMocks();
      (axios.create as Mock).mockReturnValueOnce(callableInstance);

      mockTokenService.getRefreshToken.mockReturnValue("refresh-tok");
      mockTokenService.getOrganizationSlug.mockReturnValue("acme");
      mockTokenService.getOrganizationId.mockReturnValue("org-1");

      const refreshResponseData = {
        data: {
          accessToken: "new-access-tok",
          refreshToken: "new-refresh-tok",
          expiresAt: "2026-12-31T00:00:00.000Z",
        },
      };
      (axios.post as Mock).mockResolvedValueOnce({ data: refreshResponseData });

      // Create client - this registers the interceptors on callableInstance
      new AxiosHttpClient();

      // Grab the response error interceptor that was just registered
      const responseErrorInterceptor = (
        callableInstance.interceptors.response.use as Mock
      ).mock.calls[0][1];

      const error = {
        response: { status: 401 },
        config: {
          url: "/products",
          headers: {} as Record<string, string>,
        },
      };

      const result = await responseErrorInterceptor(error);

      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:8080/auth/refresh",
        { refreshToken: "refresh-tok" },
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "X-Organization-Slug": "acme",
            "X-Organization-ID": "org-1",
          }),
        }),
      );
      expect(mockTokenService.setTokens).toHaveBeenCalledWith({
        accessToken: "new-access-tok",
        refreshToken: "new-refresh-tok",
        expiresAt: "2026-12-31T00:00:00.000Z",
      });
      expect(callableInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "/products",
          _retry: true,
          headers: expect.objectContaining({
            Authorization: "Bearer new-access-tok",
          }),
        }),
      );
      expect(result).toBe(retryResponse);
    });

    it("Given: a 401 with a valid refresh token When: refresh fails with an error Then: should clear tokens and reject", async () => {
      mockTokenService.getRefreshToken.mockReturnValue("refresh-tok");
      mockTokenService.getOrganizationSlug.mockReturnValue(null);
      mockTokenService.getOrganizationId.mockReturnValue(null);

      (axios.post as Mock).mockRejectedValueOnce(new Error("Network error"));

      const error = {
        response: { status: 401 },
        config: { url: "/products", headers: {} },
      };
      const errorInterceptor = getResponseErrorInterceptor();

      await expect(errorInterceptor(error)).rejects.toBe(error);
      expect(mockTokenService.clearTokens).toHaveBeenCalled();
    });

    it("Given: a 401 that was already retried When: the response interceptor handles it Then: should not attempt refresh again", async () => {
      const error = {
        response: { status: 401 },
        config: { url: "/products", _retry: true, headers: {} },
      };
      const errorInterceptor = getResponseErrorInterceptor();

      await expect(errorInterceptor(error)).rejects.toBe(error);
      expect(mockTokenService.getRefreshToken).not.toHaveBeenCalled();
    });

    it("Given: a 401 with a refresh token When: refresh returns no accessToken Then: should clear tokens and reject", async () => {
      mockTokenService.getRefreshToken.mockReturnValue("refresh-tok");
      mockTokenService.getOrganizationSlug.mockReturnValue(null);
      mockTokenService.getOrganizationId.mockReturnValue(null);

      // Refresh returns a response but without accessToken
      (axios.post as Mock).mockResolvedValueOnce({
        data: { data: { refreshToken: "new-ref" } },
      });

      const error = {
        response: { status: 401 },
        config: { url: "/products", headers: {} },
      };
      const errorInterceptor = getResponseErrorInterceptor();

      await expect(errorInterceptor(error)).rejects.toBe(error);
      expect(mockTokenService.clearTokens).toHaveBeenCalled();
      expect(mockTokenService.setTokens).not.toHaveBeenCalled();
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

      await expect(
        client.post("/products", { name: "x" }),
      ).rejects.toThrow("Internal Server Error");
    });
  });
});
