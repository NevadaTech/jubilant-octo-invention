import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { env } from "@/config/env";
import { TokenService } from "@/modules/authentication/infrastructure/services/token.service";
import type {
  HttpClientPort,
  HttpClientConfig,
  HttpRequestConfig,
  HttpResponse,
} from "@/shared/application/ports/http-client.port";

/**
 * Axios HTTP Client Adapter
 * Auth tokens are sent as HttpOnly cookies via the BFF proxy.
 * Organization headers are still injected from client-side storage.
 */
export class AxiosHttpClient implements HttpClientPort {
  private readonly instance: AxiosInstance;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(config?: HttpClientConfig) {
    this.instance = axios.create({
      baseURL: config?.baseURL ?? env.NEXT_PUBLIC_API_URL,
      timeout: config?.timeout ?? env.NEXT_PUBLIC_API_TIMEOUT,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        ...config?.headers,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor — add auth + org headers
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const accessToken = TokenService.getAccessToken();
        const organizationSlug = TokenService.getOrganizationSlug();
        const organizationId = TokenService.getOrganizationId();
        const user = TokenService.getUser();

        if (accessToken) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }

        if (organizationSlug) {
          config.headers["X-Organization-Slug"] = organizationSlug;
        }

        if (organizationId) {
          config.headers["X-Organization-ID"] = organizationId;
        }

        if (user?.id) {
          config.headers["X-User-ID"] = user.id;
        }

        // Let axios auto-detect Content-Type for FormData (multipart/form-data)
        if (
          typeof FormData !== "undefined" &&
          config.data instanceof FormData
        ) {
          delete config.headers["Content-Type"];
        }

        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor — handle 401 with BFF refresh
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // Skip refresh logic for auth endpoints to avoid loops
        const isAuthEndpoint = originalRequest.url?.startsWith("/auth/");

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !isAuthEndpoint
        ) {
          originalRequest._retry = true;

          const refreshed = await this.performRefresh();

          if (refreshed) {
            // Retry — cookie is updated server-side, just replay the request
            return this.instance(originalRequest);
          }

          return Promise.reject(error);
        }

        return Promise.reject(error);
      },
    );
  }

  /**
   * Performs token refresh via BFF with concurrency protection.
   * Returns true if refresh succeeded, false otherwise.
   */
  private async performRefresh(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const organizationSlug = TokenService.getOrganizationSlug();

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (organizationSlug) {
          headers["X-Organization-Slug"] = organizationSlug;
        }

        const refreshResponse = await fetch(
          `${env.NEXT_PUBLIC_APP_URL}/api/auth/refresh`,
          {
            method: "POST",
            headers,
            credentials: "include",
          },
        );

        if (refreshResponse.ok) {
          const result = await refreshResponse.json();
          if (result.data?.accessToken) {
            TokenService.setAccessToken(result.data.accessToken);
          }
          if (result.data?.accessTokenExpiresAt) {
            TokenService.setExpiresAt(result.data.accessTokenExpiresAt);
          }
          return true;
        }

        TokenService.clearSession();

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:session-expired"));
        }

        return false;
      } catch {
        TokenService.clearSession();

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:session-expired"));
        }

        return false;
      }
    })();

    this.refreshPromise.finally(() => {
      setTimeout(() => {
        this.refreshPromise = null;
      }, 10_000);
    });

    return this.refreshPromise;
  }

  private toHttpResponse<T>(response: {
    data: T;
    status: number;
    headers: Record<string, unknown>;
  }): HttpResponse<T> {
    return {
      data: response.data,
      status: response.status,
      headers: response.headers as Record<string, string>,
    };
  }

  async get<T>(
    url: string,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>> {
    const response = await this.instance.get<T>(url, config);
    return this.toHttpResponse(response);
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>> {
    const response = await this.instance.post<T>(url, data, config);
    return this.toHttpResponse(response);
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>> {
    const response = await this.instance.put<T>(url, data, config);
    return this.toHttpResponse(response);
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>> {
    const response = await this.instance.patch<T>(url, data, config);
    return this.toHttpResponse(response);
  }

  async delete<T>(
    url: string,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>> {
    const response = await this.instance.delete<T>(url, config);
    return this.toHttpResponse(response);
  }
}

// Singleton instance for easy use
export const apiClient = new AxiosHttpClient();
