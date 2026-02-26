import type { DomainEvent } from "@/shared/domain/entities/aggregate-root";

export class ReturnConfirmedEvent implements DomainEvent {
  readonly eventName = "ReturnConfirmed";
  readonly occurredOn: Date;
  constructor(
    readonly aggregateId: string,
    readonly returnNumber: string,
    readonly type: string,
  ) {
    this.occurredOn = new Date();
  }
}

export class ReturnCancelledEvent implements DomainEvent {
  readonly eventName = "ReturnCancelled";
  readonly occurredOn: Date;
  constructor(
    readonly aggregateId: string,
    readonly returnNumber: string,
  ) {
    this.occurredOn = new Date();
  }
}
