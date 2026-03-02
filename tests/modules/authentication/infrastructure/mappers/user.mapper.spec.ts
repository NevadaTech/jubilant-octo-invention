import { describe, it, expect } from "vitest";
import { UserMapper } from "@/modules/authentication/infrastructure/mappers/user.mapper";
import type { LoginResponseDto } from "@/modules/authentication/application/dto/login.dto";

type UserDto = LoginResponseDto["data"]["user"];

describe("UserMapper", () => {
  describe("toDomain", () => {
    it("Given: a complete user DTO When: calling toDomain Then: should map all fields to User entity", () => {
      // Arrange
      const dto: UserDto = {
        id: "user-1",
        email: "john@example.com",
        username: "johndoe",
        firstName: "John",
        lastName: "Doe",
        phone: "+1234567890",
        timezone: "America/New_York",
        language: "en",
        jobTitle: "Manager",
        department: "Sales",
        roles: ["ADMIN", "MANAGER"],
        permissions: ["USERS:CREATE", "SALES:READ", "INVENTORY:READ"],
      };

      // Act
      const user = UserMapper.toDomain(dto);

      // Assert
      expect(user.id).toBe("user-1");
      expect(user.email).toBe("john@example.com");
      expect(user.username).toBe("johndoe");
      expect(user.firstName).toBe("John");
      expect(user.lastName).toBe("Doe");
      expect(user.phone).toBe("+1234567890");
      expect(user.timezone).toBe("America/New_York");
      expect(user.language).toBe("en");
      expect(user.jobTitle).toBe("Manager");
      expect(user.department).toBe("Sales");
      expect(user.roles).toEqual(["ADMIN", "MANAGER"]);
      expect(user.permissions).toEqual([
        "USERS:CREATE",
        "SALES:READ",
        "INVENTORY:READ",
      ]);
    });

    it("Given: a DTO with empty roles and permissions When: calling toDomain Then: should map with empty arrays", () => {
      // Arrange
      const dto: UserDto = {
        id: "user-2",
        email: "jane@example.com",
        username: "janedoe",
        firstName: "Jane",
        lastName: "Doe",
        roles: [],
        permissions: [],
      };

      // Act
      const user = UserMapper.toDomain(dto);

      // Assert
      expect(user.roles).toEqual([]);
      expect(user.permissions).toEqual([]);
    });

    it("Given: a DTO with optional fields undefined When: calling toDomain Then: should map optional fields as undefined", () => {
      // Arrange
      const dto: UserDto = {
        id: "user-3",
        email: "minimal@example.com",
        username: "minimal",
        firstName: "Min",
        lastName: "Mal",
        roles: ["USER"],
        permissions: ["SALES:READ"],
      };

      // Act
      const user = UserMapper.toDomain(dto);

      // Assert
      expect(user.phone).toBeUndefined();
      expect(user.timezone).toBeUndefined();
      expect(user.language).toBeUndefined();
      expect(user.jobTitle).toBeUndefined();
      expect(user.department).toBeUndefined();
    });

    it("Given: a mapped user When: checking fullName Then: should compose first and last name", () => {
      // Arrange
      const dto: UserDto = {
        id: "user-4",
        email: "test@example.com",
        username: "testuser",
        firstName: "Alice",
        lastName: "Wonderland",
        roles: [],
        permissions: [],
      };

      // Act
      const user = UserMapper.toDomain(dto);

      // Assert
      expect(user.fullName).toBe("Alice Wonderland");
    });

    it("Given: a mapped user with permissions When: checking hasPermission Then: should reflect DTO permissions", () => {
      // Arrange
      const dto: UserDto = {
        id: "user-5",
        email: "admin@example.com",
        username: "admin",
        firstName: "Admin",
        lastName: "User",
        roles: ["ADMIN"],
        permissions: ["USERS:CREATE", "USERS:DELETE"],
      };

      // Act
      const user = UserMapper.toDomain(dto);

      // Assert
      expect(user.hasPermission("USERS:CREATE")).toBe(true);
      expect(user.hasPermission("SALES:READ")).toBe(false);
      expect(user.hasRole("ADMIN")).toBe(true);
      expect(user.hasRole("USER")).toBe(false);
    });
  });
});
