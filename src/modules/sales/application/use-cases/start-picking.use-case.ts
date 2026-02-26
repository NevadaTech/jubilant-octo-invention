import type { UseCase } from "@/shared/application/use-case";
import type { SaleRepositoryPort } from "@/modules/sales/application/ports/sale.repository.port";
import type { Sale } from "@/modules/sales/domain/entities/sale.entity";
import {
  NotFoundError,
  ValidationError,
} from "@/shared/domain/errors/domain-error";

export class StartPickingUseCase implements UseCase<string, Sale> {
  constructor(private readonly saleRepository: SaleRepositoryPort) {}

  async execute(saleId: string): Promise<Sale> {
    const sale = await this.saleRepository.findById(saleId);
    if (!sale) {
      throw new NotFoundError("Sale", saleId);
    }
    if (!sale.canStartPicking) {
      throw new ValidationError(
        `Cannot start picking for sale in ${sale.status} status or picking is not enabled`,
      );
    }
    return this.saleRepository.startPicking(saleId);
  }
}
