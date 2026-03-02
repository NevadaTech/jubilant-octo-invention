import { describe, it, expect } from "vitest";
import {
  ReturnConfirmedEvent,
  ReturnCancelledEvent,
} from "@/modules/returns/domain/events/return.events";

describe("Return Events", () => {
  describe("ReturnConfirmedEvent", () => {
    it("Given: valid data When: creating event Then: should have correct properties", () => {
      // Act
      const event = new ReturnConfirmedEvent(
        "ret-1",
        "RET-001",
        "RETURN_CUSTOMER",
      );

      // Assert
      expect(event.eventName).toBe("ReturnConfirmed");
      expect(event.aggregateId).toBe("ret-1");
      expect(event.returnNumber).toBe("RET-001");
      expect(event.type).toBe("RETURN_CUSTOMER");
      expect(event.occurredOn).toBeInstanceOf(Date);
    });
  });

  describe("ReturnCancelledEvent", () => {
    it("Given: valid data When: creating event Then: should have correct properties", () => {
      // Act
      const event = new ReturnCancelledEvent("ret-2", "RET-002");

      // Assert
      expect(event.eventName).toBe("ReturnCancelled");
      expect(event.aggregateId).toBe("ret-2");
      expect(event.returnNumber).toBe("RET-002");
      expect(event.occurredOn).toBeInstanceOf(Date);
    });
  });
});
