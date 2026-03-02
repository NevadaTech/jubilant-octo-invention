import { describe, it, expect } from "vitest";
import {
  createUserSchema,
  toCreateUserDto,
  type CreateUserFormData,
} from "@/modules/users/presentation/schemas/user.schema";

describe("createUserSchema", () => {
  const validData: CreateUserFormData = {
    email: "john.doe@example.com",
    username: "johndoe",
    password: "securePass1",
    firstName: "John",
    lastName: "Doe",
  };

  describe("Given valid user data", () => {
    it("When parsed, Then it should pass validation", () => {
      // Arrange
      const data = { ...validData };

      // Act
      const result = createUserSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe("Given an invalid email", () => {
    it("When parsed, Then it should fail validation", () => {
      // Arrange
      const data = { ...validData, email: "not-an-email" };

      // Act
      const result = createUserSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe("Given a username shorter than 3 characters", () => {
    it("When parsed, Then it should fail validation", () => {
      // Arrange
      const data = { ...validData, username: "ab" };

      // Act
      const result = createUserSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe("Given a password shorter than 8 characters", () => {
    it("When parsed, Then it should fail validation", () => {
      // Arrange
      const data = { ...validData, password: "short" };

      // Act
      const result = createUserSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe("Given a firstName shorter than 2 characters", () => {
    it("When parsed, Then it should fail validation", () => {
      // Arrange
      const data = { ...validData, firstName: "J" };

      // Act
      const result = createUserSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe("Given a lastName shorter than 2 characters", () => {
    it("When parsed, Then it should fail validation", () => {
      // Arrange
      const data = { ...validData, lastName: "D" };

      // Act
      const result = createUserSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
    });
  });
});

describe("toCreateUserDto", () => {
  describe("Given valid form data", () => {
    it("When mapped, Then it should produce a DTO with all fields", () => {
      // Arrange
      const formData: CreateUserFormData = {
        email: "jane.doe@example.com",
        username: "janedoe",
        password: "strongPass123",
        firstName: "Jane",
        lastName: "Doe",
      };

      // Act
      const dto = toCreateUserDto(formData);

      // Assert
      expect(dto.email).toBe("jane.doe@example.com");
      expect(dto.username).toBe("janedoe");
      expect(dto.password).toBe("strongPass123");
      expect(dto.firstName).toBe("Jane");
      expect(dto.lastName).toBe("Doe");
    });
  });
});
