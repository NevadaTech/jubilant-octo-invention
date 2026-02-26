import type { UseCase } from "@/shared/application/use-case";
import type { SaleRepositoryPort } from "@/modules/sales/application/ports/sale.repository.port";
import type { Sale } from "@/modules/sales/domain/entities/sale.entity";
import type { ShipSaleDto } from "@/modules/sales/application/dto/sale.dto";
import {
  NotFoundError,
  ValidationError,
} from "@/shared/domain/errors/domain-error";

export interface ShipSaleInput {
  saleId: string;
  data: ShipSaleDto;
}

export class ShipSaleUseCase implements UseCase<ShipSaleInput, Sale> {
  constructor(private readonly saleRepository: SaleRepositoryPort) {}

  async execute(input: ShipSaleInput): Promise<Sale> {
    const sale = await this.saleRepository.findById(input.saleId);
    if (!sale) {
      throw new NotFoundError("Sale", input.saleId);
    }
    if (!sale.canShip) {
      throw new ValidationError(
        `Cannot ship sale in ${sale.status} status or picking is not enabled`,
      );
    }
    return this.saleRepository.ship(input.saleId, input.data);
  }
}
