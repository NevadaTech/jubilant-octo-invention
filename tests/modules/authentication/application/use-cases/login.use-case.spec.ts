import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoginUseCase } from "@/modules/authentication/application/use-cases/login.use-case";
import type { AuthRepositoryPort, LoginCredentials } from "@/modules/authentication/domain/ports/auth-repository.port";
import { User } from "@/modules/authentication/domain/entities/user";
import { Tokens } from "@/modules/authentication/domain/value-objects/tokens";

describe("LoginUseCase", () => {
  let useCase: LoginUseCase;
  let mockAuthRepository: {
    login: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
    getCurrentUser: ReturnType<typeof vi.fn>;
    refreshToken: ReturnType<typeof vi.fn>;
  };

  const mockCredentials: LoginCredentials = {
    organizationSlug: "test-org",
    email: "user@test.com",
    password: "password123",
  };

  const mockUser = User.create({
    id: "user-1",
    email: "user@test.com",
    username: "testuser",
    firstName: "Test",
    lastName: "User",
    roles: ["ADMIN"],
    permissions: ["USERS:READ"],
  });

  const mockTokens = Tokens.create(
    "access-token-123",
    "refresh-token-456",
    new Date(Date.now() + 3600000),
  );

  beforeEach(() => {
    mockAuthRepository = {
      login: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      refreshToken: vi.fn(),
    };
    useCase = new LoginUseCase(mockAuthRepository as AuthRepositoryPort);
  });

  it("Given: valid credentials When: execute is called Then: should return user and tokens", async () => {
    // Arrange
    mockAuthRepository.login.mockResolvedValue({
      user: mockUser,
      tokens: mockTokens,
    });

    // Act
    const result = await useCase.execute(mockCredentials);

    // Assert
    expect(mockAuthRepository.login).toHaveBeenCalledWith(mockCredentials);
    expect(mockAuthRepository.login).toHaveBeenCalledTimes(1);
    expect(result.user).toBe(mockUser);
    expect(result.tokens).toBe(mockTokens);
  });

  it("Given: invalid credentials When: execute is called Then: should propagate repository error", async () => {
    // Arrange
    const error = new Error("Invalid credentials");
    mockAuthRepository.login.mockRejectedValue(error);

    // Act & Assert
    await expect(useCase.execute(mockCredentials)).rejects.toThrow(
      "Invalid credentials",
    );
    expect(mockAuthRepository.login).toHaveBeenCalledWith(mockCredentials);
  });
});
