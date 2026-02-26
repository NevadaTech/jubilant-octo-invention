import type { UseCase } from "@/shared/application/use-case";
import type { ReturnRepositoryPort } from "@/modules/returns/application/ports/return.repository.port";
import type { Return } from "@/modules/returns/domain/entities/return.entity";
import {
  NotFoundError,
  ValidationError,
} from "@/shared/domain/errors/domain-error";
import { eventBus } from "@/shared/infrastructure/events";
import { ReturnCancelledEvent } from "@/modules/returns/domain/events/return.events";

export class CancelReturnUseCase implements UseCase<string, Return> {
  constructor(private readonly returnRepository: ReturnRepositoryPort) {}

  async execute(returnId: string): Promise<Return> {
    const returnEntity = await this.returnRepository.findById(returnId);
    if (!returnEntity) {
      throw new NotFoundError("Return", returnId);
    }
    if (!returnEntity.canCancel) {
      throw new ValidationError(
        `Cannot cancel return in ${returnEntity.status} status`,
      );
    }
    const cancelled = await this.returnRepository.cancel(returnId);
    eventBus.publish(
      new ReturnCancelledEvent(cancelled.id, cancelled.returnNumber),
    );
    return cancelled;
  }
}
