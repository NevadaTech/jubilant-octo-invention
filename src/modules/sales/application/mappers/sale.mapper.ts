import { Sale, type SaleLineProps } from "../../domain/entities/sale.entity";
import type {
  SaleResponseDto,
  SaleLineResponseDto,
  SaleApiRawDto,
} from "../dto/sale.dto";

export class SaleMapper {
  static lineToDomain(dto: SaleLineResponseDto): SaleLineProps {
    return {
      id: dto.id,
      productId: dto.productId,
      productName: dto.productName,
      productSku: dto.productSku,
      quantity: dto.quantity,
      salePrice: dto.salePrice,
      currency: dto.currency,
      totalPrice: dto.totalPrice,
    };
  }

  /** Convert raw API list item (may lack lines, warehouseName, etc.) */
  static fromApiRaw(raw: SaleApiRawDto): Sale {
    return Sale.create({
      id: raw.id,
      saleNumber: raw.saleNumber,
      status: raw.status,
      warehouseId: raw.warehouseId,
      warehouseName: raw.warehouseName ?? "",
      customerReference:
        typeof raw.customerReference === "string"
          ? raw.customerReference
          : null,
      externalReference:
        typeof raw.externalReference === "string"
          ? raw.externalReference
          : null,
      note: typeof raw.note === "string" ? raw.note : null,
      totalAmount: raw.totalAmount,
      currency: raw.currency,
      lines: (raw.lines ?? []).map(SaleMapper.lineToDomain),
      movementId: typeof raw.movementId === "string" ? raw.movementId : null,
      createdBy: raw.createdBy,
      createdAt: new Date(raw.createdAt),
      confirmedAt:
        typeof raw.confirmedAt === "string" ? new Date(raw.confirmedAt) : null,
      confirmedBy: raw.confirmedBy ?? null,
      confirmedByName: raw.confirmedByName ?? null,
      cancelledAt:
        typeof raw.cancelledAt === "string" ? new Date(raw.cancelledAt) : null,
      cancelledBy: raw.cancelledBy ?? null,
      cancelledByName: raw.cancelledByName ?? null,
    });
  }

  static toDomain(dto: SaleResponseDto): Sale {
    return Sale.create({
      id: dto.id,
      saleNumber: dto.saleNumber,
      status: dto.status,
      warehouseId: dto.warehouseId,
      warehouseName: dto.warehouseName ?? "",
      customerReference:
        typeof dto.customerReference === "string"
          ? dto.customerReference
          : null,
      externalReference:
        typeof dto.externalReference === "string"
          ? dto.externalReference
          : null,
      note: typeof dto.note === "string" ? dto.note : null,
      totalAmount: dto.totalAmount,
      currency: dto.currency,
      lines: (dto.lines ?? []).map(SaleMapper.lineToDomain),
      movementId: typeof dto.movementId === "string" ? dto.movementId : null,
      createdBy: dto.createdBy,
      createdAt: new Date(dto.createdAt),
      confirmedAt:
        typeof dto.confirmedAt === "string" ? new Date(dto.confirmedAt) : null,
      confirmedBy: dto.confirmedBy ?? null,
      confirmedByName: dto.confirmedByName ?? null,
      cancelledAt:
        typeof dto.cancelledAt === "string" ? new Date(dto.cancelledAt) : null,
      cancelledBy: dto.cancelledBy ?? null,
      cancelledByName: dto.cancelledByName ?? null,
    });
  }
}
