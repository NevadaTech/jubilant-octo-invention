import { describe, it, expect } from "vitest";
import { ProductId } from "@/modules/inventory/domain/value-objects/product-id.vo";

describe("ProductId Value Object", () => {
  describe("create", () => {
    it("Given: valid id string When: creating Then: should create with correct value", () => {
      // Act
      const productId = ProductId.create("123e4567-e89b-12d3-a456-426614174000");

      // Assert
      expect(productId.value).toBe("123e4567-e89b-12d3-a456-426614174000");
    });

    it("Given: empty string When: creating Then: should throw error", () => {
      // Act & Assert
      expect(() => ProductId.create("")).toThrow("Product ID cannot be empty");
    });

    it("Given: whitespace only When: creating Then: should throw error", () => {
      // Act & Assert
      expect(() => ProductId.create("   ")).toThrow(
        "Product ID cannot be empty",
      );
    });
  });

  describe("equals", () => {
    it("Given: two ProductIds with same value When: comparing Then: should be equal", () => {
      // Arrange
      const id1 = ProductId.create("abc-123");
      const id2 = ProductId.create("abc-123");

      // Act
      const result = id1.equals(id2);

      // Assert
      expect(result).toBe(true);
    });

    it("Given: two ProductIds with different values When: comparing Then: should not be equal", () => {
      // Arrange
      const id1 = ProductId.create("abc-123");
      const id2 = ProductId.create("def-456");

      // Act
      const result = id1.equals(id2);

      // Assert
      expect(result).toBe(false);
    });
  });
});
