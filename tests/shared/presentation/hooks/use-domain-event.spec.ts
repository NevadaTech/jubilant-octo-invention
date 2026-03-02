import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import type { DomainEvent } from "@/shared/domain/entities/aggregate-root";

// ── Mock the eventBus module ───────────────────────────────────────────
const mockSubscribe = vi.fn();

vi.mock("@/shared/infrastructure/events/event-bus", () => ({
  eventBus: {
    subscribe: (...args: unknown[]) => mockSubscribe(...args),
  },
}));

import { useDomainEvent } from "@/shared/presentation/hooks/use-domain-event";

describe("useDomainEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // By default, subscribe returns an unsubscribe function
    mockSubscribe.mockReturnValue(vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Given: an event name and handler When: hook mounts Then: should subscribe to the event bus", () => {
    // Arrange
    const handler = vi.fn();

    // Act
    renderHook(() => useDomainEvent("ProductCreated", handler));

    // Assert
    expect(mockSubscribe).toHaveBeenCalledTimes(1);
    expect(mockSubscribe).toHaveBeenCalledWith(
      "ProductCreated",
      expect.any(Function),
    );
  });

  it("Given: a mounted hook When: unmounting Then: should call the unsubscribe function", () => {
    // Arrange
    const unsubscribe = vi.fn();
    mockSubscribe.mockReturnValue(unsubscribe);
    const handler = vi.fn();

    // Act
    const { unmount } = renderHook(() =>
      useDomainEvent("ProductCreated", handler),
    );
    unmount();

    // Assert
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("Given: a subscription When: event bus invokes the handler Then: should call the user handler with the event", () => {
    // Arrange
    let capturedHandler: ((event: DomainEvent) => void) | undefined;
    mockSubscribe.mockImplementation(
      (_name: string, handler: (event: DomainEvent) => void) => {
        capturedHandler = handler;
        return vi.fn();
      },
    );

    const userHandler = vi.fn();
    renderHook(() => useDomainEvent("StockUpdated", userHandler));

    const testEvent: DomainEvent = {
      eventName: "StockUpdated",
      occurredOn: new Date(),
      aggregateId: "stock-1",
    };

    // Act
    capturedHandler!(testEvent);

    // Assert
    expect(userHandler).toHaveBeenCalledTimes(1);
    expect(userHandler).toHaveBeenCalledWith(testEvent);
  });

  it("Given: a handler that changes between renders When: event fires Then: should use the latest handler via ref", () => {
    // Arrange
    let capturedHandler: ((event: DomainEvent) => void) | undefined;
    mockSubscribe.mockImplementation(
      (_name: string, handler: (event: DomainEvent) => void) => {
        capturedHandler = handler;
        return vi.fn();
      },
    );

    const handler1 = vi.fn();
    const handler2 = vi.fn();

    const { rerender } = renderHook(
      ({ handler }) => useDomainEvent("OrderPlaced", handler),
      { initialProps: { handler: handler1 } },
    );

    // Rerender with a new handler
    rerender({ handler: handler2 });

    const testEvent: DomainEvent = {
      eventName: "OrderPlaced",
      occurredOn: new Date(),
      aggregateId: "order-1",
    };

    // Act
    capturedHandler!(testEvent);

    // Assert - should call the latest handler, not the original
    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledWith(testEvent);
  });

  it("Given: a hook with eventName When: eventName changes Then: should re-subscribe with new event name", () => {
    // Arrange
    const unsubscribe1 = vi.fn();
    const unsubscribe2 = vi.fn();
    mockSubscribe
      .mockReturnValueOnce(unsubscribe1)
      .mockReturnValueOnce(unsubscribe2);

    const handler = vi.fn();

    const { rerender } = renderHook(
      ({ eventName }) => useDomainEvent(eventName, handler),
      { initialProps: { eventName: "EventA" } },
    );

    // Act
    rerender({ eventName: "EventB" });

    // Assert - should unsubscribe from EventA and subscribe to EventB
    expect(unsubscribe1).toHaveBeenCalledTimes(1);
    expect(mockSubscribe).toHaveBeenCalledTimes(2);
    expect(mockSubscribe).toHaveBeenLastCalledWith(
      "EventB",
      expect.any(Function),
    );
  });
});
