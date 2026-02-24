import { z } from "zod";
import type {
  CreateReturnDto,
  CreateReturnLineDto,
} from "../../application/dto/return.dto";

export const returnLineSchema = z
  .object({
    productId: z.string().min(1, "Please select a product"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    maxQuantity: z.number().optional(),
    originalSalePrice: z.number().min(0.01).optional(),
    originalUnitCost: z.number().min(0.01).optional(),
    currency: z.string().optional(),
  })
  .refine(
    (line) =>
      line.maxQuantity === undefined || line.quantity <= line.maxQuantity,
    {
      message: "Quantity exceeds the amount sold",
      path: ["quantity"],
    },
  );

export const createReturnSchema = z
  .object({
    type: z.enum(["RETURN_CUSTOMER", "RETURN_SUPPLIER"] as const, {
      message: "Please select a return type",
    }),
    warehouseId: z.string().min(1, "Please select a warehouse"),
    saleId: z.string().optional(),
    reason: z.string().optional(),
    note: z.string().optional(),
    lines: z.array(returnLineSchema).min(1, "At least one product is required"),
  })
  .refine(
    (data) =>
      data.type !== "RETURN_CUSTOMER" ||
      (data.saleId !== undefined && data.saleId.trim() !== ""),
    {
      message: "Sale reference is required for customer returns",
      path: ["saleId"],
    },
  );

export type CreateReturnFormData = z.infer<typeof createReturnSchema>;

export function toCreateReturnDto(data: CreateReturnFormData): CreateReturnDto {
  const lines: CreateReturnLineDto[] = data.lines.map((line) => ({
    productId: line.productId,
    quantity: line.quantity,
    originalSalePrice: line.originalSalePrice,
    originalUnitCost: line.originalUnitCost,
    currency: line.currency,
    // maxQuantity is form-only, not sent to API
  }));

  return {
    type: data.type,
    warehouseId: data.warehouseId,
    saleId: data.saleId || undefined,
    reason: data.reason || undefined,
    note: data.note || undefined,
    lines,
  };
}
