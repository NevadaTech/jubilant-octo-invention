import { describe, it, expect } from "vitest";
import { Tokens } from "@/modules/authentication/domain/value-objects/tokens";

describe("Tokens Value Object", () => {
  describe("create", () => {
    it("Given: valid token data When: creating tokens Then: should create with correct values", () => {
      // Arrange
      const accessToken = "access-token";
      const refreshToken = "refresh-token";
      const expiresAt = new Date(Date.now() + 3600000);

      // Act
      const tokens = Tokens.create(accessToken, refreshToken, expiresAt);

      // Assert
      expect(tokens.accessToken).toBe(accessToken);
      expect(tokens.refreshToken).toBe(refreshToken);
      expect(tokens.expiresAt).toEqual(expiresAt);
    });
  });

  describe("isExpired", () => {
    it("Given: tokens with future expiration When: checking expiration Then: should return false", () => {
      // Arrange
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now
      const tokens = Tokens.create("access-token", "refresh-token", expiresAt);

      // Act
      const result = tokens.isExpired();

      // Assert
      expect(result).toBe(false);
    });

    it("Given: tokens with past expiration When: checking expiration Then: should return true", () => {
      // Arrange
      const expiresAt = new Date(Date.now() - 1000); // 1 second ago
      const tokens = Tokens.create("access-token", "refresh-token", expiresAt);

      // Act
      const result = tokens.isExpired();

      // Assert
      expect(result).toBe(true);
    });
  });

  describe("isAboutToExpire", () => {
    it("Given: tokens expiring within threshold When: checking about to expire Then: should return true", () => {
      // Arrange
      const expiresAt = new Date(Date.now() + 30000); // 30 seconds from now
      const tokens = Tokens.create("access-token", "refresh-token", expiresAt);
      const threshold = 60000; // 1 minute

      // Act
      const result = tokens.isAboutToExpire(threshold);

      // Assert
      expect(result).toBe(true);
    });

    it("Given: tokens with plenty of time When: checking about to expire Then: should return false", () => {
      // Arrange
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now
      const tokens = Tokens.create("access-token", "refresh-token", expiresAt);
      const threshold = 60000; // 1 minute

      // Act
      const result = tokens.isAboutToExpire(threshold);

      // Assert
      expect(result).toBe(false);
    });
  });
});
