import { describe, it, expect } from "vitest";
import { User } from "@/modules/authentication/domain/entities/user";

describe("User Entity", () => {
  const validUserProps = {
    id: "user-123",
    email: "test@example.com",
    firstName: "John",
    lastName: "Doe",
    organizationId: "org-123",
    roles: ["admin"],
    permissions: ["read:products", "write:products"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe("create", () => {
    it("Given: valid user props When: creating user Then: should create user with correct data", () => {
      // Arrange
      const props = { ...validUserProps };

      // Act
      const user = User.create(props);

      // Assert
      expect(user.id).toBe(props.id);
      expect(user.email).toBe(props.email);
      expect(user.firstName).toBe(props.firstName);
      expect(user.lastName).toBe(props.lastName);
    });

    it("Given: user with first and last name When: getting full name Then: should return concatenated name", () => {
      // Arrange
      const props = { ...validUserProps };

      // Act
      const user = User.create(props);

      // Assert
      expect(user.fullName).toBe("John Doe");
    });
  });

  describe("hasPermission", () => {
    it("Given: user with permissions When: checking existing permission Then: should return true", () => {
      // Arrange
      const user = User.create(validUserProps);

      // Act
      const result = user.hasPermission("read:products");

      // Assert
      expect(result).toBe(true);
    });

    it("Given: user with permissions When: checking non-existing permission Then: should return false", () => {
      // Arrange
      const user = User.create(validUserProps);

      // Act
      const result = user.hasPermission("delete:products");

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("hasAnyPermission", () => {
    it("Given: user with permissions When: checking with at least one matching Then: should return true", () => {
      // Arrange
      const user = User.create(validUserProps);

      // Act
      const result = user.hasAnyPermission([
        "read:products",
        "delete:products",
      ]);

      // Assert
      expect(result).toBe(true);
    });

    it("Given: user with permissions When: checking with no matching Then: should return false", () => {
      // Arrange
      const user = User.create(validUserProps);

      // Act
      const result = user.hasAnyPermission(["delete:products", "admin:all"]);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("hasAllPermissions", () => {
    it("Given: user with permissions When: checking with all matching Then: should return true", () => {
      // Arrange
      const user = User.create(validUserProps);

      // Act
      const result = user.hasAllPermissions([
        "read:products",
        "write:products",
      ]);

      // Assert
      expect(result).toBe(true);
    });

    it("Given: user with permissions When: checking with some not matching Then: should return false", () => {
      // Arrange
      const user = User.create(validUserProps);

      // Act
      const result = user.hasAllPermissions([
        "read:products",
        "delete:products",
      ]);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("hasRole", () => {
    it("Given: user with roles When: checking existing role Then: should return true", () => {
      // Arrange
      const user = User.create(validUserProps);

      // Act
      const result = user.hasRole("admin");

      // Assert
      expect(result).toBe(true);
    });

    it("Given: user with roles When: checking non-existing role Then: should return false", () => {
      // Arrange
      const user = User.create(validUserProps);

      // Act
      const result = user.hasRole("viewer");

      // Assert
      expect(result).toBe(false);
    });
  });
});
