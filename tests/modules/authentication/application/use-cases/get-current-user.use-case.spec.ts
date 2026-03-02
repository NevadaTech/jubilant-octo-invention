import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetCurrentUserUseCase } from "@/modules/authentication/application/use-cases/get-current-user.use-case";
import type { AuthRepositoryPort } from "@/modules/authentication/domain/ports/auth-repository.port";
import { User } from "@/modules/authentication/domain/entities/user";

describe("GetCurrentUserUseCase", () => {
  let useCase: GetCurrentUserUseCase;
  let mockAuthRepository: {
    login: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
    getCurrentUser: ReturnType<typeof vi.fn>;
    refreshToken: ReturnType<typeof vi.fn>;
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

  beforeEach(() => {
    mockAuthRepository = {
      login: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      refreshToken: vi.fn(),
    };
    useCase = new GetCurrentUserUseCase(
      mockAuthRepository as AuthRepositoryPort,
    );
  });

  it("Given: an authenticated user When: execute is called Then: should return the current user", async () => {
    // Arrange
    mockAuthRepository.getCurrentUser.mockResolvedValue(mockUser);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(mockAuthRepository.getCurrentUser).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockUser);
    expect(result?.id).toBe("user-1");
    expect(result?.email).toBe("user@test.com");
  });

  it("Given: no authenticated user When: execute is called Then: should return null", async () => {
    // Arrange
    mockAuthRepository.getCurrentUser.mockResolvedValue(null);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(mockAuthRepository.getCurrentUser).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
  });
});
