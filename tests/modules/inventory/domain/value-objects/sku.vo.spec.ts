import { describe, it, expect } from "vitest";
import { Sku } from "@/modules/inventory/domain/value-objects/sku.vo";

describe("Sku Value Object", () => {
  describe("create", () => {
    it("Given: valid SKU string When: creating Then: should create with uppercase value", () => {
      // Act
      const sku = Sku.create("prod-001");

      // Assert
      expect(sku.value).toBe("PROD-001");
    });

    it("Given: SKU with spaces When: creating Then: should trim and uppercase", () => {
      // Act
      const sku = Sku.create("  abc-123  ");

      // Assert
      expect(sku.value).toBe("ABC-123");
    });

    it("Given: SKU with underscores When: creating Then: should accept it", () => {
      // Act
      const sku = Sku.create("PROD_001");

      // Assert
      expect(sku.value).toBe("PROD_001");
    });

    it("Given: empty string When: creating Then: should throw error", () => {
      // Act & Assert
      expect(() => Sku.create("")).toThrow("SKU cannot be empty");
    });

    it("Given: whitespace only When: creating Then: should throw error", () => {
      // Act & Assert
      expect(() => Sku.create("   ")).toThrow("SKU cannot be empty");
    });

    it("Given: SKU exceeding 50 chars When: creating Then: should throw error", () => {
      // Arrange
      const longSku = "A".repeat(51);

      // Act & Assert
      expect(() => Sku.create(longSku)).toThrow(
        "SKU cannot exceed 50 characters",
      );
    });

    it("Given: SKU with special characters When: creating Then: should throw error", () => {
      // Act & Assert
      expect(() => Sku.create("PROD 001!")).toThrow(
        "SKU can only contain letters, numbers, hyphens and underscores",
      );
    });
  });

  describe("equals", () => {
    it("Given: two SKUs with same value When: comparing Then: should be equal", () => {
      // Arrange
      const sku1 = Sku.create("PROD-001");
      const sku2 = Sku.create("prod-001");

      // Act
      const result = sku1.equals(sku2);

      // Assert
      expect(result).toBe(true);
    });

    it("Given: two SKUs with different values When: comparing Then: should not be equal", () => {
      // Arrange
      const sku1 = Sku.create("PROD-001");
      const sku2 = Sku.create("PROD-002");

      // Act
      const result = sku1.equals(sku2);

      // Assert
      expect(result).toBe(false);
    });
  });
});
