import { describe, it, expect } from "vitest";
import { Sale, SaleLine } from "@/modules/sales/domain/entities/sale.entity";

describe("SaleLine", () => {
  it("Given: valid sale line props When: creating a SaleLine Then: returns instance with correct values", () => {
    // Arrange
    const props = {
      id: "sl-1",
      productId: "prod-1",
      productName: "Widget A",
      productSku: "WDG-001",
      quantity: 3,
      salePrice: 29.99,
      currency: "USD",
      totalPrice: 89.97,
    };

    // Act
    const line = SaleLine.create(props);

    // Assert
    expect(line.id).toBe("sl-1");
    expect(line.productId).toBe("prod-1");
    expect(line.productName).toBe("Widget A");
    expect(line.productSku).toBe("WDG-001");
    expect(line.quantity).toBe(3);
    expect(line.salePrice).toBe(29.99);
    expect(line.currency).toBe("USD");
    expect(line.totalPrice).toBe(89.97);
  });
});

describe("Sale", () => {
  const makeLine = (
    overrides: Partial<{ id: string; quantity: number }> = {},
  ) =>
    SaleLine.create({
      id: overrides.id ?? "sl-1",
      productId: "prod-1",
      productName: "Widget A",
      productSku: "WDG-001",
      productBarcode: null,
      quantity: overrides.quantity ?? 2,
      salePrice: 49.99,
      currency: "USD",
      totalPrice: (overrides.quantity ?? 2) * 49.99,
    });

  const makeSale = (
    overrides: Partial<{
      status: string;
      lines: ReturnType<typeof makeLine>[];
      pickingEnabled: boolean;
    }> = {},
  ) => {
    const lines = overrides.lines ?? [makeLine()];
    return Sale.create({
      id: "sale-1",
      saleNumber: "S-2026-001",
      status: (overrides.status as any) ?? "DRAFT",
      warehouseId: "wh-1",
      warehouseName: "Main Warehouse",
      contactId: null,
      contactName: null,
      customerReference: null,
      externalReference: null,
      note: null,
      totalAmount: 99.98,
      currency: "USD",
      lines,
      movementId: null,
      createdBy: "user-1",
      createdByName: null,
      createdAt: new Date("2026-02-10T00:00:00Z"),
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
      pickingEnabled: overrides.pickingEnabled ?? true,
    });
  };

  it("Given: valid sale props When: creating a Sale Then: returns instance with correct values", () => {
    // Arrange & Act
    const sale = makeSale();

    // Assert
    expect(sale.id).toBe("sale-1");
    expect(sale.saleNumber).toBe("S-2026-001");
    expect(sale.status).toBe("DRAFT");
    expect(sale.warehouseId).toBe("wh-1");
    expect(sale.warehouseName).toBe("Main Warehouse");
    expect(sale.totalAmount).toBe(99.98);
    expect(sale.currency).toBe("USD");
    expect(sale.createdBy).toBe("user-1");
    expect(sale.createdAt).toEqual(new Date("2026-02-10T00:00:00Z"));
  });

  it("Given: sale with multiple lines When: accessing totalItems and totalQuantity Then: returns correct counts", () => {
    // Arrange
    const lines = [
      makeLine({ id: "sl-1", quantity: 3 }),
      makeLine({ id: "sl-2", quantity: 7 }),
      makeLine({ id: "sl-3", quantity: 1 }),
    ];

    // Act
    const sale = makeSale({ lines });

    // Assert
    expect(sale.totalItems).toBe(3);
    expect(sale.totalQuantity).toBe(11);
  });

  it("Given: sale with status DRAFT When: checking isDraft Then: returns true", () => {
    // Arrange & Act
    const sale = makeSale({ status: "DRAFT" });

    // Assert
    expect(sale.isDraft).toBe(true);
    expect(sale.isConfirmed).toBe(false);
    expect(sale.isPicking).toBe(false);
    expect(sale.isShipped).toBe(false);
    expect(sale.isCompleted).toBe(false);
    expect(sale.isCancelled).toBe(false);
    expect(sale.isReturned).toBe(false);
  });

  it("Given: sale with status CONFIRMED When: checking isConfirmed Then: returns true", () => {
    // Arrange & Act
    const sale = makeSale({ status: "CONFIRMED" });

    // Assert
    expect(sale.isConfirmed).toBe(true);
    expect(sale.isDraft).toBe(false);
  });

  it("Given: sale with status PICKING When: checking isPicking Then: returns true", () => {
    // Arrange & Act
    const sale = makeSale({ status: "PICKING" });

    // Assert
    expect(sale.isPicking).toBe(true);
  });

  it("Given: sale with status SHIPPED When: checking isShipped Then: returns true", () => {
    // Arrange & Act
    const sale = makeSale({ status: "SHIPPED" });

    // Assert
    expect(sale.isShipped).toBe(true);
  });

  it("Given: sale with status COMPLETED When: checking isCompleted Then: returns true", () => {
    // Arrange & Act
    const sale = makeSale({ status: "COMPLETED" });

    // Assert
    expect(sale.isCompleted).toBe(true);
  });

  it("Given: sale with status CANCELLED When: checking isCancelled Then: returns true", () => {
    // Arrange & Act
    const sale = makeSale({ status: "CANCELLED" });

    // Assert
    expect(sale.isCancelled).toBe(true);
  });

  it("Given: sale with status RETURNED When: checking isReturned Then: returns true", () => {
    // Arrange & Act
    const sale = makeSale({ status: "RETURNED" });

    // Assert
    expect(sale.isReturned).toBe(true);
  });

  it("Given: DRAFT sale with lines When: checking canConfirm Then: returns true", () => {
    // Arrange & Act
    const sale = makeSale({ status: "DRAFT", lines: [makeLine()] });

    // Assert
    expect(sale.canConfirm).toBe(true);
  });

  it("Given: DRAFT sale without lines When: checking canConfirm Then: returns false", () => {
    // Arrange & Act
    const sale = makeSale({ status: "DRAFT", lines: [] });

    // Assert
    expect(sale.canConfirm).toBe(false);
  });

  it("Given: CONFIRMED sale with pickingEnabled When: checking canStartPicking Then: returns true", () => {
    // Arrange & Act
    const sale = makeSale({ status: "CONFIRMED", pickingEnabled: true });

    // Assert
    expect(sale.canStartPicking).toBe(true);
  });

  it("Given: CONFIRMED sale without pickingEnabled When: checking canStartPicking Then: returns false", () => {
    // Arrange & Act
    const sale = makeSale({ status: "CONFIRMED", pickingEnabled: false });

    // Assert
    expect(sale.canStartPicking).toBe(false);
  });

  it("Given: PICKING sale with pickingEnabled When: checking canShip Then: returns true", () => {
    // Arrange & Act
    const sale = makeSale({ status: "PICKING", pickingEnabled: true });

    // Assert
    expect(sale.canShip).toBe(true);
  });

  it("Given: SHIPPED sale with pickingEnabled When: checking canComplete Then: returns true", () => {
    // Arrange & Act
    const sale = makeSale({ status: "SHIPPED", pickingEnabled: true });

    // Assert
    expect(sale.canComplete).toBe(true);
  });

  it("Given: DRAFT sale When: checking canCancel Then: returns true", () => {
    // Arrange & Act
    const sale = makeSale({ status: "DRAFT" });

    // Assert
    expect(sale.canCancel).toBe(true);
  });

  it("Given: CONFIRMED sale When: checking canCancel Then: returns true", () => {
    // Arrange & Act
    const sale = makeSale({ status: "CONFIRMED" });

    // Assert
    expect(sale.canCancel).toBe(true);
  });

  it("Given: DRAFT sale When: checking canEdit Then: returns true", () => {
    // Arrange & Act
    const sale = makeSale({ status: "DRAFT" });

    // Assert
    expect(sale.canEdit).toBe(true);
  });

  it("Given: CONFIRMED sale When: checking canEdit Then: returns false", () => {
    // Arrange & Act
    const sale = makeSale({ status: "CONFIRMED" });

    // Assert
    expect(sale.canEdit).toBe(false);
  });

  it("Given: DRAFT sale When: checking canAddLines Then: returns true", () => {
    // Arrange & Act
    const sale = makeSale({ status: "DRAFT" });

    // Assert
    expect(sale.canAddLines).toBe(true);
  });

  it("Given: CONFIRMED sale When: checking canAddLines Then: returns false", () => {
    // Arrange & Act
    const sale = makeSale({ status: "CONFIRMED" });

    // Assert
    expect(sale.canAddLines).toBe(false);
  });

  it("Given: CONFIRMED sale When: checking canSwapLine Then: returns true", () => {
    const sale = makeSale({ status: "CONFIRMED" });
    expect(sale.canSwapLine).toBe(true);
  });

  it("Given: PICKING sale When: checking canSwapLine Then: returns true", () => {
    const sale = makeSale({ status: "PICKING" });
    expect(sale.canSwapLine).toBe(true);
  });

  it("Given: DRAFT sale When: checking canSwapLine Then: returns false", () => {
    const sale = makeSale({ status: "DRAFT" });
    expect(sale.canSwapLine).toBe(false);
  });

  it("Given: sale with all optional fields populated When: accessing getters Then: returns correct values", () => {
    const sale = Sale.create({
      id: "sale-2",
      saleNumber: "S-2026-002",
      status: "COMPLETED",
      warehouseId: "wh-1",
      warehouseName: "Main Warehouse",
      contactId: "contact-1",
      contactName: "John Doe",
      customerReference: "CUS-REF-001",
      externalReference: "EXT-REF-001",
      note: "Urgent order",
      totalAmount: 200,
      currency: "USD",
      lines: [makeLine()],
      movementId: "mov-1",
      createdBy: "user-1",
      createdByName: "Admin User",
      createdAt: new Date("2026-02-10T00:00:00Z"),
      confirmedAt: new Date("2026-02-11T00:00:00Z"),
      confirmedBy: "user-2",
      confirmedByName: "Confirmer User",
      cancelledAt: new Date("2026-02-12T00:00:00Z"),
      cancelledBy: "user-3",
      cancelledByName: "Canceller User",
      pickedAt: new Date("2026-02-13T00:00:00Z"),
      pickedBy: "user-4",
      pickedByName: "Picker User",
      shippedAt: new Date("2026-02-14T00:00:00Z"),
      shippedBy: "user-5",
      shippedByName: "Shipper User",
      trackingNumber: "TRACK-123",
      shippingCarrier: "FedEx",
      shippingNotes: "Handle with care",
      completedAt: new Date("2026-02-15T00:00:00Z"),
      completedBy: "user-6",
      completedByName: "Completer User",
      returnedAt: new Date("2026-02-16T00:00:00Z"),
      returnedBy: "user-7",
      returnedByName: "Returner User",
      pickingEnabled: true,
    });

    expect(sale.contactId).toBe("contact-1");
    expect(sale.contactName).toBe("John Doe");
    expect(sale.customerReference).toBe("CUS-REF-001");
    expect(sale.externalReference).toBe("EXT-REF-001");
    expect(sale.note).toBe("Urgent order");
    expect(sale.movementId).toBe("mov-1");
    expect(sale.createdByName).toBe("Admin User");
    expect(sale.confirmedAt).toEqual(new Date("2026-02-11T00:00:00Z"));
    expect(sale.confirmedBy).toBe("user-2");
    expect(sale.confirmedByName).toBe("Confirmer User");
    expect(sale.cancelledAt).toEqual(new Date("2026-02-12T00:00:00Z"));
    expect(sale.cancelledBy).toBe("user-3");
    expect(sale.cancelledByName).toBe("Canceller User");
    expect(sale.pickedAt).toEqual(new Date("2026-02-13T00:00:00Z"));
    expect(sale.pickedBy).toBe("user-4");
    expect(sale.pickedByName).toBe("Picker User");
    expect(sale.shippedAt).toEqual(new Date("2026-02-14T00:00:00Z"));
    expect(sale.shippedBy).toBe("user-5");
    expect(sale.shippedByName).toBe("Shipper User");
    expect(sale.trackingNumber).toBe("TRACK-123");
    expect(sale.shippingCarrier).toBe("FedEx");
    expect(sale.shippingNotes).toBe("Handle with care");
    expect(sale.completedAt).toEqual(new Date("2026-02-15T00:00:00Z"));
    expect(sale.completedBy).toBe("user-6");
    expect(sale.completedByName).toBe("Completer User");
    expect(sale.returnedAt).toEqual(new Date("2026-02-16T00:00:00Z"));
    expect(sale.returnedBy).toBe("user-7");
    expect(sale.returnedByName).toBe("Returner User");
    expect(sale.pickingEnabled).toBe(true);
  });

  it("Given: SaleLine with productBarcode When: accessing productBarcode Then: returns barcode value", () => {
    const line = SaleLine.create({
      id: "sl-1",
      productId: "prod-1",
      productName: "Widget A",
      productSku: "WDG-001",
      productBarcode: "7891234567890",
      quantity: 2,
      salePrice: 29.99,
      currency: "USD",
      totalPrice: 59.98,
    });

    expect(line.productBarcode).toBe("7891234567890");
  });

  it("Given: SaleLine with null productBarcode When: accessing productBarcode Then: returns null", () => {
    const line = SaleLine.create({
      id: "sl-1",
      productId: "prod-1",
      productName: "Widget A",
      productSku: "WDG-001",
      productBarcode: null,
      quantity: 2,
      salePrice: 29.99,
      currency: "USD",
      totalPrice: 59.98,
    });

    expect(line.productBarcode).toBeNull();
  });

  it("Given: CONFIRMED sale without pickingEnabled When: checking canShip Then: returns false", () => {
    const sale = makeSale({ status: "CONFIRMED", pickingEnabled: false });
    expect(sale.canShip).toBe(false);
  });

  it("Given: SHIPPED sale without pickingEnabled When: checking canComplete Then: returns false", () => {
    const sale = makeSale({ status: "SHIPPED", pickingEnabled: false });
    expect(sale.canComplete).toBe(false);
  });

  it("Given: COMPLETED sale When: checking canCancel Then: returns false", () => {
    const sale = makeSale({ status: "COMPLETED" });
    expect(sale.canCancel).toBe(false);
  });
});
