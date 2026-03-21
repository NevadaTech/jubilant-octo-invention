import { z } from "zod";
import type {
  CreateSaleDto,
  CreateSaleLineDto,
} from "@/modules/sales/application/dto/sale.dto";

export const saleLineSchema = z
  .object({
    lineType: z.enum(["product", "combo"]),
    productId: z.string().optional(),
    comboId: z.string().optional(),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    salePrice: z.number().min(0, "Price must be 0 or greater"),
    currency: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.lineType === "product") {
      if (!data.productId || data.productId.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select a product",
          path: ["productId"],
        });
      }
      if (!data.salePrice || data.salePrice < 0.01) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Price must be greater than 0",
          path: ["salePrice"],
        });
      }
    } else {
      if (!data.comboId || data.comboId.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select a combo",
          path: ["comboId"],
        });
      }
    }
  });

export const createSaleSchema = z.object({
  warehouseId: z.string().min(1, "Please select a warehouse"),
  contactId: z.string().min(1, "Please select a contact"),
  customerReference: z.string().optional(),
  externalReference: z.string().optional(),
  note: z.string().optional(),
  lines: z
    .array(saleLineSchema)
    .min(1, "At least one product or combo is required"),
});

export type CreateSaleFormData = z.infer<typeof createSaleSchema>;

export function toCreateSaleDto(data: CreateSaleFormData): CreateSaleDto {
  const lines: CreateSaleLineDto[] = data.lines.map((line) => {
    if (line.lineType === "combo") {
      return {
        comboId: line.comboId!,
        quantity: line.quantity,
        salePrice: line.salePrice,
      } as CreateSaleLineDto;
    }
    return {
      productId: line.productId!,
      quantity: line.quantity,
      salePrice: line.salePrice,
      currency: line.currency,
    };
  });

  return {
    warehouseId: data.warehouseId,
    contactId: data.contactId,
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
