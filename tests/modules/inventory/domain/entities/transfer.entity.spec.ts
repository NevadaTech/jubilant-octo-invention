import { describe, it, expect } from "vitest";
import {
  Transfer,
  TransferLine,
} from "@/modules/inventory/domain/entities/transfer.entity";

describe("TransferLine", () => {
  it("Given: valid transfer line props When: creating a TransferLine Then: returns instance with correct values", () => {
    // Arrange
    const props = {
      id: "tl-1",
      productId: "prod-1",
      productName: "Widget A",
      productSku: "WDG-001",
      quantity: 15,
      receivedQuantity: null,
    };

    // Act
    const line = TransferLine.create(props);

    // Assert
    expect(line.id).toBe("tl-1");
    expect(line.productId).toBe("prod-1");
    expect(line.productName).toBe("Widget A");
    expect(line.productSku).toBe("WDG-001");
    expect(line.quantity).toBe(15);
    expect(line.receivedQuantity).toBeNull();
  });
});

describe("Transfer", () => {
  const makeLine = (
    overrides: Partial<{ id: string; quantity: number }> = {},
  ) =>
    TransferLine.create({
      id: overrides.id ?? "tl-1",
      productId: "prod-1",
      productName: "Widget A",
      productSku: "WDG-001",
      quantity: overrides.quantity ?? 10,
      receivedQuantity: null,
    });

  const makeTransfer = (
    overrides: Partial<{
      status: string;
      lines: ReturnType<typeof makeLine>[];
      linesCount: number;
      totalQuantity: number;
    }> = {},
  ) => {
    const lines = overrides.lines ?? [makeLine()];
    return Transfer.create({
      id: "tr-1",
      fromWarehouseId: "wh-1",
      fromWarehouseName: "Warehouse A",
      toWarehouseId: "wh-2",
      toWarehouseName: "Warehouse B",
      status: (overrides.status as any) ?? "DRAFT",
      notes: null,
      lines,
      linesCount: overrides.linesCount ?? lines.length,
      totalQuantity: overrides.totalQuantity,
      createdBy: "user-1",
      receivedBy: null,
      createdAt: new Date("2026-02-01T00:00:00Z"),
      completedAt: null,
    });
  };

  it("Given: valid transfer props When: creating a Transfer Then: returns instance with correct values", () => {
    // Arrange & Act
    const transfer = makeTransfer();

    // Assert
    expect(transfer.id).toBe("tr-1");
    expect(transfer.fromWarehouseId).toBe("wh-1");
    expect(transfer.fromWarehouseName).toBe("Warehouse A");
    expect(transfer.toWarehouseId).toBe("wh-2");
    expect(transfer.toWarehouseName).toBe("Warehouse B");
    expect(transfer.status).toBe("DRAFT");
    expect(transfer.createdBy).toBe("user-1");
    expect(transfer.createdAt).toEqual(new Date("2026-02-01T00:00:00Z"));
  });

  it("Given: transfer with multiple lines When: accessing totalItems and totalQuantity Then: returns correct counts", () => {
    // Arrange
    const lines = [
      makeLine({ id: "tl-1", quantity: 10 }),
      makeLine({ id: "tl-2", quantity: 25 }),
      makeLine({ id: "tl-3", quantity: 5 }),
    ];

    // Act
    const transfer = makeTransfer({ lines, linesCount: 3 });

    // Assert
    expect(transfer.totalItems).toBe(3);
    expect(transfer.totalQuantity).toBe(40);
  });

  it("Given: transfer with status DRAFT When: checking isDraft Then: returns true", () => {
    // Arrange & Act
    const transfer = makeTransfer({ status: "DRAFT" });

    // Assert
    expect(transfer.isDraft).toBe(true);
    expect(transfer.isInTransit).toBe(false);
    expect(transfer.isPartial).toBe(false);
    expect(transfer.isReceived).toBe(false);
    expect(transfer.isRejected).toBe(false);
    expect(transfer.isCanceled).toBe(false);
  });

  it("Given: transfer with status IN_TRANSIT When: checking isInTransit Then: returns true", () => {
    // Arrange & Act
    const transfer = makeTransfer({ status: "IN_TRANSIT" });

    // Assert
    expect(transfer.isInTransit).toBe(true);
    expect(transfer.isDraft).toBe(false);
  });

  it("Given: transfer with status PARTIAL When: checking isPartial Then: returns true", () => {
    // Arrange & Act
    const transfer = makeTransfer({ status: "PARTIAL" });

    // Assert
    expect(transfer.isPartial).toBe(true);
  });

  it("Given: transfer with status RECEIVED When: checking isReceived Then: returns true", () => {
    // Arrange & Act
    const transfer = makeTransfer({ status: "RECEIVED" });

    // Assert
    expect(transfer.isReceived).toBe(true);
  });

  it("Given: transfer with status REJECTED When: checking isRejected Then: returns true", () => {
    // Arrange & Act
    const transfer = makeTransfer({ status: "REJECTED" });

    // Assert
    expect(transfer.isRejected).toBe(true);
  });

  it("Given: transfer with status CANCELED When: checking isCanceled Then: returns true", () => {
    // Arrange & Act
    const transfer = makeTransfer({ status: "CANCELED" });

    // Assert
    expect(transfer.isCanceled).toBe(true);
  });

  it("Given: transfer with status DRAFT When: checking canStartTransit Then: returns true", () => {
    // Arrange & Act
    const transfer = makeTransfer({ status: "DRAFT" });

    // Assert
    expect(transfer.canStartTransit).toBe(true);
  });

  it("Given: transfer with status IN_TRANSIT When: checking canStartTransit Then: returns false", () => {
    // Arrange & Act
    const transfer = makeTransfer({ status: "IN_TRANSIT" });

    // Assert
    expect(transfer.canStartTransit).toBe(false);
  });

  it("Given: transfer with status IN_TRANSIT When: checking canReceive Then: returns true", () => {
    // Arrange & Act
    const transfer = makeTransfer({ status: "IN_TRANSIT" });

    // Assert
    expect(transfer.canReceive).toBe(true);
  });

  it("Given: transfer with status DRAFT When: checking canReceive Then: returns false", () => {
    // Arrange & Act
    const transfer = makeTransfer({ status: "DRAFT" });

    // Assert
    expect(transfer.canReceive).toBe(false);
  });

  it("Given: transfer with status IN_TRANSIT When: checking canReject Then: returns true", () => {
    // Arrange & Act
    const transfer = makeTransfer({ status: "IN_TRANSIT" });

    // Assert
    expect(transfer.canReject).toBe(true);
  });

  it("Given: transfer with status DRAFT When: checking canCancel Then: returns true", () => {
    // Arrange & Act
    const transfer = makeTransfer({ status: "DRAFT" });

    // Assert
    expect(transfer.canCancel).toBe(true);
  });

  it("Given: transfer with status IN_TRANSIT When: checking canCancel Then: returns true", () => {
    // Arrange & Act
    const transfer = makeTransfer({ status: "IN_TRANSIT" });

    // Assert
    expect(transfer.canCancel).toBe(true);
  });

  it("Given: transfer with status RECEIVED When: checking canCancel Then: returns false", () => {
    // Arrange & Act
    const transfer = makeTransfer({ status: "RECEIVED" });

    // Assert
    expect(transfer.canCancel).toBe(false);
  });
});
