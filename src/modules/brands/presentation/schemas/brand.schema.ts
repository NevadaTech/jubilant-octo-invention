import { z } from "zod";

export const createBrandSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(500).optional(),
});

export const updateBrandSchema = createBrandSchema.partial();

export type CreateBrandFormData = z.infer<typeof createBrandSchema>;
export type UpdateBrandFormData = z.infer<typeof updateBrandSchema>;
