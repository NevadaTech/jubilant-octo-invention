import { z } from "zod";
import type {
  CreateComboDto,
  UpdateComboDto,
} from "@/modules/inventory/application/dto/combo.dto";

const comboItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1"),
});

export const createComboSchema = z.object({
  sku: z
    .string()
    .min(3, "SKU must be at least 3 characters")
    .max(50, "SKU cannot exceed 50 characters"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(200, "Name cannot exceed 200 characters"),
  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  currency: z.string().optional().default("COP"),
  items: z.array(comboItemSchema).min(1, "At least one item is required"),
});

export const updateComboSchema = createComboSchema.partial().extend({
  items: z
    .array(comboItemSchema)
    .min(1, "At least one item is required")
    .optional(),
});

// Form data types - use these for react-hook-form
export interface ComboItemFormData {
  productId: string;
  quantity: number;
}

export interface CreateComboFormData {
  sku: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  items: ComboItemFormData[];
}

export interface UpdateComboFormData extends Partial<CreateComboFormData> {
  items?: ComboItemFormData[];
}

// Helper to transform form data to DTO
export function toCreateComboDto(data: CreateComboFormData): CreateComboDto {
  return {
    sku: data.sku,
    name: data.name,
    description: data.description || undefined,
    price: data.price,
    currency: data.currency || "COP",
    items: data.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
  };
}

export function toUpdateComboDto(data: UpdateComboFormData): UpdateComboDto {
  const dto: UpdateComboDto = {};

  if (data.name !== undefined) dto.name = data.name;
  if (data.description !== undefined)
    dto.description = data.description || undefined;
  if (data.price !== undefined) dto.price = data.price;
  if (data.currency !== undefined) dto.currency = data.currency;
  if (data.items !== undefined)
    dto.items = data.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

  return dto;
}
