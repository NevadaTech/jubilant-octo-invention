import { describe, it, expect } from "vitest";
import { SaleMapper } from "@/modules/sales/application/mappers/sale.mapper";

describe("SaleMapper", () => {
  const mockLine = {
    id: "line-1",
    productId: "p1",
    productName: "Widget",
    productSku: "WDG-001",
    quantity: 2,
    salePrice: 25.0,
    currency: "USD",
    totalPrice: 50.0,
  };

  const mockRaw = {
    id: "sale-1",
    saleNumber: "SALE-001",
    status: "DRAFT" as const,
    warehouseId: "wh-1",
    totalAmount: 50,
    currency: "USD",
    createdBy: "user-1",
    createdAt: "2025-02-01T10:00:00.000Z",
  };

  const mockDto = {
    id: "sale-1",
    saleNumber: "SALE-001",
    status: "DRAFT" as const,
    warehouseId: "wh-1",
    warehouseName: "Main",
    customerReference: "CUS-001",
    externalReference: "EXT-001",
    note: "Test sale",
    totalAmount: 50,
    currency: "USD",
    lines: [mockLine],
    movementId: "mov-1",
    createdBy: "user-1",
    createdByName: "John",
    createdAt: "2025-02-01T10:00:00.000Z",
    confirmedAt: null,
    confirmedBy: null,
    confirmedByName: null,
    cancelledAt: null,
    cancelledBy: null,
    cancelledByName: null,
    pickedAt: null,
    pickedBy: null,
    pickedByName: null,
    shippedAt: null,
    shippedBy: null,
    shippedByName: null,
    trackingNumber: null,
    shippingCarrier: null,
    shippingNotes: null,
    completedAt: null,
    completedBy: null,
    completedByName: null,
    returnedAt: null,
    returnedBy: null,
    returnedByName: null,
    pickingEnabled: true,
  };

  describe("lineToDomain", () => {
    it("Given a SaleLineResponseDto, When lineToDomain is called, Then it maps all fields correctly", () => {
      // Arrange
      const lineDto = { ...mockLine };

      // Act
      const result = SaleMapper.lineToDomain(lineDto as any);

      // Assert
      expect(result.id).toBe("line-1");
      expect(result.productId).toBe("p1");
      expect(result.productName).toBe("Widget");
      expect(result.productSku).toBe("WDG-001");
      expect(result.quantity).toBe(2);
      expect(result.salePrice).toBe(25.0);
      expect(result.currency).toBe("USD");
      expect(result.totalPrice).toBe(50.0);
    });
  });

  describe("fromApiRaw", () => {
    it("Given a minimal SaleApiRawDto with missing optional fields, When fromApiRaw is called, Then defaults are applied", () => {
      // Arrange
      const raw = { ...mockRaw };

      // Act
      const result = SaleMapper.fromApiRaw(raw as any);

      // Assert
      expect(result.id).toBe("sale-1");
      expect(result.saleNumber).toBe("SALE-001");
      expect(result.status).toBe("DRAFT");
      expect(result.warehouseId).toBe("wh-1");
      expect(result.totalAmount).toBe(50);
      expect(result.currency).toBe("USD");
      expect(result.lines).toEqual([]);
      expect(result.warehouseName).toBe("");
      expect(result.pickingEnabled).toBe(false);
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it("Given a full SaleApiRawDto with all fields, When fromApiRaw is called, Then all fields map correctly", () => {
      // Arrange
      const fullRaw = {
        ...mockRaw,
        warehouseName: "Main",
        customerReference: "CUS-001",
        externalReference: "EXT-001",
        note: "Test sale",
        lines: [mockLine],
        movementId: "mov-1",
        createdByName: "John",
        confirmedAt: "2025-02-02T10:00:00.000Z",
        confirmedBy: "user-2",
        confirmedByName: "Jane",
        pickingEnabled: true,
      };

      // Act
      const result = SaleMapper.fromApiRaw(fullRaw as any);

      // Assert
      expect(result.warehouseName).toBe("Main");
      expect(result.customerReference).toBe("CUS-001");
      expect(result.note).toBe("Test sale");
      expect(result.lines).toHaveLength(1);
      expect(result.pickingEnabled).toBe(true);
      expect(result.confirmedAt).toBeInstanceOf(Date);
      expect(result.confirmedByName).toBe("Jane");
    });
  });

  describe("toDomain", () => {
    it("Given a full SaleResponseDto, When toDomain is called, Then it maps all fields to domain entity", () => {
      // Arrange
      const dto = { ...mockDto };

      // Act
      const result = SaleMapper.toDomain(dto as any);

      // Assert
      expect(result.id).toBe("sale-1");
      expect(result.saleNumber).toBe("SALE-001");
      expect(result.status).toBe("DRAFT");
      expect(result.warehouseId).toBe("wh-1");
      expect(result.warehouseName).toBe("Main");
      expect(result.customerReference).toBe("CUS-001");
      expect(result.externalReference).toBe("EXT-001");
      expect(result.note).toBe("Test sale");
      expect(result.totalAmount).toBe(50);
      expect(result.currency).toBe("USD");
      expect(result.lines).toHaveLength(1);
      expect(result.movementId).toBe("mov-1");
      expect(result.createdBy).toBe("user-1");
      expect(result.createdByName).toBe("John");
      expect(result.pickingEnabled).toBe(true);
    });

    it("Given a SaleResponseDto with date strings, When toDomain is called, Then dates are converted to Date objects", () => {
      // Arrange
      const dtoWithDates = {
        ...mockDto,
        confirmedAt: "2025-02-02T10:00:00.000Z",
        shippedAt: "2025-02-03T10:00:00.000Z",
        completedAt: "2025-02-04T10:00:00.000Z",
      };

      // Act
      const result = SaleMapper.toDomain(dtoWithDates as any);

      // Assert
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.confirmedAt).toBeInstanceOf(Date);
      expect(result.shippedAt).toBeInstanceOf(Date);
      expect(result.completedAt).toBeInstanceOf(Date);
    });

    it("Given a SaleResponseDto with missing lines, When toDomain is called, Then lines default to empty array", () => {
      // Arrange
      const dtoNoLines = { ...mockDto, lines: undefined };

      // Act
      const result = SaleMapper.toDomain(dtoNoLines as any);

      // Assert
      expect(result.lines).toEqual([]);
    });
  });
});
