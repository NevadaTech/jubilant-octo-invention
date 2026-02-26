import type { DomainEvent } from "@/shared/domain/entities/aggregate-root";

export class SaleConfirmedEvent implements DomainEvent {
  readonly eventName = "SaleConfirmed";
  readonly occurredOn: Date;
  constructor(
    readonly aggregateId: string,
    readonly saleNumber: string,
    readonly totalAmount: number,
  ) {
    this.occurredOn = new Date();
  }
}

export class SaleCancelledEvent implements DomainEvent {
  readonly eventName = "SaleCancelled";
  readonly occurredOn: Date;
  constructor(
    readonly aggregateId: string,
    readonly saleNumber: string,
  ) {
    this.occurredOn = new Date();
  }
}

export class SaleCompletedEvent implements DomainEvent {
  readonly eventName = "SaleCompleted";
  readonly occurredOn: Date;
  constructor(
    readonly aggregateId: string,
    readonly saleNumber: string,
  ) {
    this.occurredOn = new Date();
  }
}
