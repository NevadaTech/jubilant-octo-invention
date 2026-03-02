import { describe, it, expect } from "vitest";
import { Stock } from "@/modules/inventory/domain/entities/stock.entity";

describe("Stock Entity", () => {
  const now = new Date();

  const validProps = {
    id: "stock-001",
    productId: "prod-001",
    productName: "Test Product",
    productSku: "SKU-001",
    warehouseId: "wh-001",
    warehouseName: "Main Warehouse",
    quantity: 100,
    reservedQuantity: 20,
    availableQuantity: 80,
    averageCost: 10.5,
    totalValue: 1050,
    currency: "USD",
    lastMovementAt: now,
  };

  describe("create", () => {
    it("Given: valid props When: creating Then: should create with correct data", () => {
      // Arrange
      const props = { ...validProps };

      // Act
      const entity = Stock.create(props);

      // Assert
      expect(entity.id).toBe(props.id);
      expect(entity.productId).toBe(props.productId);
      expect(entity.productName).toBe(props.productName);
      expect(entity.productSku).toBe(props.productSku);
      expect(entity.warehouseId).toBe(props.warehouseId);
      expect(entity.warehouseName).toBe(props.warehouseName);
      expect(entity.quantity).toBe(100);
      expect(entity.reservedQuantity).toBe(20);
      expect(entity.availableQuantity).toBe(80);
      expect(entity.averageCost).toBe(10.5);
      expect(entity.totalValue).toBe(1050);
      expect(entity.currency).toBe("USD");
      expect(entity.lastMovementAt).toBe(now);
    });
  });

  describe("hasReservedStock", () => {
    it("Given: stock with reserved quantity > 0 When: checking hasReservedStock Then: should return true", () => {
      // Arrange
      const entity = Stock.create({ ...validProps, reservedQuantity: 10 });

      // Act
      const result = entity.hasReservedStock;

      // Assert
      expect(result).toBe(true);
    });

    it("Given: stock with reserved quantity = 0 When: checking hasReservedStock Then: should return false", () => {
      // Arrange
      const entity = Stock.create({ ...validProps, reservedQuantity: 0 });

      // Act
      const result = entity.hasReservedStock;

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("isOutOfStock", () => {
    it("Given: stock with available quantity = 0 When: checking isOutOfStock Then: should return true", () => {
      // Arrange
      const entity = Stock.create({ ...validProps, availableQuantity: 0 });

      // Act
      const result = entity.isOutOfStock;

      // Assert
      expect(result).toBe(true);
    });

    it("Given: stock with available quantity > 0 When: checking isOutOfStock Then: should return false", () => {
      // Arrange
      const entity = Stock.create({ ...validProps, availableQuantity: 50 });

      // Act
      const result = entity.isOutOfStock;

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("isLowStock", () => {
    it("Given: available quantity at minStock When: checking isLowStock Then: should return true", () => {
      // Arrange
      const entity = Stock.create({ ...validProps, availableQuantity: 5 });

      // Act
      const result = entity.isLowStock(5);

      // Assert
      expect(result).toBe(true);
    });

    it("Given: available quantity below minStock When: checking isLowStock Then: should return true", () => {
      // Arrange
      const entity = Stock.create({ ...validProps, availableQuantity: 3 });

      // Act
      const result = entity.isLowStock(5);

      // Assert
      expect(result).toBe(true);
    });

    it("Given: available quantity above minStock When: checking isLowStock Then: should return false", () => {
      // Arrange
      const entity = Stock.create({ ...validProps, availableQuantity: 20 });

      // Act
      const result = entity.isLowStock(5);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("isFullyReserved", () => {
    it("Given: quantity > 0 and available = 0 When: checking isFullyReserved Then: should return true", () => {
      // Arrange
      const entity = Stock.create({
        ...validProps,
        quantity: 50,
        availableQuantity: 0,
      });

      // Act
      const result = entity.isFullyReserved;

      // Assert
      expect(result).toBe(true);
    });

    it("Given: quantity > 0 and available > 0 When: checking isFullyReserved Then: should return false", () => {
      // Arrange
      const entity = Stock.create({
        ...validProps,
        quantity: 50,
        availableQuantity: 10,
      });

      // Act
      const result = entity.isFullyReserved;

      // Assert
      expect(result).toBe(false);
    });

    it("Given: quantity = 0 When: checking isFullyReserved Then: should return false", () => {
      // Arrange
      const entity = Stock.create({
        ...validProps,
        quantity: 0,
        availableQuantity: 0,
      });

      // Act
      const result = entity.isFullyReserved;

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("reservedPercentage", () => {
    it("Given: stock with quantity and reserved When: checking reservedPercentage Then: should return correct percentage", () => {
      // Arrange
      const entity = Stock.create({
        ...validProps,
        quantity: 100,
        reservedQuantity: 25,
      });

      // Act
      const result = entity.reservedPercentage;

      // Assert
      expect(result).toBe(25);
    });

    it("Given: stock with quantity = 0 When: checking reservedPercentage Then: should return 0", () => {
      // Arrange
      const entity = Stock.create({
        ...validProps,
        quantity: 0,
        reservedQuantity: 0,
      });

      // Act
      const result = entity.reservedPercentage;

      // Assert
      expect(result).toBe(0);
    });

    it("Given: stock with partial reservation When: checking reservedPercentage Then: should round correctly", () => {
      // Arrange
      const entity = Stock.create({
        ...validProps,
        quantity: 3,
        reservedQuantity: 1,
      });

      // Act
      const result = entity.reservedPercentage;

      // Assert
      expect(result).toBe(Math.round((1 / 3) * 100));
    });
  });

  describe("availableValue", () => {
    it("Given: stock with available quantity and average cost When: checking availableValue Then: should return correct value", () => {
      // Arrange
      const entity = Stock.create({
        ...validProps,
        availableQuantity: 80,
        averageCost: 10.5,
      });

      // Act
      const result = entity.availableValue;

      // Assert
      expect(result).toBe(80 * 10.5);
    });

    it("Given: stock with zero available quantity When: checking availableValue Then: should return 0", () => {
      // Arrange
      const entity = Stock.create({
        ...validProps,
        availableQuantity: 0,
        averageCost: 10.5,
      });

      // Act
      const result = entity.availableValue;

      // Assert
      expect(result).toBe(0);
    });
  });

  describe("nullable fields", () => {
    it("Given: null lastMovementAt When: creating Then: should preserve null value", () => {
      // Arrange
      const props = { ...validProps, lastMovementAt: null };

      // Act
      const entity = Stock.create(props);

      // Assert
      expect(entity.lastMovementAt).toBeNull();
    });
  });
});
