import { describe, it, expect } from "vitest";
import {
  createRoleSchema,
  toCreateRoleDto,
  type CreateRoleFormData,
} from "@/modules/roles/presentation/schemas/role.schema";

describe("createRoleSchema", () => {
  const validData: CreateRoleFormData = {
    name: "Manager",
    description: "Manages the team",
  };

  describe("Given valid role data", () => {
    it("When parsed, Then it should pass validation", () => {
      // Arrange
      const data = { ...validData };

      // Act
      const result = createRoleSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe("Given a name shorter than 3 characters", () => {
    it("When parsed, Then it should fail validation", () => {
      // Arrange
      const data = { ...validData, name: "Ab" };

      // Act
      const result = createRoleSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe("Given a name longer than 50 characters", () => {
    it("When parsed, Then it should fail validation", () => {
      // Arrange
      const data = { ...validData, name: "A".repeat(51) };

      // Act
      const result = createRoleSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe("Given an empty description", () => {
    it("When parsed, Then it should pass validation", () => {
      // Arrange
      const data = { ...validData, description: "" };

      // Act
      const result = createRoleSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });
  });
});

describe("toCreateRoleDto", () => {
  describe("Given form data with a lowercase name", () => {
    it("When mapped, Then the name should be uppercased", () => {
      // Arrange
      const formData: CreateRoleFormData = {
        name: "manager",
        description: "Manages the team",
      };

      // Act
      const dto = toCreateRoleDto(formData);

      // Assert
      expect(dto.name).toBe("MANAGER");
    });
  });

  describe("Given form data with an empty description", () => {
    it("When mapped, Then description should be undefined", () => {
      // Arrange
      const formData: CreateRoleFormData = {
        name: "Admin",
        description: "",
      };

      // Act
      const dto = toCreateRoleDto(formData);

      // Assert
      expect(dto.description).toBeUndefined();
    });
  });
});
