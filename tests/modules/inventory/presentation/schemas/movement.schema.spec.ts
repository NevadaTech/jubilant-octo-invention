import { describe, it, expect } from "vitest";
import {
  createMovementSchema,
  toCreateMovementDto,
  type CreateMovementFormData,
} from "@/modules/inventory/presentation/schemas/movement.schema";

describe("Movement Schema", () => {
  describe("createMovementSchema", () => {
    it("Given: valid movement data with lines When: validating Then: should pass validation", () => {
      // Arrange
      const validData = {
        warehouseId: "456e7890-e89b-12d3-a456-426614174000",
        type: "IN" as const,
        reason: "Stock replenishment",
        lines: [
          { productId: "123e4567-e89b-12d3-a456-426614174000", quantity: 50 },
        ],
      };

      // Act
      const result = createMovementSchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
    });

    it("Given: empty warehouseId When: validating Then: should fail validation", () => {
      // Arrange
      const invalidData = {
        warehouseId: "",
        type: "IN" as const,
        lines: [{ productId: "123", quantity: 10 }],
      };

      // Act
      const result = createMovementSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });

    it("Given: empty lines array When: validating Then: should fail validation", () => {
      // Arrange
      const invalidData = {
        warehouseId: "wh-1",
        type: "IN" as const,
        lines: [],
      };

      // Act
      const result = createMovementSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });

    it("Given: line with zero quantity When: validating Then: should fail validation", () => {
      // Arrange
      const invalidData = {
        warehouseId: "wh-1",
        type: "OUT" as const,
        lines: [{ productId: "prod-1", quantity: 0 }],
      };

      // Act
      const result = createMovementSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });

    it("Given: line with negative quantity When: validating Then: should fail validation", () => {
      // Arrange
      const invalidData = {
        warehouseId: "wh-1",
        type: "OUT" as const,
        lines: [{ productId: "prod-1", quantity: -10 }],
      };

      // Act
      const result = createMovementSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });

    it("Given: all manual movement types When: validating Then: should pass validation", () => {
      // Arrange
      const baseLine = [{ productId: "prod-1", quantity: 10 }];
      const baseData = { warehouseId: "wh-1", lines: baseLine };

      // Act & Assert
      expect(
        createMovementSchema.safeParse({ ...baseData, type: "IN" }).success,
      ).toBe(true);
      expect(
        createMovementSchema.safeParse({ ...baseData, type: "OUT" }).success,
      ).toBe(true);
      expect(
        createMovementSchema.safeParse({ ...baseData, type: "ADJUST_IN" })
          .success,
      ).toBe(true);
      expect(
        createMovementSchema.safeParse({ ...baseData, type: "ADJUST_OUT" })
          .success,
      ).toBe(true);
    });

    it("Given: optional reference and note When: validating Then: should pass validation", () => {
      // Arrange
      const validData = {
        warehouseId: "wh-1",
        type: "IN" as const,
        reference: "PO-2025-001",
        reason: "Stock replenishment",
        note: "Test note",
        lines: [{ productId: "prod-1", quantity: 50 }],
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
        warehouseId: "wh-1",
        type: "IN",
        reference: "PO-2025-001",
        reason: "Stock replenishment",
        note: "Test note",
        lines: [{ productId: "prod-1", quantity: 50, unitCost: 10.5 }],
      };

      // Act
      const dto = toCreateMovementDto(formData);

      // Assert
      expect(dto.warehouseId).toBe(formData.warehouseId);
      expect(dto.type).toBe(formData.type);
      expect(dto.reference).toBe(formData.reference);
      expect(dto.reason).toBe(formData.reason);
      expect(dto.note).toBe(formData.note);
      expect(dto.lines).toHaveLength(1);
      expect(dto.lines[0].productId).toBe("prod-1");
      expect(dto.lines[0].quantity).toBe(50);
      expect(dto.lines[0].unitCost).toBe(10.5);
    });

    it("Given: form data with empty optional fields When: converting to DTO Then: should set them as undefined", () => {
      // Arrange
      const formData: CreateMovementFormData = {
        warehouseId: "wh-1",
        type: "OUT",
        reference: "",
        reason: "",
        note: "",
        lines: [{ productId: "prod-1", quantity: 25 }],
      };

      // Act
      const dto = toCreateMovementDto(formData);

      // Assert
      expect(dto.reference).toBeUndefined();
      expect(dto.reason).toBeUndefined();
      expect(dto.note).toBeUndefined();
    });
  });
});
