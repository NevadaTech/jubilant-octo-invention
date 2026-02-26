import type { UseCase } from "@/shared/application/use-case";
import type { StockMovementRepositoryPort } from "@/modules/inventory/application/ports/stock-movement.repository.port";
import {
  NotFoundError,
  ValidationError,
} from "@/shared/domain/errors/domain-error";
import { eventBus } from "@/shared/infrastructure/events";
import { MovementVoidedEvent } from "@/modules/inventory/domain/events/movement.events";

export class VoidMovementUseCase implements UseCase<string, void> {
  constructor(
    private readonly movementRepository: StockMovementRepositoryPort,
  ) {}

  async execute(movementId: string): Promise<void> {
    const movement = await this.movementRepository.findById(movementId);
    if (!movement) {
      throw new NotFoundError("StockMovement", movementId);
    }
    if (!movement.canVoid) {
      throw new ValidationError(
        `Cannot void movement in ${movement.status} status`,
      );
    }
    await this.movementRepository.void(movementId);
    eventBus.publish(
      new MovementVoidedEvent(movement.id, movement.reference ?? movementId),
    );
  }
}
