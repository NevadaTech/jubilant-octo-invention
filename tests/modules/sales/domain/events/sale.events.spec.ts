import { describe, it, expect } from "vitest";
import {
  SaleConfirmedEvent,
  SaleCancelledEvent,
  SaleCompletedEvent,
} from "@/modules/sales/domain/events/sale.events";

describe("Sale Events", () => {
  describe("SaleConfirmedEvent", () => {
    it("Given: valid data When: creating event Then: should have correct properties", () => {
      // Act
      const event = new SaleConfirmedEvent("sale-1", "SALE-001", 1500.0);

      // Assert
      expect(event.eventName).toBe("SaleConfirmed");
      expect(event.aggregateId).toBe("sale-1");
      expect(event.saleNumber).toBe("SALE-001");
      expect(event.totalAmount).toBe(1500.0);
      expect(event.occurredOn).toBeInstanceOf(Date);
    });
  });

  describe("SaleCancelledEvent", () => {
    it("Given: valid data When: creating event Then: should have correct properties", () => {
      // Act
      const event = new SaleCancelledEvent("sale-2", "SALE-002");

      // Assert
      expect(event.eventName).toBe("SaleCancelled");
      expect(event.aggregateId).toBe("sale-2");
      expect(event.saleNumber).toBe("SALE-002");
      expect(event.occurredOn).toBeInstanceOf(Date);
    });
  });

  describe("SaleCompletedEvent", () => {
    it("Given: valid data When: creating event Then: should have correct properties", () => {
      // Act
      const event = new SaleCompletedEvent("sale-3", "SALE-003");

      // Assert
      expect(event.eventName).toBe("SaleCompleted");
      expect(event.aggregateId).toBe("sale-3");
      expect(event.saleNumber).toBe("SALE-003");
      expect(event.occurredOn).toBeInstanceOf(Date);
    });
  });
});
