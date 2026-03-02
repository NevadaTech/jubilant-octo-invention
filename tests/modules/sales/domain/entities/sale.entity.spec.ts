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
});
