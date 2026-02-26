import type { UseCase } from "@/shared/application/use-case";
import type { SaleRepositoryPort } from "@/modules/sales/application/ports/sale.repository.port";
import type { Sale } from "@/modules/sales/domain/entities/sale.entity";
import {
  NotFoundError,
  ValidationError,
} from "@/shared/domain/errors/domain-error";
import { eventBus } from "@/shared/infrastructure/events";
import { SaleConfirmedEvent } from "@/modules/sales/domain/events/sale.events";

export class ConfirmSaleUseCase implements UseCase<string, Sale> {
  constructor(private readonly saleRepository: SaleRepositoryPort) {}

  async execute(saleId: string): Promise<Sale> {
    const sale = await this.saleRepository.findById(saleId);
    if (!sale) {
      throw new NotFoundError("Sale", saleId);
    }
    if (!sale.canConfirm) {
      throw new ValidationError(
        `Cannot confirm sale in ${sale.status} status or with no lines`,
      );
    }
    const confirmed = await this.saleRepository.confirm(saleId);
    eventBus.publish(
      new SaleConfirmedEvent(
        confirmed.id,
        confirmed.saleNumber,
        confirmed.totalAmount,
      ),
    );
    return confirmed;
  }
}
