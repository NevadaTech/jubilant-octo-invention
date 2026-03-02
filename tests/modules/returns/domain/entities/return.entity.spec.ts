import { describe, it, expect } from "vitest";
import {
  Return,
  ReturnLine,
} from "@/modules/returns/domain/entities/return.entity";

describe("ReturnLine", () => {
  it("Given: valid return line props When: creating a ReturnLine Then: returns instance with correct values", () => {
    // Arrange
    const props = {
      id: "rl-1",
      productId: "prod-1",
      productName: "Widget A",
      productSku: "WDG-001",
      quantity: 2,
      originalSalePrice: null,
      originalUnitCost: null,
      currency: "USD",
      totalPrice: 59.98,
    };

    // Act
    const line = ReturnLine.create(props);

    // Assert
    expect(line.id).toBe("rl-1");
    expect(line.productId).toBe("prod-1");
    expect(line.productName).toBe("Widget A");
    expect(line.productSku).toBe("WDG-001");
    expect(line.quantity).toBe(2);
    expect(line.originalSalePrice).toBeNull();
    expect(line.originalUnitCost).toBeNull();
    expect(line.currency).toBe("USD");
    expect(line.totalPrice).toBe(59.98);
  });
});

describe("Return", () => {
  const makeLine = (overrides: Partial<{ id: string; quantity: number }> = {}) =>
    ReturnLine.create({
      id: overrides.id ?? "rl-1",
      productId: "prod-1",
      productName: "Widget A",
      productSku: "WDG-001",
      quantity: overrides.quantity ?? 2,
      originalSalePrice: null,
      originalUnitCost: null,
      currency: "USD",
      totalPrice: (overrides.quantity ?? 2) * 29.99,
    });

  const makeReturn = (
    overrides: Partial<{
      status: string;
      type: string;
      lines: ReturnType<typeof makeLine>[];
    }> = {}
  ) => {
    const lines = overrides.lines ?? [makeLine()];
    return Return.create({
      id: "ret-1",
      returnNumber: "R-2026-001",
      status: (overrides.status as any) ?? "DRAFT",
      type: (overrides.type as any) ?? "RETURN_CUSTOMER",
      reason: null,
      warehouseId: "wh-1",
      warehouseName: "Main Warehouse",
      saleId: null,
      saleNumber: null,
      sourceMovementId: null,
      returnMovementId: null,
      note: null,
      totalAmount: 59.98,
      currency: "USD",
      lines,
      createdBy: "user-1",
      createdAt: new Date("2026-02-15T00:00:00Z"),
      confirmedAt: null,
      cancelledAt: null,
    });
  };

  it("Given: valid return props When: creating a Return Then: returns instance with correct values", () => {
    // Arrange & Act
    const ret = makeReturn();

    // Assert
    expect(ret.id).toBe("ret-1");
    expect(ret.returnNumber).toBe("R-2026-001");
    expect(ret.status).toBe("DRAFT");
    expect(ret.type).toBe("RETURN_CUSTOMER");
    expect(ret.warehouseId).toBe("wh-1");
    expect(ret.warehouseName).toBe("Main Warehouse");
    expect(ret.totalAmount).toBe(59.98);
    expect(ret.currency).toBe("USD");
    expect(ret.createdBy).toBe("user-1");
    expect(ret.createdAt).toEqual(new Date("2026-02-15T00:00:00Z"));
  });

  it("Given: return with type RETURN_CUSTOMER When: checking isCustomerReturn Then: returns true", () => {
    // Arrange & Act
    const ret = makeReturn({ type: "RETURN_CUSTOMER" });

    // Assert
    expect(ret.isCustomerReturn).toBe(true);
    expect(ret.isSupplierReturn).toBe(false);
  });

  it("Given: return with type RETURN_SUPPLIER When: checking isSupplierReturn Then: returns true", () => {
    // Arrange & Act
    const ret = makeReturn({ type: "RETURN_SUPPLIER" });

    // Assert
    expect(ret.isSupplierReturn).toBe(true);
    expect(ret.isCustomerReturn).toBe(false);
  });

  it("Given: return with status DRAFT When: checking isDraft Then: returns true", () => {
    // Arrange & Act
    const ret = makeReturn({ status: "DRAFT" });

    // Assert
    expect(ret.isDraft).toBe(true);
    expect(ret.isConfirmed).toBe(false);
    expect(ret.isCancelled).toBe(false);
  });

  it("Given: return with status CONFIRMED When: checking isConfirmed Then: returns true", () => {
    // Arrange & Act
    const ret = makeReturn({ status: "CONFIRMED" });

    // Assert
    expect(ret.isConfirmed).toBe(true);
    expect(ret.isDraft).toBe(false);
  });

  it("Given: return with status CANCELLED When: checking isCancelled Then: returns true", () => {
    // Arrange & Act
    const ret = makeReturn({ status: "CANCELLED" });

    // Assert
    expect(ret.isCancelled).toBe(true);
  });

  it("Given: DRAFT return with lines When: checking canConfirm Then: returns true", () => {
    // Arrange & Act
    const ret = makeReturn({ status: "DRAFT", lines: [makeLine()] });

    // Assert
    expect(ret.canConfirm).toBe(true);
  });

  it("Given: DRAFT return without lines When: checking canConfirm Then: returns false", () => {
    // Arrange & Act
    const ret = makeReturn({ status: "DRAFT", lines: [] });

    // Assert
    expect(ret.canConfirm).toBe(false);
  });

  it("Given: CONFIRMED return When: checking canConfirm Then: returns false", () => {
    // Arrange & Act
    const ret = makeReturn({ status: "CONFIRMED" });

    // Assert
    expect(ret.canConfirm).toBe(false);
  });

  it("Given: DRAFT return When: checking canCancel Then: returns true", () => {
    // Arrange & Act
    const ret = makeReturn({ status: "DRAFT" });

    // Assert
    expect(ret.canCancel).toBe(true);
  });

  it("Given: DRAFT return When: checking canEdit Then: returns true", () => {
    // Arrange & Act
    const ret = makeReturn({ status: "DRAFT" });

    // Assert
    expect(ret.canEdit).toBe(true);
  });

  it("Given: CONFIRMED return When: checking canEdit Then: returns false", () => {
    // Arrange & Act
    const ret = makeReturn({ status: "CONFIRMED" });

    // Assert
    expect(ret.canEdit).toBe(false);
  });

  it("Given: return with multiple lines When: accessing totalItems totalQuantity and lineCount Then: returns correct values", () => {
    // Arrange
    const lines = [
      makeLine({ id: "rl-1", quantity: 4 }),
      makeLine({ id: "rl-2", quantity: 6 }),
    ];

    // Act
    const ret = makeReturn({ lines });

    // Assert
    expect(ret.totalItems).toBe(2);
    expect(ret.totalQuantity).toBe(10);
    expect(ret.lineCount).toBe(2);
  });
});
