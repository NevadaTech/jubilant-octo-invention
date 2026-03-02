import { describe, it, expect } from "vitest";
import { ReturnMapper } from "@/modules/returns/application/mappers/return.mapper";

describe("ReturnMapper", () => {
  const mockLine = {
    id: "rl-1",
    productId: "p1",
    productName: "Widget",
    productSku: "WDG-001",
    quantity: 3,
    originalSalePrice: 25.0,
    originalUnitCost: 10.0,
    currency: "USD",
    totalPrice: 75.0,
  };

  const mockRaw = {
    id: "ret-1",
    returnNumber: "RET-001",
    status: "DRAFT" as const,
    type: "RETURN_CUSTOMER" as const,
    warehouseId: "wh-1",
    totalAmount: 75,
    currency: "USD",
    createdBy: "user-1",
    createdAt: "2025-03-01T10:00:00.000Z",
  };

  const mockDto = {
    id: "ret-1",
    returnNumber: "RET-001",
    status: "DRAFT" as const,
    type: "RETURN_CUSTOMER" as const,
    reason: "Defective",
    warehouseId: "wh-1",
    warehouseName: "Main",
    saleId: "sale-1",
    saleNumber: "SALE-001",
    sourceMovementId: "mov-1",
    returnMovementId: null,
    note: "Test return",
    totalAmount: 75,
    currency: "USD",
    lines: [mockLine],
    createdBy: "user-1",
    createdAt: "2025-03-01T10:00:00.000Z",
    confirmedAt: null,
    cancelledAt: null,
  };

  describe("lineToDomain", () => {
    it("Given a full ReturnLineResponseDto, When lineToDomain is called, Then it maps all fields correctly", () => {
      // Arrange
      const lineDto = { ...mockLine };

      // Act
      const result = ReturnMapper.lineToDomain(lineDto as any);

      // Assert
      expect(result.id).toBe("rl-1");
      expect(result.productId).toBe("p1");
      expect(result.productName).toBe("Widget");
      expect(result.productSku).toBe("WDG-001");
      expect(result.quantity).toBe(3);
      expect(result.originalSalePrice).toBe(25.0);
      expect(result.originalUnitCost).toBe(10.0);
      expect(result.currency).toBe("USD");
      expect(result.totalPrice).toBe(75.0);
    });
  });

  describe("lineFromApiRaw", () => {
    it("Given a raw line with missing optional fields, When lineFromApiRaw is called, Then it defaults name/sku to empty string and prices to null", () => {
      // Arrange
      const rawLine = {
        id: "rl-2",
        productId: "p2",
        quantity: 1,
        currency: "USD",
        totalPrice: 30.0,
      };

      // Act
      const result = ReturnMapper.lineFromApiRaw(rawLine as any);

      // Assert
      expect(result.id).toBe("rl-2");
      expect(result.productId).toBe("p2");
      expect(result.productName).toBe("");
      expect(result.productSku).toBe("");
      expect(result.originalSalePrice).toBeNull();
      expect(result.originalUnitCost).toBeNull();
      expect(result.quantity).toBe(1);
      expect(result.currency).toBe("USD");
      expect(result.totalPrice).toBe(30.0);
    });
  });

  describe("fromApiRaw", () => {
    it("Given a minimal ReturnApiRawDto, When fromApiRaw is called, Then it maps with defaults for missing fields", () => {
      // Arrange
      const raw = { ...mockRaw };

      // Act
      const result = ReturnMapper.fromApiRaw(raw as any);

      // Assert
      expect(result.id).toBe("ret-1");
      expect(result.returnNumber).toBe("RET-001");
      expect(result.status).toBe("DRAFT");
      expect(result.type).toBe("RETURN_CUSTOMER");
      expect(result.warehouseId).toBe("wh-1");
      expect(result.totalAmount).toBe(75);
      expect(result.currency).toBe("USD");
      expect(result.createdBy).toBe("user-1");
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.lines).toEqual([]);
      expect(result.warehouseName).toBe("");
    });
  });

  describe("toDomain", () => {
    it("Given a full ReturnResponseDto, When toDomain is called, Then it maps all fields to domain entity", () => {
      // Arrange
      const dto = { ...mockDto };

      // Act
      const result = ReturnMapper.toDomain(dto as any);

      // Assert
      expect(result.id).toBe("ret-1");
      expect(result.returnNumber).toBe("RET-001");
      expect(result.status).toBe("DRAFT");
      expect(result.type).toBe("RETURN_CUSTOMER");
      expect(result.reason).toBe("Defective");
      expect(result.warehouseId).toBe("wh-1");
      expect(result.warehouseName).toBe("Main");
      expect(result.saleId).toBe("sale-1");
      expect(result.saleNumber).toBe("SALE-001");
      expect(result.sourceMovementId).toBe("mov-1");
      expect(result.returnMovementId).toBeNull();
      expect(result.note).toBe("Test return");
      expect(result.totalAmount).toBe(75);
      expect(result.currency).toBe("USD");
      expect(result.lines).toHaveLength(1);
      expect(result.createdBy).toBe("user-1");
      expect(result.confirmedAt).toBeNull();
      expect(result.cancelledAt).toBeNull();
    });

    it("Given a ReturnResponseDto with date strings, When toDomain is called, Then dates convert to Date objects", () => {
      // Arrange
      const dtoWithDates = {
        ...mockDto,
        confirmedAt: "2025-03-02T10:00:00.000Z",
        cancelledAt: "2025-03-03T10:00:00.000Z",
      };

      // Act
      const result = ReturnMapper.toDomain(dtoWithDates as any);

      // Assert
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.confirmedAt).toBeInstanceOf(Date);
      expect(result.cancelledAt).toBeInstanceOf(Date);
    });
  });
});
