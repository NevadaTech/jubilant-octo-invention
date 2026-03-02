import { describe, it, expect } from "vitest";
import {
  createWarehouseSchema,
  updateWarehouseSchema,
  toCreateWarehouseDto,
  toUpdateWarehouseDto,
  type CreateWarehouseFormData,
  type UpdateWarehouseFormData,
} from "@/modules/inventory/presentation/schemas/warehouse.schema";

describe("Warehouse Schema", () => {
  describe("createWarehouseSchema", () => {
    it("Given: valid warehouse data When: validating Then: should pass validation", () => {
      // Arrange
      const validData = {
        code: "WH-MAIN-01",
        name: "Main Warehouse",
        address: "123 Industrial Ave",
      };

      // Act
      const result = createWarehouseSchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
    });

    it("Given: only required fields When: validating Then: should pass validation", () => {
      // Arrange
      const validData = { code: "WH01", name: "Warehouse One" };

      // Act
      const result = createWarehouseSchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
    });

    it("Given: empty code When: validating Then: should fail validation", () => {
      // Arrange
      const invalidData = { code: "", name: "Test Warehouse" };

      // Act
      const result = createWarehouseSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Code is required");
      }
    });

    it("Given: code with invalid characters When: validating Then: should fail validation", () => {
      // Arrange
      const invalidData = { code: "WH @#$!", name: "Test Warehouse" };

      // Act
      const result = createWarehouseSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Code can only contain letters, numbers, hyphens and underscores",
        );
      }
    });

    it("Given: code exceeding 20 characters When: validating Then: should fail validation", () => {
      // Arrange
      const invalidData = { code: "A".repeat(21), name: "Test Warehouse" };

      // Act
      const result = createWarehouseSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Code cannot exceed 20 characters",
        );
      }
    });

    it("Given: empty name When: validating Then: should fail validation", () => {
      // Arrange
      const invalidData = { code: "WH01", name: "" };

      // Act
      const result = createWarehouseSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Name is required");
      }
    });

    it("Given: name exceeding 100 characters When: validating Then: should fail validation", () => {
      // Arrange
      const invalidData = { code: "WH01", name: "W".repeat(101) };

      // Act
      const result = createWarehouseSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Name cannot exceed 100 characters",
        );
      }
    });

    it("Given: address exceeding 300 characters When: validating Then: should fail validation", () => {
      // Arrange
      const invalidData = {
        code: "WH01",
        name: "Valid Name",
        address: "A".repeat(301),
      };

      // Act
      const result = createWarehouseSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Address cannot exceed 300 characters",
        );
      }
    });

    it("Given: code with valid special characters (hyphens and underscores) When: validating Then: should pass validation", () => {
      // Arrange
      const validData = { code: "WH_Main-01", name: "Warehouse" };

      // Act
      const result = createWarehouseSchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe("updateWarehouseSchema", () => {
    it("Given: partial update with only name When: validating Then: should pass validation", () => {
      // Arrange
      const validData = { name: "Updated Warehouse Name" };

      // Act
      const result = updateWarehouseSchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
    });

    it("Given: isActive toggle When: validating Then: should pass validation", () => {
      // Arrange
      const validData = { isActive: false };

      // Act
      const result = updateWarehouseSchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
    });

    it("Given: empty object When: validating Then: should pass validation since all fields are optional", () => {
      // Act
      const result = updateWarehouseSchema.safeParse({});

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe("toCreateWarehouseDto", () => {
    it("Given: form data with all fields When: converting to DTO Then: should map all fields correctly", () => {
      // Arrange
      const formData: CreateWarehouseFormData = {
        code: "WH-01",
        name: "Main Warehouse",
        address: "123 Industrial Ave",
      };

      // Act
      const dto = toCreateWarehouseDto(formData);

      // Assert
      expect(dto.code).toBe("WH-01");
      expect(dto.name).toBe("Main Warehouse");
      expect(dto.address).toBe("123 Industrial Ave");
    });

    it("Given: form data with empty address When: converting to DTO Then: address should be undefined", () => {
      // Arrange
      const formData: CreateWarehouseFormData = {
        code: "WH-01",
        name: "Warehouse",
        address: "",
      };

      // Act
      const dto = toCreateWarehouseDto(formData);

      // Assert
      expect(dto.address).toBeUndefined();
    });
  });

  describe("toUpdateWarehouseDto", () => {
    it("Given: form data with all fields When: converting to DTO Then: should include all defined fields", () => {
      // Arrange
      const formData: UpdateWarehouseFormData = {
        code: "WH-02",
        name: "Updated Warehouse",
        address: "New Address",
        isActive: true,
      };

      // Act
      const dto = toUpdateWarehouseDto(formData);

      // Assert
      expect(dto.code).toBe("WH-02");
      expect(dto.name).toBe("Updated Warehouse");
      expect(dto.address).toBe("New Address");
      expect(dto.isActive).toBe(true);
    });

    it("Given: empty form data When: converting to DTO Then: should return empty object", () => {
      // Arrange
      const formData: UpdateWarehouseFormData = {};

      // Act
      const dto = toUpdateWarehouseDto(formData);

      // Assert
      expect(dto).toEqual({});
    });

    it("Given: form data with empty address When: converting to DTO Then: address should be undefined", () => {
      // Arrange
      const formData: UpdateWarehouseFormData = { address: "" };

      // Act
      const dto = toUpdateWarehouseDto(formData);

      // Assert
      expect(dto.address).toBeUndefined();
    });
  });
});
