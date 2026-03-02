import { describe, it, expect } from "vitest";
import { UserMapper } from "@/modules/users/application/mappers/user.mapper";
import type { UserResponseDto } from "@/modules/users/application/dto/user.dto";

describe("UserMapper", () => {
  const mockDto: UserResponseDto = {
    id: "user-1",
    email: "john@example.com",
    username: "johndoe",
    firstName: "John",
    lastName: "Doe",
    status: "ACTIVE",
    roles: ["admin", "user"],
    lastLoginAt: "2025-02-28T08:00:00.000Z",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-02-28T08:00:00.000Z",
  };

  describe("toDomain", () => {
    it("Given a valid UserResponseDto, When toDomain is called, Then it should map all fields to a User entity", () => {
      // Arrange
      const dto = { ...mockDto };

      // Act
      const entity = UserMapper.toDomain(dto);

      // Assert
      expect(entity.id).toBe("user-1");
      expect(entity.email).toBe("john@example.com");
      expect(entity.username).toBe("johndoe");
      expect(entity.firstName).toBe("John");
      expect(entity.lastName).toBe("Doe");
      expect(entity.status).toBe("ACTIVE");
      expect(entity.roles).toEqual(["admin", "user"]);
    });

    it("Given a DTO with ISO date strings, When toDomain is called, Then dates should be converted to Date objects", () => {
      // Arrange
      const dto = { ...mockDto };

      // Act
      const entity = UserMapper.toDomain(dto);

      // Assert
      expect(entity.createdAt).toBeInstanceOf(Date);
      expect(entity.updatedAt).toBeInstanceOf(Date);
      expect(entity.createdAt.toISOString()).toBe("2025-01-01T00:00:00.000Z");
      expect(entity.updatedAt.toISOString()).toBe("2025-02-28T08:00:00.000Z");
    });

    it("Given a DTO with a lastLoginAt string, When toDomain is called, Then lastLoginAt should be a Date", () => {
      // Arrange
      const dto = { ...mockDto };

      // Act
      const entity = UserMapper.toDomain(dto);

      // Assert
      expect(entity.lastLoginAt).toBeInstanceOf(Date);
      expect(entity.lastLoginAt!.toISOString()).toBe(
        "2025-02-28T08:00:00.000Z",
      );
    });

    it("Given a DTO with null lastLoginAt, When toDomain is called, Then lastLoginAt should be null", () => {
      // Arrange
      const dto: UserResponseDto = { ...mockDto, lastLoginAt: null };

      // Act
      const entity = UserMapper.toDomain(dto);

      // Assert
      expect(entity.lastLoginAt).toBeNull();
    });

    it("Given a DTO with firstName and lastName, When toDomain is called, Then fullName should be computed", () => {
      // Arrange
      const dto = { ...mockDto };

      // Act
      const entity = UserMapper.toDomain(dto);

      // Assert
      expect(entity.fullName).toBe("John Doe");
    });

    it("Given a DTO with ACTIVE status, When toDomain is called, Then isActive should return true", () => {
      // Arrange
      const dto: UserResponseDto = { ...mockDto, status: "ACTIVE" };

      // Act
      const entity = UserMapper.toDomain(dto);

      // Assert
      expect(entity.isActive).toBe(true);
      expect(entity.isInactive).toBe(false);
      expect(entity.isLocked).toBe(false);
    });

    it("Given a DTO with INACTIVE status, When toDomain is called, Then isInactive should return true", () => {
      // Arrange
      const dto: UserResponseDto = { ...mockDto, status: "INACTIVE" };

      // Act
      const entity = UserMapper.toDomain(dto);

      // Assert
      expect(entity.isActive).toBe(false);
      expect(entity.isInactive).toBe(true);
      expect(entity.isLocked).toBe(false);
    });

    it("Given a DTO with LOCKED status, When toDomain is called, Then isLocked should return true", () => {
      // Arrange
      const dto: UserResponseDto = { ...mockDto, status: "LOCKED" };

      // Act
      const entity = UserMapper.toDomain(dto);

      // Assert
      expect(entity.isActive).toBe(false);
      expect(entity.isInactive).toBe(false);
      expect(entity.isLocked).toBe(true);
    });
  });
});
