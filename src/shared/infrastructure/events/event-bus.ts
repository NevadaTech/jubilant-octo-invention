import type { DomainEvent } from "@/shared/domain/entities/aggregate-root";

type EventHandler = (event: DomainEvent) => void;

class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();

  subscribe(eventName: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set());
    }
    this.handlers.get(eventName)!.add(handler);
    // Return unsubscribe function
    return () => {
      this.handlers.get(eventName)?.delete(handler);
    };
  }

  publish(event: DomainEvent): void {
    const handlers = this.handlers.get(event.eventName);
    if (handlers) {
      handlers.forEach((handler) => handler(event));
    }
  }

  publishAll(events: ReadonlyArray<DomainEvent>): void {
    events.forEach((event) => this.publish(event));
  }

  clear(): void {
    this.handlers.clear();
  }
}

export const eventBus = new EventBus();
