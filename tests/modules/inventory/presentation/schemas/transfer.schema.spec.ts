import { describe, it, expect } from "vitest";
import {
  transferLineSchema,
  createTransferSchema,
  toCreateTransferDto,
  type CreateTransferFormData,
} from "@/modules/inventory/presentation/schemas/transfer.schema";

describe("Transfer Schema", () => {
  describe("transferLineSchema", () => {
    it("Given: valid line data When: validating Then: should pass validation", () => {
      // Arrange
      const validLine = { productId: "prod-123", quantity: 10 };

      // Act
      const result = transferLineSchema.safeParse(validLine);

      // Assert
      expect(result.success).toBe(true);
    });

    it("Given: empty productId When: validating Then: should fail validation", () => {
      // Arrange
      const invalidLine = { productId: "", quantity: 10 };

      // Act
      const result = transferLineSchema.safeParse(invalidLine);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Please select a product");
      }
    });

    it("Given: zero quantity When: validating Then: should fail validation", () => {
      // Arrange
      const invalidLine = { productId: "prod-1", quantity: 0 };

      // Act
      const result = transferLineSchema.safeParse(invalidLine);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Quantity must be greater than 0",
        );
      }
    });

    it("Given: negative quantity When: validating Then: should fail validation", () => {
      // Arrange
      const invalidLine = { productId: "prod-1", quantity: -5 };

      // Act
      const result = transferLineSchema.safeParse(invalidLine);

      // Assert
      expect(result.success).toBe(false);
    });

    it("Given: fractional quantity When: validating Then: should fail validation", () => {
      // Arrange
      const invalidLine = { productId: "prod-1", quantity: 2.5 };

      // Act
      const result = transferLineSchema.safeParse(invalidLine);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Quantity must be a whole number",
        );
      }
    });
  });

  describe("createTransferSchema", () => {
    const validTransfer = {
      fromWarehouseId: "wh-origin",
      toWarehouseId: "wh-destination",
      lines: [{ productId: "prod-1", quantity: 5 }],
    };

    it("Given: valid transfer data When: validating Then: should pass validation", () => {
      // Act
      const result = createTransferSchema.safeParse(validTransfer);

      // Assert
      expect(result.success).toBe(true);
    });

    it("Given: valid transfer with optional note When: validating Then: should pass validation", () => {
      // Arrange
      const data = { ...validTransfer, note: "Urgent transfer" };

      // Act
      const result = createTransferSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });

    it("Given: empty fromWarehouseId When: validating Then: should fail validation", () => {
      // Arrange
      const invalidData = { ...validTransfer, fromWarehouseId: "" };

      // Act
      const result = createTransferSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });

    it("Given: empty toWarehouseId When: validating Then: should fail validation", () => {
      // Arrange
      const invalidData = { ...validTransfer, toWarehouseId: "" };

      // Act
      const result = createTransferSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });

    it("Given: same source and destination warehouse When: validating Then: should fail refinement", () => {
      // Arrange
      const invalidData = {
        fromWarehouseId: "wh-same",
        toWarehouseId: "wh-same",
        lines: [{ productId: "prod-1", quantity: 5 }],
      };

      // Act
      const result = createTransferSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const refinementIssue = result.error.issues.find(
          (i) => i.path.includes("toWarehouseId"),
        );
        expect(refinementIssue?.message).toBe(
          "Source and destination warehouses must be different",
        );
      }
    });

    it("Given: empty lines array When: validating Then: should fail validation", () => {
      // Arrange
      const invalidData = { ...validTransfer, lines: [] };

      // Act
      const result = createTransferSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });

    it("Given: note exceeding 500 characters When: validating Then: should fail validation", () => {
      // Arrange
      const invalidData = { ...validTransfer, note: "N".repeat(501) };

      // Act
      const result = createTransferSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe("toCreateTransferDto", () => {
    it("Given: form data with all fields When: converting to DTO Then: should map all fields correctly", () => {
      // Arrange
      const formData: CreateTransferFormData = {
        fromWarehouseId: "wh-origin",
        toWarehouseId: "wh-dest",
        lines: [
          { productId: "prod-1", quantity: 10 },
          { productId: "prod-2", quantity: 20 },
        ],
        note: "Transfer note",
      };

      // Act
      const dto = toCreateTransferDto(formData);

      // Assert
      expect(dto.fromWarehouseId).toBe("wh-origin");
      expect(dto.toWarehouseId).toBe("wh-dest");
      expect(dto.lines).toHaveLength(2);
      expect(dto.lines[0].productId).toBe("prod-1");
      expect(dto.lines[0].quantity).toBe(10);
      expect(dto.lines[1].productId).toBe("prod-2");
      expect(dto.lines[1].quantity).toBe(20);
      expect(dto.note).toBe("Transfer note");
    });

    it("Given: form data with empty note When: converting to DTO Then: note should be undefined", () => {
      // Arrange
      const formData: CreateTransferFormData = {
        fromWarehouseId: "wh-origin",
        toWarehouseId: "wh-dest",
        lines: [{ productId: "prod-1", quantity: 5 }],
        note: "",
      };

      // Act
      const dto = toCreateTransferDto(formData);

      // Assert
      expect(dto.note).toBeUndefined();
    });

    it("Given: form data without note When: converting to DTO Then: note should be undefined", () => {
      // Arrange
      const formData: CreateTransferFormData = {
        fromWarehouseId: "wh-origin",
        toWarehouseId: "wh-dest",
        lines: [{ productId: "prod-1", quantity: 5 }],
      };

      // Act
      const dto = toCreateTransferDto(formData);

      // Assert
      expect(dto.note).toBeUndefined();
    });
  });
});
