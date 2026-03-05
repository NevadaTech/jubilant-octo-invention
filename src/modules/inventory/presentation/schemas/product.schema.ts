import { z } from "zod";
import type {
  CreateProductDto,
  UpdateProductDto,
} from "@/modules/inventory/application/dto/product.dto";

export const createProductSchema = z.object({
  sku: z
    .string()
    .min(1, "SKU is required")
    .max(50, "SKU cannot exceed 50 characters")
    .regex(
      /^[A-Za-z0-9-_]+$/,
      "SKU can only contain letters, numbers, hyphens and underscores",
    ),
  name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name cannot exceed 200 characters"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  categoryIds: z.array(z.string()).optional(),
  unitOfMeasure: z.string().min(1, "Unit of measure is required"),
  price: z.number().min(0, "Price cannot be negative"),
  companyId: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Form data types - use these for react-hook-form
export interface CreateProductFormData {
  sku: string;
  name: string;
  description?: string;
  categoryIds?: string[];
  unitOfMeasure: string;
  price: number;
  companyId?: string;
}

export interface UpdateProductFormData extends Partial<CreateProductFormData> {
  isActive?: boolean;
}

// Helper to transform form data to DTO
export function toCreateProductDto(
  data: CreateProductFormData,
): CreateProductDto {
  return {
    sku: data.sku,
    name: data.name,
    description: data.description || undefined,
    categoryIds: data.categoryIds,
    unitOfMeasure: data.unitOfMeasure,
    cost: 0,
    price: data.price,
    minStock: 0,
    maxStock: 0,
    companyId: data.companyId || undefined,
  };
}

export function toUpdateProductDto(
  data: UpdateProductFormData,
): UpdateProductDto {
  const dto: UpdateProductDto = {};

  if (data.name !== undefined) dto.name = data.name;
  if (data.description !== undefined)
    dto.description = data.description || undefined;
  if (data.categoryIds !== undefined) dto.categoryIds = data.categoryIds;
  if (data.unitOfMeasure !== undefined) dto.unitOfMeasure = data.unitOfMeasure;
  if (data.price !== undefined) dto.price = data.price;
  if (data.isActive !== undefined) dto.isActive = data.isActive;
  if (data.companyId !== undefined) dto.companyId = data.companyId || undefined;

  return dto;
}
