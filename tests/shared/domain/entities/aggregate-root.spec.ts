import { describe, it, expect } from "vitest";
import {
  AggregateRoot,
  type DomainEvent,
} from "@/shared/domain/entities/aggregate-root";

class TestAggregate extends AggregateRoot<string> {
  constructor(id: string) {
    super(id);
  }

  triggerEvent(event: DomainEvent): void {
    this.addDomainEvent(event);
  }
}

describe("AggregateRoot", () => {
  const createEvent = (name: string, aggregateId: string): DomainEvent => ({
    eventName: name,
    occurredOn: new Date(),
    aggregateId,
  });

  describe("domainEvents", () => {
    it("Given: a new aggregate When: checking domain events Then: should return empty array", () => {
      // Arrange & Act
      const aggregate = new TestAggregate("agg-1");

      // Assert
      expect(aggregate.domainEvents).toEqual([]);
    });

    it("Given: aggregate with added event When: getting domain events Then: should return the event", () => {
      // Arrange
      const aggregate = new TestAggregate("agg-1");
      const event = createEvent("TestEvent", "agg-1");

      // Act
      aggregate.triggerEvent(event);

      // Assert
      expect(aggregate.domainEvents).toHaveLength(1);
      expect(aggregate.domainEvents[0].eventName).toBe("TestEvent");
      expect(aggregate.domainEvents[0].aggregateId).toBe("agg-1");
    });

    it("Given: aggregate with multiple events When: getting domain events Then: should return all events in order", () => {
      // Arrange
      const aggregate = new TestAggregate("agg-1");
      const event1 = createEvent("Event1", "agg-1");
      const event2 = createEvent("Event2", "agg-1");

      // Act
      aggregate.triggerEvent(event1);
      aggregate.triggerEvent(event2);

      // Assert
      expect(aggregate.domainEvents).toHaveLength(2);
      expect(aggregate.domainEvents[0].eventName).toBe("Event1");
      expect(aggregate.domainEvents[1].eventName).toBe("Event2");
    });

    it("Given: aggregate When: getting domain events Then: should return a copy (immutable)", () => {
      // Arrange
      const aggregate = new TestAggregate("agg-1");
      aggregate.triggerEvent(createEvent("Event1", "agg-1"));

      // Act
      const events = aggregate.domainEvents;
      (events as DomainEvent[]).push(createEvent("Injected", "agg-1"));

      // Assert
      expect(aggregate.domainEvents).toHaveLength(1);
    });
  });

  describe("clearDomainEvents", () => {
    it("Given: aggregate with events When: clearing events Then: should have empty events", () => {
      // Arrange
      const aggregate = new TestAggregate("agg-1");
      aggregate.triggerEvent(createEvent("Event1", "agg-1"));
      aggregate.triggerEvent(createEvent("Event2", "agg-1"));

      // Act
      aggregate.clearDomainEvents();

      // Assert
      expect(aggregate.domainEvents).toEqual([]);
    });
  });

  describe("inheritance", () => {
    it("Given: aggregate root When: checking identity Then: should behave like Entity", () => {
      // Arrange
      const agg1 = new TestAggregate("agg-1");
      const agg2 = new TestAggregate("agg-1");

      // Act
      const result = agg1.equals(agg2);

      // Assert
      expect(result).toBe(true);
      expect(agg1.id).toBe("agg-1");
    });
  });
});
