import { Category } from "@/modules/inventory/domain/entities/category.entity";
import type { CategoryResponseDto } from "@/modules/inventory/application/dto/category.dto";

export class CategoryMapper {
  static toDomain(dto: CategoryResponseDto): Category {
    return Category.create({
      id: dto.id,
      name: dto.name,
      description: typeof dto.description === "string" ? dto.description : null,
      parentId: typeof dto.parentId === "string" ? dto.parentId : null,
      parentName: typeof dto.parentName === "string" ? dto.parentName : null,
      isActive: dto.isActive,
      productCount: dto.productCount,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
    });
  }

  static toDto(entity: Category): CategoryResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      parentId: entity.parentId,
      parentName: entity.parentName,
      isActive: entity.isActive,
      productCount: entity.productCount,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
