import {
  StockMovement,
  type MovementLine,
} from "../../domain/entities/stock-movement.entity";
import type {
  StockMovementResponseDto,
  MovementLineResponseDto,
} from "../dto/stock-movement.dto";

export class StockMovementMapper {
  static lineToDomain(
    dto: MovementLineResponseDto & { name?: string; sku?: string },
  ): MovementLine {
    return {
      id: dto.id,
      productId: dto.productId,
      productName: dto.productName ?? (dto as { name?: string }).name ?? "",
      productSku: dto.productSku ?? (dto as { sku?: string }).sku ?? "",
      quantity: dto.quantity,
      unitCost: dto.unitCost,
      currency: dto.currency ?? null,
    };
  }

  static toDomain(dto: StockMovementResponseDto): StockMovement {
    return StockMovement.create({
      id: dto.id,
      warehouseId: dto.warehouseId,
      warehouseName: dto.warehouseName ?? "",
      warehouseCode: dto.warehouseCode ?? null,
      type: dto.type,
      status: dto.status,
      reference: typeof dto.reference === "string" ? dto.reference : null,
      reason: typeof dto.reason === "string" ? dto.reason : null,
      note: typeof dto.note === "string" ? dto.note : null,
      lines: (dto.lines ?? []).map(StockMovementMapper.lineToDomain),
      createdBy: dto.createdBy,
      createdByName: dto.createdByName ?? null,
      createdAt: new Date(dto.createdAt),
      postedAt:
        typeof dto.postedAt === "string" ? new Date(dto.postedAt) : null,
      postedBy: dto.postedBy ?? null,
      postedByName: dto.postedByName ?? null,
      returnedAt:
        typeof dto.returnedAt === "string" ? new Date(dto.returnedAt) : null,
      returnedBy: dto.returnedBy ?? null,
      returnedByName: dto.returnedByName ?? null,
    });
  }

  static lineToDto(line: MovementLine): MovementLineResponseDto {
    return {
      id: line.id,
      productId: line.productId,
      productName: line.productName,
      productSku: line.productSku,
      quantity: line.quantity,
      unitCost: line.unitCost,
    };
  }

  static toDto(entity: StockMovement): StockMovementResponseDto {
    return {
      id: entity.id,
      warehouseId: entity.warehouseId,
      warehouseName: entity.warehouseName,
      type: entity.type,
      status: entity.status,
      reference: entity.reference,
      reason: entity.reason,
      note: entity.note,
      lines: entity.lines.map(StockMovementMapper.lineToDto),
      createdBy: entity.createdBy,
      createdAt: entity.createdAt.toISOString(),
      postedAt: entity.postedAt?.toISOString() || null,
    };
  }
}
