import { describe, it, expect } from "vitest";
import { StockMapper } from "@/modules/inventory/application/mappers/stock.mapper";

describe("StockMapper", () => {
  const mockRawDto = {
    id: "stock-1",
    productId: "prod-1",
    productName: "Widget",
    productSku: "WDG-001",
    warehouseId: "wh-1",
    warehouseName: "Main",
    quantity: 100,
    reservedQuantity: 10,
    availableQuantity: 90,
    averageCost: 5.5,
    totalValue: 550,
    currency: "USD",
    lastMovementAt: "2025-03-01T12:00:00.000Z",
  };

  describe("toDomain", () => {
    it("Given a full raw DTO with all fields, When toDomain is called, Then it should map all fields to a Stock entity", () => {
      // Arrange
      const dto = { ...mockRawDto };

      // Act
      const entity = StockMapper.toDomain(dto);

      // Assert
      expect(entity.id).toBe("stock-1");
      expect(entity.productId).toBe("prod-1");
      expect(entity.productName).toBe("Widget");
      expect(entity.productSku).toBe("WDG-001");
      expect(entity.warehouseId).toBe("wh-1");
      expect(entity.warehouseName).toBe("Main");
      expect(entity.quantity).toBe(100);
      expect(entity.reservedQuantity).toBe(10);
      expect(entity.availableQuantity).toBe(90);
      expect(entity.averageCost).toBe(5.5);
      expect(entity.totalValue).toBe(550);
      expect(entity.currency).toBe("USD");
    });

    it("Given a DTO without an id, When toDomain is called with an index, Then it should generate a composite id", () => {
      // Arrange
      const dtoWithoutId = { ...mockRawDto };
      delete (dtoWithoutId as Record<string, unknown>).id;

      // Act
      const entity = StockMapper.toDomain(dtoWithoutId, 3);

      // Assert
      expect(entity.id).toBe("prod-1:wh-1:3");
    });

    it("Given a DTO without an id and no index, When toDomain is called, Then it should generate a composite id with index 0", () => {
      // Arrange
      const dtoWithoutId = { ...mockRawDto };
      delete (dtoWithoutId as Record<string, unknown>).id;

      // Act
      const entity = StockMapper.toDomain(dtoWithoutId);

      // Assert
      expect(entity.id).toBe("prod-1:wh-1:0");
    });

    it("Given a DTO with missing optional fields, When toDomain is called, Then defaults should be applied", () => {
      // Arrange
      const minimalDto = {
        productId: "prod-2",
        warehouseId: "wh-2",
      };

      // Act
      const entity = StockMapper.toDomain(minimalDto);

      // Assert
      expect(entity.productName).toBe("");
      expect(entity.productSku).toBe("");
      expect(entity.warehouseName).toBe("");
      expect(entity.quantity).toBe(0);
      expect(entity.reservedQuantity).toBe(0);
      expect(entity.averageCost).toBe(0);
      expect(entity.totalValue).toBe(0);
      expect(entity.currency).toBe("USD");
    });

    it("Given a DTO with a lastMovementAt string, When toDomain is called, Then it should convert to a Date object", () => {
      // Arrange
      const dto = { ...mockRawDto };

      // Act
      const entity = StockMapper.toDomain(dto);

      // Assert
      expect(entity.lastMovementAt).toBeInstanceOf(Date);
      expect(entity.lastMovementAt!.toISOString()).toBe(
        "2025-03-01T12:00:00.000Z"
      );
    });

    it("Given a DTO with null lastMovementAt, When toDomain is called, Then lastMovementAt should be null", () => {
      // Arrange
      const dto = { ...mockRawDto, lastMovementAt: null };

      // Act
      const entity = StockMapper.toDomain(dto);

      // Assert
      expect(entity.lastMovementAt).toBeNull();
    });
  });

  describe("toDto", () => {
    it("Given a Stock entity, When toDto is called, Then it should map fields to a DTO without averageCost/totalValue/currency", () => {
      // Arrange
      const entity = StockMapper.toDomain(mockRawDto);

      // Act
      const dto = StockMapper.toDto(entity);

      // Assert
      expect(dto.id).toBe("stock-1");
      expect(dto.productId).toBe("prod-1");
      expect(dto.productName).toBe("Widget");
      expect(dto.productSku).toBe("WDG-001");
      expect(dto.warehouseId).toBe("wh-1");
      expect(dto.warehouseName).toBe("Main");
      expect(dto.quantity).toBe(100);
      expect(dto.reservedQuantity).toBe(10);
      expect(dto.availableQuantity).toBe(90);
      expect(dto).not.toHaveProperty("averageCost");
      expect(dto).not.toHaveProperty("totalValue");
      expect(dto).not.toHaveProperty("currency");
    });
  });
});
