import { z } from "zod";

export const reorderRuleSchema = z
  .object({
    minQty: z.number().min(0, "Minimum quantity cannot be negative"),
    maxQty: z.number().min(1, "Maximum quantity must be at least 1"),
    safetyQty: z.number().min(0, "Safety stock cannot be negative"),
  })
  .refine((data) => data.maxQty > data.minQty, {
    message: "Maximum quantity must be greater than minimum quantity",
    path: ["maxQty"],
  });

export type ReorderRuleFormData = z.infer<typeof reorderRuleSchema>;
