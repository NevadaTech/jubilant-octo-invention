import { describe, it, expect, beforeEach, vi } from "vitest";
import { eventBus } from "@/shared/infrastructure/events/event-bus";
import type { DomainEvent } from "@/shared/domain/entities/aggregate-root";

describe("EventBus", () => {
  const createEvent = (
    eventName: string,
    aggregateId: string = "agg-1",
  ): DomainEvent => ({
    eventName,
    occurredOn: new Date(),
    aggregateId,
  });

  beforeEach(() => {
    eventBus.clear();
  });

  describe("subscribe + publish", () => {
    it("Given: a subscribed handler When: publishing matching event Then: should call the handler", () => {
      // Arrange
      const handler = vi.fn();
      eventBus.subscribe("OrderCreated", handler);
      const event = createEvent("OrderCreated");

      // Act
      eventBus.publish(event);

      // Assert
      expect(handler).toHaveBeenCalledOnce();
    });

    it("Given: multiple handlers for same event When: publishing Then: should call all handlers", () => {
      // Arrange
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();
      eventBus.subscribe("OrderCreated", handler1);
      eventBus.subscribe("OrderCreated", handler2);
      eventBus.subscribe("OrderCreated", handler3);
      const event = createEvent("OrderCreated");

      // Act
      eventBus.publish(event);

      // Assert
      expect(handler1).toHaveBeenCalledOnce();
      expect(handler2).toHaveBeenCalledOnce();
      expect(handler3).toHaveBeenCalledOnce();
    });

    it("Given: a handler When: publishing event Then: handler should receive the full event object", () => {
      // Arrange
      const handler = vi.fn();
      eventBus.subscribe("StockUpdated", handler);
      const event = createEvent("StockUpdated", "stock-42");

      // Act
      eventBus.publish(event);

      // Assert
      expect(handler).toHaveBeenCalledWith(event);
      expect(handler.mock.calls[0][0].eventName).toBe("StockUpdated");
      expect(handler.mock.calls[0][0].aggregateId).toBe("stock-42");
      expect(handler.mock.calls[0][0].occurredOn).toBeInstanceOf(Date);
    });
  });

  describe("unsubscribe", () => {
    it("Given: a subscribed handler When: unsubscribing and publishing Then: should not call the handler", () => {
      // Arrange
      const handler = vi.fn();
      const unsubscribe = eventBus.subscribe("OrderCreated", handler);

      // Act
      unsubscribe();
      eventBus.publish(createEvent("OrderCreated"));

      // Assert
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("publish with no handlers", () => {
    it("Given: no handlers registered When: publishing an event Then: should not throw", () => {
      // Arrange
      const event = createEvent("UnknownEvent");

      // Act & Assert
      expect(() => eventBus.publish(event)).not.toThrow();
    });
  });

  describe("publishAll", () => {
    it("Given: a subscribed handler When: publishing multiple events via publishAll Then: should call handler for each matching event", () => {
      // Arrange
      const handler = vi.fn();
      eventBus.subscribe("BatchEvent", handler);
      const events = [
        createEvent("BatchEvent", "agg-1"),
        createEvent("BatchEvent", "agg-2"),
        createEvent("BatchEvent", "agg-3"),
      ];

      // Act
      eventBus.publishAll(events);

      // Assert
      expect(handler).toHaveBeenCalledTimes(3);
    });
  });

  describe("clear", () => {
    it("Given: registered handlers When: clearing and publishing Then: no handlers should be called", () => {
      // Arrange
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      eventBus.subscribe("EventA", handler1);
      eventBus.subscribe("EventB", handler2);

      // Act
      eventBus.clear();
      eventBus.publish(createEvent("EventA"));
      eventBus.publish(createEvent("EventB"));

      // Assert
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe("event routing", () => {
    it("Given: handlers for different events When: publishing one event Then: should only call the matching handler", () => {
      // Arrange
      const orderHandler = vi.fn();
      const stockHandler = vi.fn();
      eventBus.subscribe("OrderCreated", orderHandler);
      eventBus.subscribe("StockUpdated", stockHandler);

      // Act
      eventBus.publish(createEvent("OrderCreated"));

      // Assert
      expect(orderHandler).toHaveBeenCalledOnce();
      expect(stockHandler).not.toHaveBeenCalled();
    });
  });
});
