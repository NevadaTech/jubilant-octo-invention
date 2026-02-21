import { Warehouse } from "../../domain/entities/warehouse.entity";
import type { WarehouseResponseDto } from "../dto/warehouse.dto";

export class WarehouseMapper {
  static toDomain(dto: WarehouseResponseDto): Warehouse {
    return Warehouse.create({
      id: dto.id,
      code: dto.code,
      name: dto.name,
      address: typeof dto.address === "string" ? dto.address : null,
      isActive: dto.isActive,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
      statusChangedBy: dto.statusChangedBy ?? null,
      statusChangedAt: dto.statusChangedAt ?? null,
    });
  }

  static toDto(entity: Warehouse): WarehouseResponseDto {
    return {
      id: entity.id,
      code: entity.code,
      name: entity.name,
      address: entity.address,
      isActive: entity.isActive,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      statusChangedBy: entity.statusChangedBy ?? null,
      statusChangedAt: entity.statusChangedAt ?? null,
    };
  }
}
