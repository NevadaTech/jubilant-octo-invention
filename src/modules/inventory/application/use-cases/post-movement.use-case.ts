import type { UseCase } from "@/shared/application/use-case";
import type { StockMovementRepositoryPort } from "@/modules/inventory/application/ports/stock-movement.repository.port";
import {
  NotFoundError,
  ValidationError,
} from "@/shared/domain/errors/domain-error";
import { eventBus } from "@/shared/infrastructure/events";
import { MovementPostedEvent } from "@/modules/inventory/domain/events/movement.events";

export class PostMovementUseCase implements UseCase<string, void> {
  constructor(
    private readonly movementRepository: StockMovementRepositoryPort,
  ) {}

  async execute(movementId: string): Promise<void> {
    const movement = await this.movementRepository.findById(movementId);
    if (!movement) {
      throw new NotFoundError("StockMovement", movementId);
    }
    if (!movement.canPost) {
      throw new ValidationError(
        `Cannot post movement in ${movement.status} status`,
      );
    }
    await this.movementRepository.post(movementId);
    eventBus.publish(
      new MovementPostedEvent(
        movement.id,
        movement.reference ?? movementId,
        movement.type,
      ),
    );
  }
}
