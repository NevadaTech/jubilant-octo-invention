import {
  Return,
  type ReturnLineProps,
} from "../../domain/entities/return.entity";
import type {
  ReturnResponseDto,
  ReturnLineResponseDto,
  ReturnApiRawDto,
  ReturnLineApiRawDto,
} from "../dto/return.dto";

export class ReturnMapper {
  static lineToDomain(dto: ReturnLineResponseDto): ReturnLineProps {
    return {
      id: dto.id,
      productId: dto.productId,
      productName: dto.productName,
      productSku: dto.productSku,
      quantity: dto.quantity,
      originalSalePrice: dto.originalSalePrice,
      originalUnitCost: dto.originalUnitCost,
      currency: dto.currency,
      totalPrice: dto.totalPrice,
    };
  }

  static lineFromApiRaw(dto: ReturnLineApiRawDto): ReturnLineProps {
    return {
      id: dto.id,
      productId: dto.productId,
      productName: dto.productName ?? "",
      productSku: dto.productSku ?? "",
      quantity: dto.quantity,
      originalSalePrice: dto.originalSalePrice ?? null,
      originalUnitCost: dto.originalUnitCost ?? null,
      currency: dto.currency,
      totalPrice: dto.totalPrice,
    };
  }

  /** Convert raw API item to domain entity */
  static fromApiRaw(raw: ReturnApiRawDto): Return {
    return Return.create({
      id: raw.id,
      returnNumber: raw.returnNumber,
      status: raw.status,
      type: raw.type,
      reason: typeof raw.reason === "string" ? raw.reason : null,
      warehouseId: raw.warehouseId,
      warehouseName: raw.warehouseName ?? "",
      saleId: typeof raw.saleId === "string" ? raw.saleId : null,
      saleNumber: typeof raw.saleNumber === "string" ? raw.saleNumber : null,
      sourceMovementId:
        typeof raw.sourceMovementId === "string" ? raw.sourceMovementId : null,
      returnMovementId:
        typeof raw.returnMovementId === "string" ? raw.returnMovementId : null,
      note: typeof raw.note === "string" ? raw.note : null,
      totalAmount: raw.totalAmount,
      currency: raw.currency,
      lines: (raw.lines ?? []).map(ReturnMapper.lineFromApiRaw),
      createdBy: raw.createdBy,
      createdAt: new Date(raw.createdAt),
      confirmedAt:
        typeof raw.confirmedAt === "string" ? new Date(raw.confirmedAt) : null,
      cancelledAt:
        typeof raw.cancelledAt === "string" ? new Date(raw.cancelledAt) : null,
    });
  }

  static toDomain(dto: ReturnResponseDto): Return {
    return Return.create({
      id: dto.id,
      returnNumber: dto.returnNumber,
      status: dto.status,
      type: dto.type,
      reason: typeof dto.reason === "string" ? dto.reason : null,
      warehouseId: dto.warehouseId,
      warehouseName: dto.warehouseName ?? "",
      saleId: typeof dto.saleId === "string" ? dto.saleId : null,
      saleNumber: typeof dto.saleNumber === "string" ? dto.saleNumber : null,
      sourceMovementId:
        typeof dto.sourceMovementId === "string" ? dto.sourceMovementId : null,
      returnMovementId:
        typeof dto.returnMovementId === "string" ? dto.returnMovementId : null,
      note: typeof dto.note === "string" ? dto.note : null,
      totalAmount: dto.totalAmount,
      currency: dto.currency,
      lines: (dto.lines ?? []).map(ReturnMapper.lineToDomain),
      createdBy: dto.createdBy,
      createdAt: new Date(dto.createdAt),
      confirmedAt:
        typeof dto.confirmedAt === "string" ? new Date(dto.confirmedAt) : null,
      cancelledAt:
        typeof dto.cancelledAt === "string" ? new Date(dto.cancelledAt) : null,
    });
  }
}
