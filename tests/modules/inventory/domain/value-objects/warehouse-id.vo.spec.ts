import { describe, it, expect } from "vitest";
import { WarehouseId } from "@/modules/inventory/domain/value-objects/warehouse-id.vo";

describe("WarehouseId Value Object", () => {
  describe("create", () => {
    it("Given: valid id string When: creating Then: should create with correct value", () => {
      // Act
      const warehouseId = WarehouseId.create("wh-001");

      // Assert
      expect(warehouseId.value).toBe("wh-001");
    });

    it("Given: empty string When: creating Then: should throw error", () => {
      // Act & Assert
      expect(() => WarehouseId.create("")).toThrow(
        "Warehouse ID cannot be empty",
      );
    });

    it("Given: whitespace only When: creating Then: should throw error", () => {
      // Act & Assert
      expect(() => WarehouseId.create("   ")).toThrow(
        "Warehouse ID cannot be empty",
      );
    });
  });

  describe("equals", () => {
    it("Given: two WarehouseIds with same value When: comparing Then: should be equal", () => {
      // Arrange
      const id1 = WarehouseId.create("wh-001");
      const id2 = WarehouseId.create("wh-001");

      // Act
      const result = id1.equals(id2);

      // Assert
      expect(result).toBe(true);
    });

    it("Given: two WarehouseIds with different values When: comparing Then: should not be equal", () => {
      // Arrange
      const id1 = WarehouseId.create("wh-001");
      const id2 = WarehouseId.create("wh-002");

      // Act
      const result = id1.equals(id2);

      // Assert
      expect(result).toBe(false);
    });
  });
});
