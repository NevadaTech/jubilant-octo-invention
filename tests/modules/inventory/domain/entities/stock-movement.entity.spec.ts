import { describe, it, expect } from "vitest";
import {
  StockMovement,
  MovementLine,
} from "@/modules/inventory/domain/entities/stock-movement.entity";

describe("MovementLine", () => {
  it("Given: valid movement line props When: creating a MovementLine Then: returns instance with correct values", () => {
    // Arrange
    const props = {
      id: "line-1",
      productId: "prod-1",
      productName: "Widget A",
      productSku: "WDG-001",
      quantity: 10,
      unitCost: null,
      currency: null,
    };

    // Act
    const line = MovementLine.create(props);

    // Assert
    expect(line.id).toBe("line-1");
    expect(line.productId).toBe("prod-1");
    expect(line.productName).toBe("Widget A");
    expect(line.productSku).toBe("WDG-001");
    expect(line.quantity).toBe(10);
    expect(line.unitCost).toBeNull();
    expect(line.currency).toBeNull();
  });
});

describe("StockMovement", () => {
  const makeLine = (overrides: Partial<{ id: string; quantity: number }> = {}) =>
    MovementLine.create({
      id: overrides.id ?? "line-1",
      productId: "prod-1",
      productName: "Widget A",
      productSku: "WDG-001",
      quantity: overrides.quantity ?? 5,
      unitCost: null,
      currency: null,
    });

  const makeMovement = (
    overrides: Partial<{
      type: string;
      status: string;
      lines: ReturnType<typeof makeLine>[];
    }> = {}
  ) =>
    StockMovement.create({
      id: "mov-1",
      warehouseId: "wh-1",
      warehouseName: "Main Warehouse",
      warehouseCode: null,
      type: (overrides.type as any) ?? "IN",
      status: (overrides.status as any) ?? "DRAFT",
      reference: null,
      reason: null,
      note: null,
      lines: overrides.lines ?? [makeLine()],
      createdBy: "user-1",
      createdByName: null,
      createdAt: new Date("2026-01-15T00:00:00Z"),
      postedAt: null,
      postedBy: null,
      postedByName: null,
      returnedAt: null,
      returnedBy: null,
      returnedByName: null,
    });

  it("Given: valid stock movement props When: creating a StockMovement Then: returns instance with correct values", () => {
    // Arrange & Act
    const movement = makeMovement();

    // Assert
    expect(movement.id).toBe("mov-1");
    expect(movement.warehouseId).toBe("wh-1");
    expect(movement.warehouseName).toBe("Main Warehouse");
    expect(movement.type).toBe("IN");
    expect(movement.status).toBe("DRAFT");
    expect(movement.createdBy).toBe("user-1");
    expect(movement.createdAt).toEqual(new Date("2026-01-15T00:00:00Z"));
  });

  it("Given: movement with multiple lines When: accessing totalItems and totalQuantity Then: returns correct counts", () => {
    // Arrange
    const lines = [
      makeLine({ id: "line-1", quantity: 10 }),
      makeLine({ id: "line-2", quantity: 20 }),
      makeLine({ id: "line-3", quantity: 5 }),
    ];

    // Act
    const movement = makeMovement({ lines });

    // Assert
    expect(movement.totalItems).toBe(3);
    expect(movement.totalQuantity).toBe(35);
  });

  it("Given: movement with type IN When: checking isEntry Then: returns true", () => {
    // Arrange & Act
    const movement = makeMovement({ type: "IN" });

    // Assert
    expect(movement.isEntry).toBe(true);
    expect(movement.isExit).toBe(false);
  });

  it("Given: movement with type ADJUST_IN When: checking isEntry Then: returns true", () => {
    // Arrange & Act
    const movement = makeMovement({ type: "ADJUST_IN" });

    // Assert
    expect(movement.isEntry).toBe(true);
    expect(movement.isAdjustment).toBe(true);
  });

  it("Given: movement with type TRANSFER_IN When: checking isEntry and isTransfer Then: both return true", () => {
    // Arrange & Act
    const movement = makeMovement({ type: "TRANSFER_IN" });

    // Assert
    expect(movement.isEntry).toBe(true);
    expect(movement.isTransfer).toBe(true);
  });

  it("Given: movement with type OUT When: checking isExit Then: returns true", () => {
    // Arrange & Act
    const movement = makeMovement({ type: "OUT" });

    // Assert
    expect(movement.isExit).toBe(true);
    expect(movement.isEntry).toBe(false);
  });

  it("Given: movement with type ADJUST_OUT When: checking isExit and isAdjustment Then: both return true", () => {
    // Arrange & Act
    const movement = makeMovement({ type: "ADJUST_OUT" });

    // Assert
    expect(movement.isExit).toBe(true);
    expect(movement.isAdjustment).toBe(true);
  });

  it("Given: movement with type TRANSFER_OUT When: checking isExit and isTransfer Then: both return true", () => {
    // Arrange & Act
    const movement = makeMovement({ type: "TRANSFER_OUT" });

    // Assert
    expect(movement.isExit).toBe(true);
    expect(movement.isTransfer).toBe(true);
  });

  it("Given: movement with status DRAFT When: checking isDraft Then: returns true", () => {
    // Arrange & Act
    const movement = makeMovement({ status: "DRAFT" });

    // Assert
    expect(movement.isDraft).toBe(true);
    expect(movement.isPosted).toBe(false);
    expect(movement.isVoid).toBe(false);
    expect(movement.isReturned).toBe(false);
  });

  it("Given: movement with status POSTED When: checking isPosted Then: returns true", () => {
    // Arrange & Act
    const movement = makeMovement({ status: "POSTED" });

    // Assert
    expect(movement.isPosted).toBe(true);
    expect(movement.isDraft).toBe(false);
  });

  it("Given: movement with status VOID When: checking isVoid Then: returns true", () => {
    // Arrange & Act
    const movement = makeMovement({ status: "VOID" });

    // Assert
    expect(movement.isVoid).toBe(true);
  });

  it("Given: movement with status RETURNED When: checking isReturned Then: returns true", () => {
    // Arrange & Act
    const movement = makeMovement({ status: "RETURNED" });

    // Assert
    expect(movement.isReturned).toBe(true);
  });

  it("Given: movement with status DRAFT When: checking canPost Then: returns true", () => {
    // Arrange & Act
    const movement = makeMovement({ status: "DRAFT" });

    // Assert
    expect(movement.canPost).toBe(true);
  });

  it("Given: movement with status POSTED When: checking canPost Then: returns false", () => {
    // Arrange & Act
    const movement = makeMovement({ status: "POSTED" });

    // Assert
    expect(movement.canPost).toBe(false);
  });

  it("Given: movement with status POSTED When: checking canVoid Then: returns true", () => {
    // Arrange & Act
    const movement = makeMovement({ status: "POSTED" });

    // Assert
    expect(movement.canVoid).toBe(true);
  });

  it("Given: movement with status DRAFT When: checking canVoid Then: returns false", () => {
    // Arrange & Act
    const movement = makeMovement({ status: "DRAFT" });

    // Assert
    expect(movement.canVoid).toBe(false);
  });
});
