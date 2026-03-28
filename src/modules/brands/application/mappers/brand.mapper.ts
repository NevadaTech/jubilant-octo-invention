import { Brand } from "@/modules/brands/domain/entities/brand.entity";
import type { BrandResponseDto } from "@/modules/brands/application/dto/brand.dto";

export class BrandMapper {
  static toDomain(dto: BrandResponseDto): Brand {
    return Brand.create({
      id: dto.id,
      name: dto.name,
      description: typeof dto.description === "string" ? dto.description : null,
      isActive: dto.isActive,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
    });
  }

  static toDto(entity: Brand): BrandResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      isActive: entity.isActive,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
