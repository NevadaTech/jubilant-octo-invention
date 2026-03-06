import { Sale, SaleLine } from "@/modules/sales/domain/entities/sale.entity";
import type {
  SaleResponseDto,
  SaleLineResponseDto,
  SaleApiRawDto,
} from "@/modules/sales/application/dto/sale.dto";

export class SaleMapper {
  static lineToDomain(dto: SaleLineResponseDto): SaleLine {
    return SaleLine.create({
      id: dto.id,
      productId: dto.productId,
      productName: dto.productName,
      productSku: dto.productSku,
      productBarcode: dto.productBarcode ?? null,
      quantity: dto.quantity,
      salePrice: dto.salePrice,
      currency: dto.currency,
      totalPrice: dto.totalPrice,
    });
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
      createdByName: raw.createdByName ?? null,
      createdAt: new Date(raw.createdAt),
      confirmedAt:
        typeof raw.confirmedAt === "string" ? new Date(raw.confirmedAt) : null,
      confirmedBy: raw.confirmedBy ?? null,
      confirmedByName: raw.confirmedByName ?? null,
      cancelledAt:
        typeof raw.cancelledAt === "string" ? new Date(raw.cancelledAt) : null,
      cancelledBy: raw.cancelledBy ?? null,
      cancelledByName: raw.cancelledByName ?? null,
      pickedAt:
        typeof raw.pickedAt === "string" ? new Date(raw.pickedAt) : null,
      pickedBy: raw.pickedBy ?? null,
      pickedByName: raw.pickedByName ?? null,
      shippedAt:
        typeof raw.shippedAt === "string" ? new Date(raw.shippedAt) : null,
      shippedBy: raw.shippedBy ?? null,
      shippedByName: raw.shippedByName ?? null,
      trackingNumber: raw.trackingNumber ?? null,
      shippingCarrier: raw.shippingCarrier ?? null,
      shippingNotes: raw.shippingNotes ?? null,
      completedAt:
        typeof raw.completedAt === "string" ? new Date(raw.completedAt) : null,
      completedBy: raw.completedBy ?? null,
      completedByName: raw.completedByName ?? null,
      returnedAt:
        typeof raw.returnedAt === "string" ? new Date(raw.returnedAt) : null,
      returnedBy: raw.returnedBy ?? null,
      returnedByName: raw.returnedByName ?? null,
      pickingEnabled: raw.pickingEnabled ?? false,
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
      createdByName: dto.createdByName ?? null,
      createdAt: new Date(dto.createdAt),
      confirmedAt:
        typeof dto.confirmedAt === "string" ? new Date(dto.confirmedAt) : null,
      confirmedBy: dto.confirmedBy ?? null,
      confirmedByName: dto.confirmedByName ?? null,
      cancelledAt:
        typeof dto.cancelledAt === "string" ? new Date(dto.cancelledAt) : null,
      cancelledBy: dto.cancelledBy ?? null,
      cancelledByName: dto.cancelledByName ?? null,
      pickedAt:
        typeof dto.pickedAt === "string" ? new Date(dto.pickedAt) : null,
      pickedBy: dto.pickedBy ?? null,
      pickedByName: dto.pickedByName ?? null,
      shippedAt:
        typeof dto.shippedAt === "string" ? new Date(dto.shippedAt) : null,
      shippedBy: dto.shippedBy ?? null,
      shippedByName: dto.shippedByName ?? null,
      trackingNumber: dto.trackingNumber ?? null,
      shippingCarrier: dto.shippingCarrier ?? null,
      shippingNotes: dto.shippingNotes ?? null,
      completedAt:
        typeof dto.completedAt === "string" ? new Date(dto.completedAt) : null,
      completedBy: dto.completedBy ?? null,
      completedByName: dto.completedByName ?? null,
      returnedAt:
        typeof dto.returnedAt === "string" ? new Date(dto.returnedAt) : null,
      returnedBy: dto.returnedBy ?? null,
      returnedByName: dto.returnedByName ?? null,
      pickingEnabled: dto.pickingEnabled ?? false,
    });
  }
}
