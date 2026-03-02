import { describe, it, expect } from "vitest";
import {
  createReturnSchema,
  toCreateReturnDto,
} from "@/modules/returns/presentation/schemas/return.schema";

describe("createReturnSchema", () => {
  const validLine = {
    productId: "prod-1",
    quantity: 2,
    maxQuantity: 5,
    originalSalePrice: 10.0,
    originalUnitCost: 5.0,
    currency: "USD",
  };

  const validCustomerReturn = {
    type: "RETURN_CUSTOMER" as const,
    warehouseId: "wh-1",
    saleId: "sale-1",
    sourceMovementId: "",
    reason: "Defective item",
    note: "",
    lines: [validLine],
  };

  const validSupplierReturn = {
    type: "RETURN_SUPPLIER" as const,
    warehouseId: "wh-1",
    sourceMovementId: "mov-1",
    saleId: "",
    reason: "Wrong shipment",
    note: "Returning to supplier",
    lines: [validLine],
  };

  describe("Given valid RETURN_CUSTOMER data with saleId", () => {
    it("When parsed, Then it should pass validation", () => {
      // Arrange
      const data = { ...validCustomerReturn };

      // Act
      const result = createReturnSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe("Given valid RETURN_SUPPLIER data without saleId", () => {
    it("When parsed, Then it should pass validation", () => {
      // Arrange
      const data = { ...validSupplierReturn };

      // Act
      const result = createReturnSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe("Given RETURN_CUSTOMER without saleId", () => {
    it("When parsed, Then it should fail validation due to refinement", () => {
      // Arrange
      const data = {
        ...validCustomerReturn,
        saleId: "",
      };

      // Act
      const result = createReturnSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe("Given empty lines array", () => {
    it("When parsed, Then it should fail validation", () => {
      // Arrange
      const data = {
        ...validCustomerReturn,
        lines: [],
      };

      // Act
      const result = createReturnSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe("Given a line where quantity exceeds maxQuantity", () => {
    it("When parsed, Then it should fail validation due to refinement", () => {
      // Arrange
      const data = {
        ...validCustomerReturn,
        lines: [
          {
            ...validLine,
            quantity: 10,
            maxQuantity: 5,
          },
        ],
      };

      // Act
      const result = createReturnSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
    });
  });
});

describe("toCreateReturnDto", () => {
  describe("Given valid form data", () => {
    it("When mapped, Then it should produce the correct DTO", () => {
      // Arrange
      const formData = {
        type: "RETURN_CUSTOMER" as const,
        warehouseId: "wh-1",
        saleId: "sale-1",
        sourceMovementId: "mov-1",
        reason: "Defective",
        note: "Please process",
        lines: [
          {
            productId: "prod-1",
            quantity: 3,
            maxQuantity: 10,
            originalSalePrice: 25.0,
            originalUnitCost: 12.0,
            currency: "USD",
          },
        ],
      };

      // Act
      const dto = toCreateReturnDto(formData);

      // Assert
      expect(dto.type).toBe("RETURN_CUSTOMER");
      expect(dto.warehouseId).toBe("wh-1");
      expect(dto.saleId).toBe("sale-1");
      expect(dto.sourceMovementId).toBe("mov-1");
      expect(dto.reason).toBe("Defective");
      expect(dto.note).toBe("Please process");
      expect(dto.lines).toHaveLength(1);
      expect(dto.lines[0].productId).toBe("prod-1");
      expect(dto.lines[0].quantity).toBe(3);
    });
  });

  describe("Given form data with empty optional strings", () => {
    it("When mapped, Then empty strings should become undefined", () => {
      // Arrange
      const formData = {
        type: "RETURN_SUPPLIER" as const,
        warehouseId: "wh-1",
        saleId: "",
        sourceMovementId: "",
        reason: "",
        note: "",
        lines: [
          {
            productId: "prod-1",
            quantity: 1,
            maxQuantity: 5,
            originalSalePrice: 10.0,
            originalUnitCost: 5.0,
            currency: "USD",
          },
        ],
      };

      // Act
      const dto = toCreateReturnDto(formData);

      // Assert
      expect(dto.saleId).toBeUndefined();
      expect(dto.sourceMovementId).toBeUndefined();
      expect(dto.reason).toBeUndefined();
      expect(dto.note).toBeUndefined();
    });
  });

  describe("Given form data with lines containing maxQuantity", () => {
    it("When mapped, Then maxQuantity should not appear in the DTO lines", () => {
      // Arrange
      const formData = {
        type: "RETURN_CUSTOMER" as const,
        warehouseId: "wh-1",
        saleId: "sale-1",
        sourceMovementId: "",
        reason: "",
        note: "",
        lines: [
          {
            productId: "prod-1",
            quantity: 2,
            maxQuantity: 10,
            originalSalePrice: 20.0,
            originalUnitCost: 8.0,
            currency: "USD",
          },
        ],
      };

      // Act
      const dto = toCreateReturnDto(formData);

      // Assert
      expect(dto.lines[0]).not.toHaveProperty("maxQuantity");
    });
  });
});
