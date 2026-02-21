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
 * Implements HttpClientPort with axios, including auth interceptors
 */
export class AxiosHttpClient implements HttpClientPort {
  private readonly instance: AxiosInstance;
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(config?: HttpClientConfig) {
    this.instance = axios.create({
      baseURL: config?.baseURL ?? env.NEXT_PUBLIC_API_URL,
      timeout: config?.timeout ?? env.NEXT_PUBLIC_API_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        ...config?.headers,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - Add auth headers
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const accessToken = TokenService.getAccessToken();
        const organizationSlug = TokenService.getOrganizationSlug();
        const organizationId = TokenService.getOrganizationId();
        const user = TokenService.getUser();

        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
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

        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor - Handle errors
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle 401 - Attempt token refresh before clearing session
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const newAccessToken = await this.performRefresh();

          if (newAccessToken) {
            // Retry the original request with new token
            if (originalRequest.headers) {
              (
                originalRequest.headers as Record<string, string>
              ).Authorization = `Bearer ${newAccessToken}`;
            }
            return this.instance(originalRequest);
          }

          // Refresh failed — redirect to login
          return Promise.reject(error);
        }

        return Promise.reject(error);
      },
    );
  }

  /**
   * Performs token refresh with concurrency protection.
   * Multiple 401s will share a single refresh request.
   * Returns the new access token or null if refresh failed.
   */
  private async performRefresh(): Promise<string | null> {
    // If already refreshing, wait for the existing promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = TokenService.getRefreshToken();
    if (!refreshToken) {
      TokenService.clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return null;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const organizationSlug = TokenService.getOrganizationSlug();
        const organizationId = TokenService.getOrganizationId();

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (organizationSlug) {
          headers["X-Organization-Slug"] = organizationSlug;
        }
        if (organizationId) {
          headers["X-Organization-ID"] = organizationId;
        }

        const refreshResponse = await axios.post(
          `${env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken },
          { headers },
        );

        const {
          accessToken,
          refreshToken: newRefresh,
          expiresAt,
        } = refreshResponse.data?.data ?? refreshResponse.data ?? {};

        if (accessToken) {
          TokenService.setTokens({
            accessToken,
            refreshToken: newRefresh ?? refreshToken,
            expiresAt:
              expiresAt ?? new Date(Date.now() + 3600000).toISOString(),
          });
          return accessToken as string;
        }

        // No access token in response
        TokenService.clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return null;
      } catch {
        // Refresh failed — clear session and redirect
        TokenService.clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return null;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

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
