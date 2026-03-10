import { describe, it, expect } from "vitest";
import { SaleMapper } from "@/modules/sales/application/mappers/sale.mapper";

describe("SaleMapper", () => {
  const mockLine = {
    id: "line-1",
    productId: "p1",
    productName: "Widget",
    productSku: "WDG-001",
    productBarcode: "7501234567890",
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
      expect(result.productBarcode).toBe("7501234567890");
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

    it("Given a SaleResponseDto with non-string typeof fields as numbers, When toDomain is called, Then they default to null", () => {
      const dtoWeird = {
        ...mockDto,
        customerReference: 123,
        externalReference: false,
        note: null,
        movementId: 999,
        confirmedAt: 123,
        cancelledAt: false,
        pickedAt: null,
        shippedAt: undefined,
        completedAt: 0,
        returnedAt: [],
        contactId: undefined,
        contactName: undefined,
        warehouseName: undefined,
        createdByName: undefined,
        confirmedBy: undefined,
        confirmedByName: undefined,
        cancelledBy: undefined,
        cancelledByName: undefined,
        pickedBy: undefined,
        pickedByName: undefined,
        shippedBy: undefined,
        shippedByName: undefined,
        trackingNumber: undefined,
        shippingCarrier: undefined,
        shippingNotes: undefined,
        completedBy: undefined,
        completedByName: undefined,
        returnedBy: undefined,
        returnedByName: undefined,
        pickingEnabled: undefined,
      };

      const result = SaleMapper.toDomain(dtoWeird as any);

      expect(result.customerReference).toBeNull();
      expect(result.externalReference).toBeNull();
      expect(result.note).toBeNull();
      expect(result.movementId).toBeNull();
      expect(result.confirmedAt).toBeNull();
      expect(result.cancelledAt).toBeNull();
      expect(result.pickedAt).toBeNull();
      expect(result.shippedAt).toBeNull();
      expect(result.completedAt).toBeNull();
      expect(result.returnedAt).toBeNull();
      expect(result.contactId).toBeNull();
      expect(result.contactName).toBeNull();
      expect(result.warehouseName).toBe("");
      expect(result.pickingEnabled).toBe(false);
    });

    it("Given a SaleResponseDto with all date strings present, When toDomain is called, Then all dates are Date objects", () => {
      const dtoAllDates = {
        ...mockDto,
        cancelledAt: "2025-02-05T10:00:00.000Z",
        pickedAt: "2025-02-06T10:00:00.000Z",
        returnedAt: "2025-02-07T10:00:00.000Z",
      };

      const result = SaleMapper.toDomain(dtoAllDates as any);

      expect(result.cancelledAt).toBeInstanceOf(Date);
      expect(result.pickedAt).toBeInstanceOf(Date);
      expect(result.returnedAt).toBeInstanceOf(Date);
    });
  });

  describe("fromApiRaw - typeof branches", () => {
    it("Given a raw dto with non-string typeof fields, When fromApiRaw is called, Then they default to null", () => {
      const rawWeird = {
        ...mockRaw,
        customerReference: 123,
        externalReference: null,
        note: false,
        movementId: 0,
        confirmedAt: null,
        cancelledAt: undefined,
        pickedAt: 999,
        shippedAt: false,
        completedAt: null,
        returnedAt: undefined,
        contactId: undefined,
        contactName: undefined,
      };

      const result = SaleMapper.fromApiRaw(rawWeird as any);

      expect(result.customerReference).toBeNull();
      expect(result.externalReference).toBeNull();
      expect(result.note).toBeNull();
      expect(result.movementId).toBeNull();
      expect(result.confirmedAt).toBeNull();
      expect(result.cancelledAt).toBeNull();
      expect(result.pickedAt).toBeNull();
      expect(result.shippedAt).toBeNull();
      expect(result.completedAt).toBeNull();
      expect(result.returnedAt).toBeNull();
      expect(result.contactId).toBeNull();
      expect(result.contactName).toBeNull();
    });

    it("Given a raw dto with all optional string fields present, When fromApiRaw is called, Then they map correctly", () => {
      const rawFull = {
        ...mockRaw,
        warehouseName: "Main",
        contactId: "ct-1",
        contactName: "John Doe",
        customerReference: "CUS-REF",
        externalReference: "EXT-REF",
        note: "A note",
        lines: [mockLine],
        movementId: "mov-1",
        createdByName: "Creator",
        confirmedAt: "2025-02-02T10:00:00.000Z",
        confirmedBy: "user-2",
        confirmedByName: "Confirmer",
        cancelledAt: "2025-02-03T10:00:00.000Z",
        cancelledBy: "user-3",
        cancelledByName: "Canceller",
        pickedAt: "2025-02-04T10:00:00.000Z",
        pickedBy: "user-4",
        pickedByName: "Picker",
        shippedAt: "2025-02-05T10:00:00.000Z",
        shippedBy: "user-5",
        shippedByName: "Shipper",
        trackingNumber: "TRACK-123",
        shippingCarrier: "FedEx",
        shippingNotes: "Handle with care",
        completedAt: "2025-02-06T10:00:00.000Z",
        completedBy: "user-6",
        completedByName: "Completer",
        returnedAt: "2025-02-07T10:00:00.000Z",
        returnedBy: "user-7",
        returnedByName: "Returner",
        pickingEnabled: true,
      };

      const result = SaleMapper.fromApiRaw(rawFull as any);

      expect(result.contactId).toBe("ct-1");
      expect(result.contactName).toBe("John Doe");
      expect(result.customerReference).toBe("CUS-REF");
      expect(result.externalReference).toBe("EXT-REF");
      expect(result.note).toBe("A note");
      expect(result.movementId).toBe("mov-1");
      expect(result.cancelledAt).toBeInstanceOf(Date);
      expect(result.pickedAt).toBeInstanceOf(Date);
      expect(result.shippedAt).toBeInstanceOf(Date);
      expect(result.completedAt).toBeInstanceOf(Date);
      expect(result.returnedAt).toBeInstanceOf(Date);
      expect(result.trackingNumber).toBe("TRACK-123");
      expect(result.shippingCarrier).toBe("FedEx");
      expect(result.shippingNotes).toBe("Handle with care");
      expect(result.pickingEnabled).toBe(true);
    });
  });

  describe("lineToDomain - barcode branch", () => {
    it("Given a line with null productBarcode, When lineToDomain is called, Then barcode is null", () => {
      const lineNoBarcode = { ...mockLine, productBarcode: undefined };
      const result = SaleMapper.lineToDomain(lineNoBarcode as any);
      expect(result.productBarcode).toBeNull();
    });
  });
});
