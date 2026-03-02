import { describe, it, expect } from "vitest";
import { TransferMapper } from "@/modules/inventory/application/mappers/transfer.mapper";

describe("TransferMapper", () => {
  const mockLine = {
    id: "line-1",
    productId: "p1",
    productName: "Widget",
    productSku: "WDG-001",
    quantity: 10,
    receivedQuantity: null,
  };

  const mockTransferDto = {
    id: "tr-1",
    fromWarehouseId: "wh-1",
    fromWarehouseName: "WH-A",
    toWarehouseId: "wh-2",
    toWarehouseName: "WH-B",
    status: "DRAFT",
    note: "Test note",
    lines: [mockLine],
    linesCount: 1,
    createdBy: "user-1",
    orgId: "org-1",
    receivedAt: null,
    createdAt: "2025-01-15T10:30:00.000Z",
    updatedAt: "2025-01-15T10:30:00.000Z",
  };

  const mockRaw = {
    id: "tr-1",
    fromWarehouseId: "wh-1",
    toWarehouseId: "wh-2",
    status: "DRAFT" as const,
    note: "Raw note",
    lines: [mockLine],
    linesCount: 1,
    totalQuantity: 10,
    createdBy: "user-1",
    createdAt: "2025-01-15T10:30:00.000Z",
  };

  describe("lineToDomain", () => {
    it("Given a TransferLineResponseDto, When lineToDomain is called, Then it maps all fields correctly", () => {
      // Arrange
      const lineDto = { ...mockLine };

      // Act
      const result = TransferMapper.lineToDomain(lineDto as any);

      // Assert
      expect(result.id).toBe("line-1");
      expect(result.productId).toBe("p1");
      expect(result.productName).toBe("Widget");
      expect(result.productSku).toBe("WDG-001");
      expect(result.quantity).toBe(10);
      expect(result.receivedQuantity).toBeNull();
    });
  });

  describe("fromApiRaw", () => {
    it("Given a TransferApiRawDto with all fields, When fromApiRaw is called, Then it maps to domain correctly", () => {
      // Arrange
      const raw = { ...mockRaw };

      // Act
      const result = TransferMapper.fromApiRaw(raw as any);

      // Assert
      expect(result.id).toBe("tr-1");
      expect(result.fromWarehouseId).toBe("wh-1");
      expect(result.toWarehouseId).toBe("wh-2");
      expect(result.status).toBe("DRAFT");
      expect(result.notes).toBe("Raw note");
      expect(result.lines).toHaveLength(1);
      expect(result.createdBy).toBe("user-1");
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it("Given a TransferApiRawDto with missing optional names, When fromApiRaw is called, Then names default to empty string", () => {
      // Arrange
      const rawWithoutNames = {
        id: "tr-2",
        fromWarehouseId: "wh-1",
        toWarehouseId: "wh-2",
        status: "DRAFT" as const,
        createdBy: "user-1",
        createdAt: "2025-01-15T10:30:00.000Z",
      };

      // Act
      const result = TransferMapper.fromApiRaw(rawWithoutNames as any);

      // Assert
      expect(result.fromWarehouseName).toBe("");
      expect(result.toWarehouseName).toBe("");
      expect(result.lines).toEqual([]);
    });
  });

  describe("toDomain", () => {
    it("Given a full TransferResponseDto, When toDomain is called, Then it maps all fields to domain entity", () => {
      // Arrange
      const dto = { ...mockTransferDto };

      // Act
      const result = TransferMapper.toDomain(dto as any);

      // Assert
      expect(result.id).toBe("tr-1");
      expect(result.fromWarehouseId).toBe("wh-1");
      expect(result.fromWarehouseName).toBe("WH-A");
      expect(result.toWarehouseId).toBe("wh-2");
      expect(result.toWarehouseName).toBe("WH-B");
      expect(result.status).toBe("DRAFT");
      expect(result.notes).toBe("Test note");
      expect(result.lines).toHaveLength(1);
      expect(result.linesCount).toBe(1);
      expect(result.createdBy).toBe("user-1");
      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });

  describe("lineToDto", () => {
    it("Given a TransferLine domain entity, When lineToDto is called, Then it maps back to dto shape", () => {
      // Arrange
      const domainLine = TransferMapper.lineToDomain(mockLine as any);

      // Act
      const result = TransferMapper.lineToDto(domainLine);

      // Assert
      expect(result.id).toBe("line-1");
      expect(result.productId).toBe("p1");
      expect(result.productName).toBe("Widget");
      expect(result.productSku).toBe("WDG-001");
      expect(result.quantity).toBe(10);
      expect(result.receivedQuantity).toBeNull();
    });
  });

  describe("toDto", () => {
    it("Given a Transfer domain entity, When toDto is called, Then it maps back to dto shape", () => {
      // Arrange
      const domainTransfer = TransferMapper.toDomain(mockTransferDto as any);

      // Act
      const result = TransferMapper.toDto(domainTransfer);

      // Assert
      expect(result.id).toBe("tr-1");
      expect(result.fromWarehouseId).toBe("wh-1");
      expect(result.fromWarehouseName).toBe("WH-A");
      expect(result.toWarehouseId).toBe("wh-2");
      expect(result.toWarehouseName).toBe("WH-B");
      expect(result.status).toBe("DRAFT");
      expect(result.note).toBe("Test note");
      expect(result.lines).toHaveLength(1);
      expect(result.createdBy).toBe("user-1");
      expect(typeof result.createdAt).toBe("string");
    });
  });
});
