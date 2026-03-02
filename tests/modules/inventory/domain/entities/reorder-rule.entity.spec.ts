import { describe, it, expect } from "vitest";
import { ReorderRule } from "@/modules/inventory/domain/entities/reorder-rule.entity";

describe("ReorderRule Entity", () => {
  const validProps = {
    id: "rr-001",
    productId: "prod-001",
    warehouseId: "wh-001",
    minQty: 10,
    maxQty: 100,
    safetyQty: 20,
  };

  describe("create", () => {
    it("Given: valid props When: creating Then: should create with correct data", () => {
      // Arrange
      const props = { ...validProps };

      // Act
      const entity = ReorderRule.create(props);

      // Assert
      expect(entity.id).toBe(props.id);
      expect(entity.productId).toBe(props.productId);
      expect(entity.warehouseId).toBe(props.warehouseId);
      expect(entity.minQty).toBe(props.minQty);
      expect(entity.maxQty).toBe(props.maxQty);
      expect(entity.safetyQty).toBe(props.safetyQty);
    });
  });

  describe("getters", () => {
    it("Given: a reorder rule When: accessing id Then: should return correct value", () => {
      // Arrange
      const entity = ReorderRule.create({ ...validProps });

      // Act & Assert
      expect(entity.id).toBe("rr-001");
    });

    it("Given: a reorder rule When: accessing productId Then: should return correct value", () => {
      // Arrange
      const entity = ReorderRule.create({ ...validProps });

      // Act & Assert
      expect(entity.productId).toBe("prod-001");
    });

    it("Given: a reorder rule When: accessing warehouseId Then: should return correct value", () => {
      // Arrange
      const entity = ReorderRule.create({ ...validProps });

      // Act & Assert
      expect(entity.warehouseId).toBe("wh-001");
    });

    it("Given: a reorder rule When: accessing minQty Then: should return correct value", () => {
      // Arrange
      const entity = ReorderRule.create({ ...validProps });

      // Act & Assert
      expect(entity.minQty).toBe(10);
    });

    it("Given: a reorder rule When: accessing maxQty Then: should return correct value", () => {
      // Arrange
      const entity = ReorderRule.create({ ...validProps });

      // Act & Assert
      expect(entity.maxQty).toBe(100);
    });

    it("Given: a reorder rule When: accessing safetyQty Then: should return correct value", () => {
      // Arrange
      const entity = ReorderRule.create({ ...validProps });

      // Act & Assert
      expect(entity.safetyQty).toBe(20);
    });
  });
});
