import {
  Transfer,
  type TransferLine,
} from "../../domain/entities/transfer.entity";
import type {
  TransferResponseDto,
  TransferLineResponseDto,
  TransferApiRawDto,
} from "../dto/transfer.dto";

export class TransferMapper {
  static lineToDomain(dto: TransferLineResponseDto): TransferLine {
    return {
      id: dto.id,
      productId: dto.productId,
      productName: dto.productName,
      productSku: dto.productSku,
      quantity: dto.quantity,
      receivedQuantity: dto.receivedQuantity ?? null,
    };
  }

  /** Convert the raw API list item to domain entity */
  static fromApiRaw(raw: TransferApiRawDto): Transfer {
    return Transfer.create({
      id: raw.id,
      fromWarehouseId: raw.fromWarehouseId,
      fromWarehouseName: raw.fromWarehouseName ?? "",
      toWarehouseId: raw.toWarehouseId,
      toWarehouseName: raw.toWarehouseName ?? "",
      status: raw.status,
      notes: typeof raw.note === "string" ? raw.note : null,
      lines: (raw.lines ?? []).map(TransferMapper.lineToDomain),
      linesCount: raw.linesCount ?? raw.lines?.length ?? 0,
      createdBy: raw.createdBy,
      receivedBy: raw.receivedBy ?? null,
      createdAt: new Date(raw.createdAt),
      completedAt:
        typeof raw.completedAt === "string" ? new Date(raw.completedAt) : null,
    });
  }

  static toDomain(dto: TransferResponseDto): Transfer {
    const completedAt = dto.receivedAt ? new Date(dto.receivedAt) : null;

    return Transfer.create({
      id: dto.id,
      fromWarehouseId: dto.fromWarehouseId,
      fromWarehouseName: dto.fromWarehouseName ?? "",
      toWarehouseId: dto.toWarehouseId,
      toWarehouseName: dto.toWarehouseName ?? "",
      status: dto.status,
      notes: typeof dto.note === "string" ? dto.note : null,
      lines: (dto.lines ?? []).map(TransferMapper.lineToDomain),
      linesCount: dto.linesCount ?? dto.lines?.length ?? 0,
      createdBy: dto.createdBy,
      receivedBy: dto.receivedBy ?? null,
      createdAt: new Date(dto.createdAt),
      completedAt,
    });
  }

  static lineToDto(line: TransferLine): TransferLineResponseDto {
    return {
      id: line.id,
      productId: line.productId,
      productName: line.productName,
      productSku: line.productSku,
      quantity: line.quantity,
      receivedQuantity: line.receivedQuantity,
    };
  }

  static toDto(entity: Transfer): TransferResponseDto {
    return {
      id: entity.id,
      fromWarehouseId: entity.fromWarehouseId,
      fromWarehouseName: entity.fromWarehouseName,
      toWarehouseId: entity.toWarehouseId,
      toWarehouseName: entity.toWarehouseName,
      status: entity.status,
      note: entity.notes,
      lines: entity.lines.map(TransferMapper.lineToDto),
      linesCount: entity.linesCount,
      createdBy: entity.createdBy,
      orgId: "",
      receivedAt: entity.completedAt?.toISOString() ?? null,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.createdAt.toISOString(),
    };
  }
}
