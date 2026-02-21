import { z } from "zod";
import type {
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../../application/dto/category.dto";

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  parentId: z.string().optional().or(z.literal("")),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Form data types - use these for react-hook-form
export interface CreateCategoryFormData {
  name: string;
  description?: string;
  parentId?: string;
}

export interface UpdateCategoryFormData extends Partial<CreateCategoryFormData> {
  isActive?: boolean;
}

// Helper to transform form data to DTO
export function toCreateCategoryDto(
  data: CreateCategoryFormData,
): CreateCategoryDto {
  return {
    name: data.name,
    description: data.description || undefined,
    parentId: data.parentId || undefined,
  };
}

export function toUpdateCategoryDto(
  data: UpdateCategoryFormData,
): UpdateCategoryDto {
  const dto: UpdateCategoryDto = {};

  if (data.name !== undefined) dto.name = data.name;
  if (data.description !== undefined)
    dto.description = data.description || undefined;
  if (data.parentId !== undefined) dto.parentId = data.parentId || undefined;
  if (data.isActive !== undefined) dto.isActive = data.isActive;

  return dto;
}
