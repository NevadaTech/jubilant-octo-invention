import { z } from "zod";
import type {
  CreateWarehouseDto,
  UpdateWarehouseDto,
} from "@/modules/inventory/application/dto/warehouse.dto";

export const createWarehouseSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(20, "Code cannot exceed 20 characters")
    .regex(
      /^[A-Za-z0-9-_]+$/,
      "Code can only contain letters, numbers, hyphens and underscores",
    ),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters"),
  address: z
    .string()
    .max(300, "Address cannot exceed 300 characters")
    .optional(),
});

export const updateWarehouseSchema = createWarehouseSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Form data types
export interface CreateWarehouseFormData {
  code: string;
  name: string;
  address?: string;
}

export interface UpdateWarehouseFormData extends Partial<CreateWarehouseFormData> {
  isActive?: boolean;
}

// Helper to transform form data to DTO
export function toCreateWarehouseDto(
  data: CreateWarehouseFormData,
): CreateWarehouseDto {
  return {
    code: data.code,
    name: data.name,
    address: data.address || undefined,
  };
}

export function toUpdateWarehouseDto(
  data: UpdateWarehouseFormData,
): UpdateWarehouseDto {
  const dto: UpdateWarehouseDto = {};

  if (data.code !== undefined) dto.code = data.code;
  if (data.name !== undefined) dto.name = data.name;
  if (data.address !== undefined) dto.address = data.address || undefined;
  if (data.isActive !== undefined) dto.isActive = data.isActive;

  return dto;
}
