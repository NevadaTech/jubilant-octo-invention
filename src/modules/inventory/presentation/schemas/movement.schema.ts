import { z } from "zod";
import type { CreateStockMovementDto, CreateMovementLineDto } from "../../application/dto/stock-movement.dto";
import type { MovementType } from "../../domain/entities/stock-movement.entity";

export const movementLineSchema = z.object({
  productId: z.string().min(1, "Please select a product"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .positive("Quantity must be greater than 0"),
  unitCost: z.number().positive().optional(),
});

export const createMovementSchema = z.object({
  warehouseId: z.string().min(1, "Please select a warehouse"),
  type: z.enum(
    ["IN", "OUT", "ADJUST_IN", "ADJUST_OUT", "TRANSFER_IN", "TRANSFER_OUT"] as const,
    { message: "Please select a movement type" }
  ),
  reference: z
    .string()
    .max(100, "Reference cannot exceed 100 characters")
    .optional(),
  reason: z
    .string()
    .max(500, "Reason cannot exceed 500 characters")
    .optional(),
  note: z
    .string()
    .max(1000, "Note cannot exceed 1000 characters")
    .optional(),
  lines: z
    .array(movementLineSchema)
    .min(1, "At least one product is required"),
});

// Form data types - use these for react-hook-form
export interface MovementLineFormData {
  productId: string;
  quantity: number;
  unitCost?: number;
}

export interface CreateMovementFormData {
  warehouseId: string;
  type: MovementType;
  reference?: string;
  reason?: string;
  note?: string;
  lines: MovementLineFormData[];
}

// Helper to transform form data to DTO
export function toCreateMovementDto(data: CreateMovementFormData): CreateStockMovementDto {
  return {
    warehouseId: data.warehouseId,
    type: data.type,
    reference: data.reference || undefined,
    reason: data.reason || undefined,
    note: data.note || undefined,
    lines: data.lines.map((line): CreateMovementLineDto => ({
      productId: line.productId,
      quantity: line.quantity,
      unitCost: line.unitCost,
    })),
  };
}
