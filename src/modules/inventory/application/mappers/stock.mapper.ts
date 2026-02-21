import { Stock } from "../../domain/entities/stock.entity";
import type { StockResponseDto, StockApiRawDto } from "../dto/stock.dto";

export class StockMapper {
  static toDomain(
    dto: StockApiRawDto | StockResponseDto,
    index?: number,
  ): Stock {
    const quantity = dto.quantity ?? 0;
    const reservedQuantity = dto.reservedQuantity ?? 0;

    return Stock.create({
      id: dto.id ?? `${dto.productId}:${dto.warehouseId}:${index ?? 0}`,
      productId: dto.productId,
      productName: dto.productName ?? "",
      productSku: dto.productSku ?? "",
      warehouseId: dto.warehouseId,
      warehouseName: dto.warehouseName ?? "",
      quantity,
      reservedQuantity,
      availableQuantity: dto.availableQuantity ?? quantity - reservedQuantity,
      averageCost: ("averageCost" in dto ? dto.averageCost : undefined) ?? 0,
      totalValue: ("totalValue" in dto ? dto.totalValue : undefined) ?? 0,
      currency: ("currency" in dto ? dto.currency : undefined) ?? "USD",
      lastMovementAt:
        typeof dto.lastMovementAt === "string"
          ? new Date(dto.lastMovementAt)
          : null,
    });
  }

  static toDto(entity: Stock): StockResponseDto {
    return {
      id: entity.id,
      productId: entity.productId,
      productName: entity.productName,
      productSku: entity.productSku,
      warehouseId: entity.warehouseId,
      warehouseName: entity.warehouseName,
      quantity: entity.quantity,
      reservedQuantity: entity.reservedQuantity,
      availableQuantity: entity.availableQuantity,
      lastMovementAt: entity.lastMovementAt?.toISOString() ?? null,
    };
  }
}
