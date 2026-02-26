import { z } from "zod";
import type {
  CreateSaleDto,
  CreateSaleLineDto,
} from "@/modules/sales/application/dto/sale.dto";

export const saleLineSchema = z.object({
  productId: z.string().min(1, "Please select a product"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  salePrice: z.number().min(0.01, "Price must be greater than 0"),
  currency: z.string().optional(),
});

export const createSaleSchema = z.object({
  warehouseId: z.string().min(1, "Please select a warehouse"),
  customerReference: z.string().optional(),
  externalReference: z.string().optional(),
  note: z.string().optional(),
  lines: z.array(saleLineSchema).min(1, "At least one product is required"),
});

export type CreateSaleFormData = z.infer<typeof createSaleSchema>;

export function toCreateSaleDto(data: CreateSaleFormData): CreateSaleDto {
  const lines: CreateSaleLineDto[] = data.lines.map((line) => ({
    productId: line.productId,
    quantity: line.quantity,
    salePrice: line.salePrice,
    currency: line.currency,
  }));

  return {
    warehouseId: data.warehouseId,
    customerReference: data.customerReference || undefined,
    externalReference: data.externalReference || undefined,
    note: data.note || undefined,
    lines,
  };
}

export const addSaleLineSchema = z.object({
  productId: z.string().min(1, "Please select a product"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  salePrice: z.number().min(0.01, "Price must be greater than 0"),
});

export type AddSaleLineFormData = z.infer<typeof addSaleLineSchema>;
