import { describe, it, expect } from "vitest";
import {
  createCategorySchema,
  updateCategorySchema,
  toCreateCategoryDto,
  toUpdateCategoryDto,
  type CreateCategoryFormData,
  type UpdateCategoryFormData,
} from "@/modules/inventory/presentation/schemas/category.schema";

describe("Category Schema", () => {
  describe("createCategorySchema", () => {
    it("Given: valid category data When: validating Then: should pass validation", () => {
      // Arrange
      const validData = {
        name: "Electronics",
        description: "Electronic products and accessories",
        parentId: "parent-123",
      };

      // Act
      const result = createCategorySchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
    });

    it("Given: only required name field When: validating Then: should pass validation", () => {
      // Arrange
      const validData = { name: "Furniture" };

      // Act
      const result = createCategorySchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
    });

    it("Given: empty name When: validating Then: should fail validation", () => {
      // Arrange
      const invalidData = { name: "" };

      // Act
      const result = createCategorySchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Name is required");
      }
    });

    it("Given: missing name field When: validating Then: should fail validation", () => {
      // Arrange
      const invalidData = { description: "No name provided" };

      // Act
      const result = createCategorySchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });

    it("Given: name exceeding 100 characters When: validating Then: should fail validation", () => {
      // Arrange
      const invalidData = { name: "A".repeat(101) };

      // Act
      const result = createCategorySchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Name cannot exceed 100 characters",
        );
      }
    });

    it("Given: description exceeding 500 characters When: validating Then: should fail validation", () => {
      // Arrange
      const invalidData = {
        name: "Valid Name",
        description: "D".repeat(501),
      };

      // Act
      const result = createCategorySchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Description cannot exceed 500 characters",
        );
      }
    });

    it("Given: empty string parentId When: validating Then: should pass validation", () => {
      // Arrange
      const validData = { name: "Sub Category", parentId: "" };

      // Act
      const result = createCategorySchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
    });

    it("Given: name at exactly 100 characters When: validating Then: should pass validation", () => {
      // Arrange
      const validData = { name: "A".repeat(100) };

      // Act
      const result = createCategorySchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe("updateCategorySchema", () => {
    it("Given: partial update with only name When: validating Then: should pass validation", () => {
      // Arrange
      const validData = { name: "Updated Name" };

      // Act
      const result = updateCategorySchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
    });

    it("Given: isActive boolean field When: validating Then: should pass validation", () => {
      // Arrange
      const validData = { isActive: false };

      // Act
      const result = updateCategorySchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
    });

    it("Given: empty object When: validating Then: should pass validation since all fields are optional", () => {
      // Arrange
      const validData = {};

      // Act
      const result = updateCategorySchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe("toCreateCategoryDto", () => {
    it("Given: form data with all fields When: converting to DTO Then: should map all fields correctly", () => {
      // Arrange
      const formData: CreateCategoryFormData = {
        name: "Electronics",
        description: "Electronic products",
        parentId: "parent-123",
      };

      // Act
      const dto = toCreateCategoryDto(formData);

      // Assert
      expect(dto.name).toBe("Electronics");
      expect(dto.description).toBe("Electronic products");
      expect(dto.parentId).toBe("parent-123");
    });

    it("Given: form data with empty description and parentId When: converting to DTO Then: should set them as undefined", () => {
      // Arrange
      const formData: CreateCategoryFormData = {
        name: "Simple Category",
        description: "",
        parentId: "",
      };

      // Act
      const dto = toCreateCategoryDto(formData);

      // Assert
      expect(dto.name).toBe("Simple Category");
      expect(dto.description).toBeUndefined();
      expect(dto.parentId).toBeUndefined();
    });

    it("Given: form data with undefined optional fields When: converting to DTO Then: should set them as undefined", () => {
      // Arrange
      const formData: CreateCategoryFormData = {
        name: "Minimal Category",
      };

      // Act
      const dto = toCreateCategoryDto(formData);

      // Assert
      expect(dto.name).toBe("Minimal Category");
      expect(dto.description).toBeUndefined();
      expect(dto.parentId).toBeUndefined();
    });
  });

  describe("toUpdateCategoryDto", () => {
    it("Given: form data with all fields When: converting to DTO Then: should include all defined fields", () => {
      // Arrange
      const formData: UpdateCategoryFormData = {
        name: "Updated",
        description: "Updated desc",
        parentId: "new-parent",
        isActive: true,
      };

      // Act
      const dto = toUpdateCategoryDto(formData);

      // Assert
      expect(dto.name).toBe("Updated");
      expect(dto.description).toBe("Updated desc");
      expect(dto.parentId).toBe("new-parent");
      expect(dto.isActive).toBe(true);
    });

    it("Given: form data with only undefined fields When: converting to DTO Then: should return empty object", () => {
      // Arrange
      const formData: UpdateCategoryFormData = {};

      // Act
      const dto = toUpdateCategoryDto(formData);

      // Assert
      expect(dto).toEqual({});
    });

    it("Given: form data with empty string description When: converting to DTO Then: description should be undefined", () => {
      // Arrange
      const formData: UpdateCategoryFormData = {
        description: "",
        parentId: "",
      };

      // Act
      const dto = toUpdateCategoryDto(formData);

      // Assert
      expect(dto.description).toBeUndefined();
      expect(dto.parentId).toBeUndefined();
    });
  });
});
