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
import type { LoginResponseDto } from "@/modules/authentication/application/dto/login.dto";
import { env } from "@/config/env";
import { TokenService } from "@/modules/authentication/infrastructure/services/token.service";
import {
  AuthApiError,
  getAuthErrorCode,
} from "@/modules/authentication/infrastructure/errors/auth-api.error";

export class AuthApiAdapter implements AuthRepositoryPort {
  private readonly baseUrl = env.NEXT_PUBLIC_API_URL;

  async login(
    credentials: LoginCredentials,
  ): Promise<{ user: User; tokens: Tokens }> {
    const { organizationSlug, email, password } = credentials;

    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Organization-Slug": organizationSlug,
      },
      body: JSON.stringify({ email, password }),
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

    const result: LoginResponseDto = await response.json();
    const { data } = result;

    const expiresAt = new Date(data.accessTokenExpiresAt);
    const tokens = Tokens.create(
      data.accessToken,
      data.refreshToken,
      expiresAt,
    );

    // Store tokens, user and organization slug
    TokenService.setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.accessTokenExpiresAt,
    });
    TokenService.setUser(data.user);
    TokenService.setOrganizationSlug(organizationSlug);

    // Extract and store org_id from JWT
    const orgId = TokenService.extractOrgIdFromToken();
    if (orgId) {
      TokenService.setOrganizationId(orgId);
    }

    return {
      user: UserMapper.toDomain(data.user),
      tokens,
    };
  }

  async logout(): Promise<void> {
    const accessToken = TokenService.getAccessToken();
    const organizationSlug = TokenService.getOrganizationSlug();

    try {
      await fetch(`${this.baseUrl}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          ...(organizationSlug && { "X-Organization-Slug": organizationSlug }),
        },
      });
    } finally {
      TokenService.clearTokens();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const accessToken = TokenService.getAccessToken();

    if (!accessToken || TokenService.isTokenExpired()) {
      return null;
    }

    // Get user from local storage (saved during login)
    const storedUser = TokenService.getUser();
    if (!storedUser) {
      return null;
    }

    return UserMapper.toDomain(storedUser);
  }

  async refreshToken(refreshTokenValue: string): Promise<Tokens> {
    const organizationSlug = TokenService.getOrganizationSlug();

    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(organizationSlug && { "X-Organization-Slug": organizationSlug }),
      },
      body: JSON.stringify({ refreshToken: refreshTokenValue }),
    });

    if (!response.ok) {
      TokenService.clearTokens();
      throw new Error("Token refresh failed");
    }

    const result = await response.json();
    const data = result.data || result;
    const expiresAt = new Date(data.accessTokenExpiresAt);

    TokenService.setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.accessTokenExpiresAt,
    });

    return Tokens.create(data.accessToken, data.refreshToken, expiresAt);
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
