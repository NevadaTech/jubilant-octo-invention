import type { DomainEvent } from "@/shared/domain/entities/aggregate-root";

export class MovementPostedEvent implements DomainEvent {
  readonly eventName = "MovementPosted";
  readonly occurredOn: Date;
  constructor(
    readonly aggregateId: string,
    readonly movementNumber: string,
    readonly type: string,
  ) {
    this.occurredOn = new Date();
  }
}

export class MovementVoidedEvent implements DomainEvent {
  readonly eventName = "MovementVoided";
  readonly occurredOn: Date;
  constructor(
    readonly aggregateId: string,
    readonly movementNumber: string,
  ) {
    this.occurredOn = new Date();
  }
}
