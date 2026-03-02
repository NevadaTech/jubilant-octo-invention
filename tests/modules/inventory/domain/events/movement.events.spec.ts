import { describe, it, expect } from "vitest";
import {
  MovementPostedEvent,
  MovementVoidedEvent,
} from "@/modules/inventory/domain/events/movement.events";

describe("Movement Events", () => {
  describe("MovementPostedEvent", () => {
    it("Given: valid data When: creating event Then: should have correct properties", () => {
      // Act
      const event = new MovementPostedEvent("mov-1", "MOV-2025-001", "IN");

      // Assert
      expect(event.eventName).toBe("MovementPosted");
      expect(event.aggregateId).toBe("mov-1");
      expect(event.movementNumber).toBe("MOV-2025-001");
      expect(event.type).toBe("IN");
      expect(event.occurredOn).toBeInstanceOf(Date);
    });
  });

  describe("MovementVoidedEvent", () => {
    it("Given: valid data When: creating event Then: should have correct properties", () => {
      // Act
      const event = new MovementVoidedEvent("mov-2", "MOV-2025-002");

      // Assert
      expect(event.eventName).toBe("MovementVoided");
      expect(event.aggregateId).toBe("mov-2");
      expect(event.movementNumber).toBe("MOV-2025-002");
      expect(event.occurredOn).toBeInstanceOf(Date);
    });
  });
});
