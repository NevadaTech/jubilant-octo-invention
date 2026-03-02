import { describe, it, expect } from "vitest";
import { Money } from "@/modules/inventory/domain/value-objects/money.vo";

describe("Money Value Object", () => {
  describe("create", () => {
    it("Given: valid amount and currency When: creating Money Then: should create with correct values", () => {
      // Act
      const money = Money.create(10.5, "USD");

      // Assert
      expect(money.amount).toBe(10.5);
      expect(money.currency).toBe("USD");
    });

    it("Given: no currency When: creating Money Then: should default to USD", () => {
      // Act
      const money = Money.create(25);

      // Assert
      expect(money.currency).toBe("USD");
    });

    it("Given: lowercase currency When: creating Money Then: should uppercase it", () => {
      // Act
      const money = Money.create(10, "eur");

      // Assert
      expect(money.currency).toBe("EUR");
    });

    it("Given: amount with many decimals When: creating Money Then: should round to 2 decimal places", () => {
      // Act
      const money = Money.create(10.555);

      // Assert
      expect(money.amount).toBe(10.56);
    });

    it("Given: negative amount When: creating Money Then: should throw error", () => {
      // Act & Assert
      expect(() => Money.create(-5)).toThrow("Amount cannot be negative");
    });
  });

  describe("zero", () => {
    it("Given: no args When: creating zero Money Then: should have 0 amount and USD", () => {
      // Act
      const money = Money.zero();

      // Assert
      expect(money.amount).toBe(0);
      expect(money.currency).toBe("USD");
    });

    it("Given: specific currency When: creating zero Money Then: should use that currency", () => {
      // Act
      const money = Money.zero("EUR");

      // Assert
      expect(money.amount).toBe(0);
      expect(money.currency).toBe("EUR");
    });
  });

  describe("add", () => {
    it("Given: two Money with same currency When: adding Then: should return correct sum", () => {
      // Arrange
      const a = Money.create(10, "USD");
      const b = Money.create(5.5, "USD");

      // Act
      const result = a.add(b);

      // Assert
      expect(result.amount).toBe(15.5);
      expect(result.currency).toBe("USD");
    });

    it("Given: two Money with different currencies When: adding Then: should throw error", () => {
      // Arrange
      const a = Money.create(10, "USD");
      const b = Money.create(5, "EUR");

      // Act & Assert
      expect(() => a.add(b)).toThrow(
        "Cannot add money with different currencies",
      );
    });
  });

  describe("subtract", () => {
    it("Given: two Money with same currency When: subtracting Then: should return correct difference", () => {
      // Arrange
      const a = Money.create(10, "USD");
      const b = Money.create(3, "USD");

      // Act
      const result = a.subtract(b);

      // Assert
      expect(result.amount).toBe(7);
    });

    it("Given: two Money with different currencies When: subtracting Then: should throw error", () => {
      // Arrange
      const a = Money.create(10, "USD");
      const b = Money.create(3, "EUR");

      // Act & Assert
      expect(() => a.subtract(b)).toThrow(
        "Cannot subtract money with different currencies",
      );
    });
  });

  describe("multiply", () => {
    it("Given: Money and factor When: multiplying Then: should return correct product", () => {
      // Arrange
      const money = Money.create(10, "USD");

      // Act
      const result = money.multiply(3);

      // Assert
      expect(result.amount).toBe(30);
      expect(result.currency).toBe("USD");
    });
  });

  describe("equals", () => {
    it("Given: two Money with same props When: comparing Then: should be equal", () => {
      // Arrange
      const a = Money.create(10, "USD");
      const b = Money.create(10, "USD");

      // Act
      const result = a.equals(b);

      // Assert
      expect(result).toBe(true);
    });

    it("Given: two Money with different amounts When: comparing Then: should not be equal", () => {
      // Arrange
      const a = Money.create(10, "USD");
      const b = Money.create(20, "USD");

      // Act
      const result = a.equals(b);

      // Assert
      expect(result).toBe(false);
    });
  });
});
