import { Product } from "../../domain/entities/product.entity";
import type { ProductResponseDto } from "../dto/product.dto";

export class ProductMapper {
  static toDomain(dto: ProductResponseDto): Product {
    return Product.create({
      id: dto.id,
      sku: dto.sku,
      name: dto.name,
      description: typeof dto.description === "string" ? dto.description : null,
      categoryId: typeof dto.categoryId === "string" ? dto.categoryId : null,
      categoryName: typeof dto.categoryName === "string" ? dto.categoryName : null,
      unitOfMeasure: dto.unitOfMeasure,
      cost: dto.cost,
      price: dto.price,
      minStock: dto.minStock ?? 0,
      maxStock: dto.maxStock ?? 0,
      isActive: dto.isActive,
      imageUrl: typeof dto.imageUrl === "string" ? dto.imageUrl : null,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
      averageCost: dto.averageCost ?? 0,
      totalStock: dto.totalStock ?? 0,
      margin: dto.margin ?? 0,
      profit: dto.profit ?? 0,
      safetyStock: dto.safetyStock ?? 0,
    });
  }

  static toDto(entity: Product): ProductResponseDto {
    return {
      id: entity.id,
      sku: entity.sku,
      name: entity.name,
      description: entity.description,
      categoryId: entity.categoryId,
      categoryName: entity.categoryName,
      unitOfMeasure: entity.unitOfMeasure,
      cost: entity.cost,
      price: entity.price,
      minStock: entity.minStock,
      maxStock: entity.maxStock,
      isActive: entity.isActive,
      imageUrl: entity.imageUrl,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      averageCost: entity.averageCost,
      totalStock: entity.totalStock,
      margin: entity.margin,
      profit: entity.profit,
      safetyStock: entity.safetyStock,
    };
  }
}
