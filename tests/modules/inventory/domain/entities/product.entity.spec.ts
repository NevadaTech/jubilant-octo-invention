import { describe, it, expect } from "vitest";
import { Product } from "@/modules/inventory/domain/entities/product.entity";

describe("Product Entity", () => {
  const now = new Date();

  const validProps = {
    id: "prod-001",
    sku: "SKU-001",
    name: "Test Product",
    description: "A test product",
    categories: [{ id: "cat-1", name: "Category A" }],
    unitOfMeasure: "UNIT",
    cost: 10,
    price: 25,
    minStock: 5,
    maxStock: 100,
    isActive: true,
    imageUrl: "https://example.com/image.png",
    createdAt: now,
    updatedAt: now,
    averageCost: 10,
    totalStock: 50,
    margin: 60,
    profit: 15,
    safetyStock: 10,
    totalIn30d: 100,
    totalOut30d: 80,
    avgDailyConsumption: 2.5,
    daysOfStock: 20,
    turnoverRate: 1.6,
    lastMovementDate: now,
    statusChangedBy: null,
    statusChangedAt: null,
  };

  describe("create", () => {
    it("Given: valid props When: creating Then: should create with correct data", () => {
      // Arrange
      const props = { ...validProps };

      // Act
      const entity = Product.create(props);

      // Assert
      expect(entity.id).toBe(props.id);
      expect(entity.sku).toBe(props.sku);
      expect(entity.name).toBe(props.name);
    });
  });

  describe("getters", () => {
    it("Given: a product When: accessing getters Then: should return correct values", () => {
      // Arrange
      const props = { ...validProps };

      // Act
      const entity = Product.create(props);

      // Assert
      expect(entity.id).toBe("prod-001");
      expect(entity.sku).toBe("SKU-001");
      expect(entity.name).toBe("Test Product");
      expect(entity.description).toBe("A test product");
      expect(entity.categories).toEqual([{ id: "cat-1", name: "Category A" }]);
      expect(entity.unitOfMeasure).toBe("UNIT");
      expect(entity.cost).toBe(10);
      expect(entity.price).toBe(25);
      expect(entity.minStock).toBe(5);
      expect(entity.maxStock).toBe(100);
      expect(entity.isActive).toBe(true);
      expect(entity.imageUrl).toBe("https://example.com/image.png");
      expect(entity.createdAt).toBe(now);
      expect(entity.updatedAt).toBe(now);
      expect(entity.averageCost).toBe(10);
      expect(entity.totalStock).toBe(50);
      expect(entity.margin).toBe(60);
      expect(entity.profit).toBe(15);
      expect(entity.safetyStock).toBe(10);
      expect(entity.totalIn30d).toBe(100);
      expect(entity.totalOut30d).toBe(80);
      expect(entity.avgDailyConsumption).toBe(2.5);
      expect(entity.daysOfStock).toBe(20);
      expect(entity.turnoverRate).toBe(1.6);
      expect(entity.lastMovementDate).toBe(now);
      expect(entity.statusChangedBy).toBeNull();
      expect(entity.statusChangedAt).toBeNull();
    });
  });

  describe("isLowStock", () => {
    it("Given: currentQuantity equals minStock When: checking isLowStock Then: should return true", () => {
      // Arrange
      const entity = Product.create({ ...validProps, minStock: 5 });

      // Act
      const result = entity.isLowStock(5);

      // Assert
      expect(result).toBe(true);
    });

    it("Given: currentQuantity below minStock When: checking isLowStock Then: should return true", () => {
      // Arrange
      const entity = Product.create({ ...validProps, minStock: 5 });

      // Act
      const result = entity.isLowStock(3);

      // Assert
      expect(result).toBe(true);
    });

    it("Given: currentQuantity above minStock When: checking isLowStock Then: should return false", () => {
      // Arrange
      const entity = Product.create({ ...validProps, minStock: 5 });

      // Act
      const result = entity.isLowStock(10);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("isOverStock", () => {
    it("Given: currentQuantity above maxStock When: checking isOverStock Then: should return true", () => {
      // Arrange
      const entity = Product.create({ ...validProps, maxStock: 100 });

      // Act
      const result = entity.isOverStock(101);

      // Assert
      expect(result).toBe(true);
    });

    it("Given: currentQuantity at maxStock When: checking isOverStock Then: should return false", () => {
      // Arrange
      const entity = Product.create({ ...validProps, maxStock: 100 });

      // Act
      const result = entity.isOverStock(100);

      // Assert
      expect(result).toBe(false);
    });

    it("Given: currentQuantity below maxStock When: checking isOverStock Then: should return false", () => {
      // Arrange
      const entity = Product.create({ ...validProps, maxStock: 100 });

      // Act
      const result = entity.isOverStock(50);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("nullable fields", () => {
    it("Given: null description and imageUrl When: creating Then: should preserve null values", () => {
      // Arrange
      const props = { ...validProps, description: null, imageUrl: null };

      // Act
      const entity = Product.create(props);

      // Assert
      expect(entity.description).toBeNull();
      expect(entity.imageUrl).toBeNull();
    });

    it("Given: null daysOfStock and lastMovementDate When: creating Then: should preserve null values", () => {
      // Arrange
      const props = {
        ...validProps,
        daysOfStock: null,
        lastMovementDate: null,
      };

      // Act
      const entity = Product.create(props);

      // Assert
      expect(entity.daysOfStock).toBeNull();
      expect(entity.lastMovementDate).toBeNull();
    });
  });

  describe("categories", () => {
    it("Given: multiple categories When: creating Then: should preserve categories array", () => {
      // Arrange
      const categories = [
        { id: "cat-1", name: "Category A" },
        { id: "cat-2", name: "Category B" },
        { id: "cat-3", name: "Category C" },
      ];
      const props = { ...validProps, categories };

      // Act
      const entity = Product.create(props);

      // Assert
      expect(entity.categories).toEqual(categories);
      expect(entity.categories).toHaveLength(3);
    });

    it("Given: empty categories When: creating Then: should preserve empty array", () => {
      // Arrange
      const props = { ...validProps, categories: [] };

      // Act
      const entity = Product.create(props);

      // Assert
      expect(entity.categories).toEqual([]);
      expect(entity.categories).toHaveLength(0);
    });
  });
});
