import type { UseCase } from "@/shared/application/use-case";
import type { ReturnRepositoryPort } from "@/modules/returns/application/ports/return.repository.port";
import type { Return } from "@/modules/returns/domain/entities/return.entity";
import {
  NotFoundError,
  ValidationError,
} from "@/shared/domain/errors/domain-error";
import { eventBus } from "@/shared/infrastructure/events";
import { ReturnConfirmedEvent } from "@/modules/returns/domain/events/return.events";

export class ConfirmReturnUseCase implements UseCase<string, Return> {
  constructor(private readonly returnRepository: ReturnRepositoryPort) {}

  async execute(returnId: string): Promise<Return> {
    const returnEntity = await this.returnRepository.findById(returnId);
    if (!returnEntity) {
      throw new NotFoundError("Return", returnId);
    }
    if (!returnEntity.canConfirm) {
      throw new ValidationError(
        `Cannot confirm return in ${returnEntity.status} status or with no lines`,
      );
    }
    const confirmed = await this.returnRepository.confirm(returnId);
    eventBus.publish(
      new ReturnConfirmedEvent(
        confirmed.id,
        confirmed.returnNumber,
        confirmed.type,
      ),
    );
    return confirmed;
  }
}
