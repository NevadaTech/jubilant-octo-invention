import { describe, it, expect } from "vitest";
import { User } from "@/modules/users/domain/entities/user.entity";

describe("User Entity", () => {
  const validProps = {
    id: "user-1",
    email: "john@example.com",
    username: "johndoe",
    firstName: "John",
    lastName: "Doe",
    status: "ACTIVE" as const,
    roles: ["admin"],
    lastLoginAt: new Date("2025-02-28T08:00:00.000Z"),
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    updatedAt: new Date("2025-02-28T08:00:00.000Z"),
  };

  describe("create", () => {
    it("Given valid props, When User.create is called, Then it creates a User entity with all properties", () => {
      // Arrange
      const props = { ...validProps };

      // Act
      const user = User.create(props);

      // Assert
      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe("user-1");
      expect(user.email).toBe("john@example.com");
      expect(user.username).toBe("johndoe");
      expect(user.firstName).toBe("John");
      expect(user.lastName).toBe("Doe");
      expect(user.status).toBe("ACTIVE");
      expect(user.roles).toEqual(["admin"]);
      expect(user.lastLoginAt).toEqual(new Date("2025-02-28T08:00:00.000Z"));
      expect(user.createdAt).toEqual(new Date("2025-01-01T00:00:00.000Z"));
      expect(user.updatedAt).toEqual(new Date("2025-02-28T08:00:00.000Z"));
    });
  });

  describe("fullName", () => {
    it("Given a User with firstName and lastName, When fullName is accessed, Then it returns the concatenated name", () => {
      // Arrange
      const user = User.create(validProps);

      // Act
      const fullName = user.fullName;

      // Assert
      expect(fullName).toBe("John Doe");
    });
  });

  describe("isActive", () => {
    it("Given a User with ACTIVE status, When isActive is accessed, Then it returns true", () => {
      // Arrange
      const user = User.create({ ...validProps, status: "ACTIVE" as const });

      // Act & Assert
      expect(user.isActive).toBe(true);
      expect(user.isInactive).toBe(false);
      expect(user.isLocked).toBe(false);
    });
  });

  describe("isInactive", () => {
    it("Given a User with INACTIVE status, When isInactive is accessed, Then it returns true", () => {
      // Arrange
      const user = User.create({ ...validProps, status: "INACTIVE" as const });

      // Act & Assert
      expect(user.isInactive).toBe(true);
      expect(user.isActive).toBe(false);
      expect(user.isLocked).toBe(false);
    });
  });

  describe("isLocked", () => {
    it("Given a User with LOCKED status, When isLocked is accessed, Then it returns true", () => {
      // Arrange
      const user = User.create({ ...validProps, status: "LOCKED" as const });

      // Act & Assert
      expect(user.isLocked).toBe(true);
      expect(user.isActive).toBe(false);
      expect(user.isInactive).toBe(false);
    });
  });

  describe("lastLoginAt", () => {
    it("Given a User with null lastLoginAt, When lastLoginAt is accessed, Then it returns null", () => {
      // Arrange
      const user = User.create({ ...validProps, lastLoginAt: null });

      // Act & Assert
      expect(user.lastLoginAt).toBeNull();
    });

    it("Given a User with a lastLoginAt date, When lastLoginAt is accessed, Then it returns the Date object", () => {
      // Arrange
      const user = User.create(validProps);

      // Act & Assert
      expect(user.lastLoginAt).toEqual(new Date("2025-02-28T08:00:00.000Z"));
      expect(user.lastLoginAt).toBeInstanceOf(Date);
    });
  });

  describe("roles", () => {
    it("Given a User with multiple roles, When roles is accessed, Then it returns the full roles array", () => {
      // Arrange
      const user = User.create({ ...validProps, roles: ["admin", "manager", "viewer"] });

      // Act & Assert
      expect(user.roles).toEqual(["admin", "manager", "viewer"]);
      expect(user.roles).toHaveLength(3);
    });

    it("Given a User with empty roles, When roles is accessed, Then it returns an empty array", () => {
      // Arrange
      const user = User.create({ ...validProps, roles: [] });

      // Act & Assert
      expect(user.roles).toEqual([]);
      expect(user.roles).toHaveLength(0);
    });
  });
});
