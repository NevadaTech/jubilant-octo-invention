import { describe, it, expect } from "vitest";
import {
  createMovementSchema,
  toCreateMovementDto,
  type CreateMovementFormData,
} from "@/modules/inventory/presentation/schemas/movement.schema";

describe("Movement Schema", () => {
  describe("createMovementSchema", () => {
    it("Given: valid movement data When: validating Then: should pass validation", () => {
      // Arrange
      const validData = {
        productId: "123e4567-e89b-12d3-a456-426614174000",
        warehouseId: "456e7890-e89b-12d3-a456-426614174000",
        type: "IN" as const,
        quantity: 50,
        reason: "Stock replenishment",
      };

      // Act
      const result = createMovementSchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
    });

    it("Given: invalid productId When: validating Then: should fail validation", () => {
      // Arrange
      const invalidData = {
        productId: "not-a-uuid",
        warehouseId: "456e7890-e89b-12d3-a456-426614174000",
        type: "IN" as const,
        quantity: 50,
        reason: "Stock replenishment",
      };

      // Act
      const result = createMovementSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });

    it("Given: zero quantity When: validating Then: should fail validation", () => {
      // Arrange
      const invalidData = {
        productId: "123e4567-e89b-12d3-a456-426614174000",
        warehouseId: "456e7890-e89b-12d3-a456-426614174000",
        type: "IN" as const,
        quantity: 0,
        reason: "Stock replenishment",
      };

      // Act
      const result = createMovementSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });

    it("Given: negative quantity When: validating Then: should fail validation", () => {
      // Arrange
      const invalidData = {
        productId: "123e4567-e89b-12d3-a456-426614174000",
        warehouseId: "456e7890-e89b-12d3-a456-426614174000",
        type: "OUT" as const,
        quantity: -10,
        reason: "Damaged goods",
      };

      // Act
      const result = createMovementSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });

    it("Given: empty reason When: validating Then: should fail validation", () => {
      // Arrange
      const invalidData = {
        productId: "123e4567-e89b-12d3-a456-426614174000",
        warehouseId: "456e7890-e89b-12d3-a456-426614174000",
        type: "ADJUSTMENT" as const,
        quantity: 10,
        reason: "",
      };

      // Act
      const result = createMovementSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });

    it("Given: all movement types When: validating Then: should pass validation", () => {
      // Arrange
      const baseData = {
        productId: "123e4567-e89b-12d3-a456-426614174000",
        warehouseId: "456e7890-e89b-12d3-a456-426614174000",
        quantity: 10,
        reason: "Test reason",
      };

      // Act & Assert
      expect(
        createMovementSchema.safeParse({ ...baseData, type: "IN" }).success,
      ).toBe(true);
      expect(
        createMovementSchema.safeParse({ ...baseData, type: "OUT" }).success,
      ).toBe(true);
      expect(
        createMovementSchema.safeParse({ ...baseData, type: "ADJUSTMENT" })
          .success,
      ).toBe(true);
    });

    it("Given: optional reference When: validating Then: should pass validation", () => {
      // Arrange
      const validData = {
        productId: "123e4567-e89b-12d3-a456-426614174000",
        warehouseId: "456e7890-e89b-12d3-a456-426614174000",
        type: "IN" as const,
        quantity: 50,
        reason: "Stock replenishment",
        reference: "PO-2025-001",
      };

      // Act
      const result = createMovementSchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe("toCreateMovementDto", () => {
    it("Given: form data When: converting to DTO Then: should map all fields correctly", () => {
      // Arrange
      const formData: CreateMovementFormData = {
        productId: "123e4567-e89b-12d3-a456-426614174000",
        warehouseId: "456e7890-e89b-12d3-a456-426614174000",
        type: "IN",
        quantity: 50,
        reason: "Stock replenishment",
        reference: "PO-2025-001",
      };

      // Act
      const dto = toCreateMovementDto(formData);

      // Assert
      expect(dto.productId).toBe(formData.productId);
      expect(dto.warehouseId).toBe(formData.warehouseId);
      expect(dto.type).toBe(formData.type);
      expect(dto.quantity).toBe(formData.quantity);
      expect(dto.reason).toBe(formData.reason);
      expect(dto.reference).toBe(formData.reference);
    });

    it("Given: form data without reference When: converting to DTO Then: reference should be undefined", () => {
      // Arrange
      const formData: CreateMovementFormData = {
        productId: "123e4567-e89b-12d3-a456-426614174000",
        warehouseId: "456e7890-e89b-12d3-a456-426614174000",
        type: "OUT",
        quantity: 25,
        reason: "Customer order",
      };

      // Act
      const dto = toCreateMovementDto(formData);

      // Assert
      expect(dto.reference).toBeUndefined();
    });

    it("Given: form data with empty reference When: converting to DTO Then: reference should be undefined", () => {
      // Arrange
      const formData: CreateMovementFormData = {
        productId: "123e4567-e89b-12d3-a456-426614174000",
        warehouseId: "456e7890-e89b-12d3-a456-426614174000",
        type: "ADJUSTMENT",
        quantity: 5,
        reason: "Inventory count correction",
        reference: "",
      };

      // Act
      const dto = toCreateMovementDto(formData);

      // Assert
      expect(dto.reference).toBeUndefined();
    });
  });
});
