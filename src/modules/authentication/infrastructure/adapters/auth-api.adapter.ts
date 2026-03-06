import type {
  AuthRepositoryPort,
  LoginCredentials,
} from "@/modules/authentication/domain/ports/auth-repository.port";
import type {
  RequestPasswordResetDto,
  RequestPasswordResetResponseDto,
  VerifyOtpDto,
  VerifyOtpResponseDto,
  ResetPasswordDto,
  ResetPasswordResponseDto,
} from "@/modules/authentication/application/dto/password-reset.dto";
import type { User } from "@/modules/authentication/domain/entities/user";
import { Tokens } from "@/modules/authentication/domain/value-objects/tokens";
import { UserMapper } from "@/modules/authentication/infrastructure/mappers/user.mapper";
import { env } from "@/config/env";
import { TokenService } from "@/modules/authentication/infrastructure/services/token.service";
import {
  AuthApiError,
  getAuthErrorCode,
} from "@/modules/authentication/infrastructure/errors/auth-api.error";

export class AuthApiAdapter implements AuthRepositoryPort {
  private readonly baseUrl = env.NEXT_PUBLIC_API_URL;
  private readonly bffUrl = env.NEXT_PUBLIC_APP_URL;

  async login(
    credentials: LoginCredentials,
  ): Promise<{ user: User; tokens: Tokens }> {
    const { organizationSlug, email, password } = credentials;

    // Call BFF route — tokens are stored in HttpOnly cookies server-side
    const response = await fetch(`${this.bffUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ organizationSlug, email, password }),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
        statusCode?: number;
      };
      const statusCode = errorData.statusCode ?? response.status;
      const code = getAuthErrorCode(statusCode, errorData.error);
      throw new AuthApiError(
        errorData.message ?? "Authentication failed",
        code,
        statusCode,
      );
    }

    const rawResult = await response.json();
    // BFF strips tokens from response, validate the user data
    const data = rawResult.data;
    if (!data?.user || !data?.accessTokenExpiresAt) {
      throw new AuthApiError("Invalid login response from server", "UNKNOWN", 500);
    }

    const expiresAt = new Date(data.accessTokenExpiresAt);
    // Tokens are in HttpOnly cookies, create placeholder Tokens VO
    const tokens = Tokens.create("httponly", "httponly", expiresAt);

    // Store user and organization data (no tokens in localStorage)
    TokenService.setUser(data.user);
    TokenService.setOrganizationSlug(organizationSlug);
    TokenService.setExpiresAt(data.accessTokenExpiresAt);

    return {
      user: UserMapper.toDomain(data.user),
      tokens,
    };
  }

  async logout(): Promise<void> {
    const organizationSlug = TokenService.getOrganizationSlug();

    try {
      await fetch(`${this.bffUrl}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(organizationSlug && { "X-Organization-Slug": organizationSlug }),
        },
        credentials: "include",
      });
    } finally {
      TokenService.clearSession();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (TokenService.isTokenExpired()) {
      return null;
    }

    const storedUser = TokenService.getUser();
    if (!storedUser) {
      return null;
    }

    return UserMapper.toDomain(storedUser);
  }

  async refreshToken(): Promise<Tokens> {
    const organizationSlug = TokenService.getOrganizationSlug();

    // Call BFF refresh — it reads the HttpOnly refresh cookie
    const response = await fetch(`${this.bffUrl}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(organizationSlug && { "X-Organization-Slug": organizationSlug }),
      },
      credentials: "include",
    });

    if (!response.ok) {
      TokenService.clearSession();
      throw new Error("Token refresh failed");
    }

    const result = await response.json();
    const data = result.data;

    if (!data?.accessTokenExpiresAt) {
      TokenService.clearSession();
      throw new Error("Invalid refresh response from server");
    }

    const expiresAt = new Date(data.accessTokenExpiresAt);
    TokenService.setExpiresAt(data.accessTokenExpiresAt);

    // Update stored user with latest data (including orgSettings)
    if (data.user) {
      const currentUser = TokenService.getUser();
      if (currentUser) {
        TokenService.setUser({ ...currentUser, ...data.user });
      }
    }

    return Tokens.create("httponly", "httponly", expiresAt);
  }

  async requestPasswordReset(
    data: RequestPasswordResetDto,
  ): Promise<RequestPasswordResetResponseDto> {
    const response = await fetch(`${this.baseUrl}/password-reset/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Organization-Slug": data.organizationSlug,
      },
      body: JSON.stringify({ email: data.email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        (errorData as { message?: string }).message ||
          "Failed to request password reset",
      );
    }

    return response.json();
  }

  async verifyOtp(data: VerifyOtpDto): Promise<VerifyOtpResponseDto> {
    const response = await fetch(`${this.baseUrl}/password-reset/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Organization-Slug": data.organizationSlug,
      },
      body: JSON.stringify({ email: data.email, otpCode: data.otpCode }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        (errorData as { message?: string }).message ||
          "Invalid or expired code",
      );
    }

    return response.json();
  }

  async resetPassword(
    data: ResetPasswordDto,
  ): Promise<ResetPasswordResponseDto> {
    const response = await fetch(`${this.baseUrl}/password-reset/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Organization-Slug": data.organizationSlug,
      },
      body: JSON.stringify({
        email: data.email,
        otpCode: data.otpCode,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        (errorData as { message?: string }).message ||
          "Failed to reset password",
      );
    }

    return response.json();
  }
}
