import { Combo } from "@/modules/inventory/domain/entities/combo.entity";
import type {
  ComboResponseDto,
  CreateComboDto,
  UpdateComboDto,
} from "@/modules/inventory/application/dto/combo.dto";

export class ComboMapper {
  static toDomain(dto: ComboResponseDto): Combo {
    return Combo.create({
      id: dto.id,
      sku: dto.sku,
      name: dto.name,
      description: dto.description ?? null,
      price: dto.price ?? 0,
      currency: dto.currency ?? "USD",
      isActive: dto.isActive ?? true,
      orgId: dto.orgId ?? "",
      items: (dto.items ?? []).map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
      })),
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    });
  }

  static toDto(entity: Combo): ComboResponseDto {
    return {
      id: entity.id,
      sku: entity.sku,
      name: entity.name,
      description: entity.description,
      price: entity.price,
      currency: entity.currency,
      isActive: entity.isActive,
      orgId: entity.orgId,
      items: entity.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
      })),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toCreateDto(form: {
    sku: string;
    name: string;
    description?: string;
    price: number;
    currency?: string;
    items: { productId: string; quantity: number }[];
  }): CreateComboDto {
    return {
      sku: form.sku,
      name: form.name,
      description: form.description || undefined,
      price: form.price,
      currency: form.currency || undefined,
      items: form.items,
    };
  }

  static toUpdateDto(form: {
    name?: string;
    description?: string;
    price?: number;
    currency?: string;
    items?: { productId: string; quantity: number }[];
  }): UpdateComboDto {
    const dto: UpdateComboDto = {};

    if (form.name !== undefined) dto.name = form.name;
    if (form.description !== undefined)
      dto.description = form.description || undefined;
    if (form.price !== undefined) dto.price = form.price;
    if (form.currency !== undefined) dto.currency = form.currency || undefined;
    if (form.items !== undefined) dto.items = form.items;

    return dto;
  }
}
