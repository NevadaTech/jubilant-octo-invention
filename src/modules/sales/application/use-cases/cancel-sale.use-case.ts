import type { UseCase } from "@/shared/application/use-case";
import type { SaleRepositoryPort } from "@/modules/sales/application/ports/sale.repository.port";
import type { Sale } from "@/modules/sales/domain/entities/sale.entity";
import {
  NotFoundError,
  ValidationError,
} from "@/shared/domain/errors/domain-error";
import { eventBus } from "@/shared/infrastructure/events";
import { SaleCancelledEvent } from "@/modules/sales/domain/events/sale.events";

export class CancelSaleUseCase implements UseCase<string, Sale> {
  constructor(private readonly saleRepository: SaleRepositoryPort) {}

  async execute(saleId: string): Promise<Sale> {
    const sale = await this.saleRepository.findById(saleId);
    if (!sale) {
      throw new NotFoundError("Sale", saleId);
    }
    if (!sale.canCancel) {
      throw new ValidationError(`Cannot cancel sale in ${sale.status} status`);
    }
    const cancelled = await this.saleRepository.cancel(saleId);
    eventBus.publish(
      new SaleCancelledEvent(cancelled.id, cancelled.saleNumber),
    );
    return cancelled;
  }
}
