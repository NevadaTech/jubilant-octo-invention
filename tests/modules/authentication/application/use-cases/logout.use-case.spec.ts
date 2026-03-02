import { describe, it, expect, vi, beforeEach } from "vitest";
import { LogoutUseCase } from "@/modules/authentication/application/use-cases/logout.use-case";
import type { AuthRepositoryPort } from "@/modules/authentication/domain/ports/auth-repository.port";

describe("LogoutUseCase", () => {
  let useCase: LogoutUseCase;
  let mockAuthRepository: {
    login: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
    getCurrentUser: ReturnType<typeof vi.fn>;
    refreshToken: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockAuthRepository = {
      login: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      refreshToken: vi.fn(),
    };
    useCase = new LogoutUseCase(mockAuthRepository as AuthRepositoryPort);
  });

  it("Given: an authenticated session When: execute is called Then: should call authRepository.logout", async () => {
    // Arrange
    mockAuthRepository.logout.mockResolvedValue(undefined);

    // Act
    await useCase.execute();

    // Assert
    expect(mockAuthRepository.logout).toHaveBeenCalledTimes(1);
  });

  it("Given: a repository failure When: execute is called Then: should propagate the error", async () => {
    // Arrange
    const error = new Error("Network error");
    mockAuthRepository.logout.mockRejectedValue(error);

    // Act & Assert
    await expect(useCase.execute()).rejects.toThrow("Network error");
    expect(mockAuthRepository.logout).toHaveBeenCalledTimes(1);
  });
});
