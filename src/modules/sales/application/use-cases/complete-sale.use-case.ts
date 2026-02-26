import type { UseCase } from "@/shared/application/use-case";
import type { SaleRepositoryPort } from "@/modules/sales/application/ports/sale.repository.port";
import type { Sale } from "@/modules/sales/domain/entities/sale.entity";
import {
  NotFoundError,
  ValidationError,
} from "@/shared/domain/errors/domain-error";
import { eventBus } from "@/shared/infrastructure/events";
import { SaleCompletedEvent } from "@/modules/sales/domain/events/sale.events";

export class CompleteSaleUseCase implements UseCase<string, Sale> {
  constructor(private readonly saleRepository: SaleRepositoryPort) {}

  async execute(saleId: string): Promise<Sale> {
    const sale = await this.saleRepository.findById(saleId);
    if (!sale) {
      throw new NotFoundError("Sale", saleId);
    }
    if (!sale.canComplete) {
      throw new ValidationError(
        `Cannot complete sale in ${sale.status} status or picking is not enabled`,
      );
    }
    const completed = await this.saleRepository.complete(saleId);
    eventBus.publish(
      new SaleCompletedEvent(completed.id, completed.saleNumber),
    );
    return completed;
  }
}
