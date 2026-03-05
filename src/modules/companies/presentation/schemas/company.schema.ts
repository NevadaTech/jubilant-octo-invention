import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  code: z
    .string()
    .min(1, "Code is required")
    .max(50)
    .regex(/^[A-Za-z0-9_-]+$/, "Code must be alphanumeric"),
  description: z.string().max(1000).optional(),
});

export const updateCompanySchema = createCompanySchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type CreateCompanyFormData = z.infer<typeof createCompanySchema>;
export type UpdateCompanyFormData = z.infer<typeof updateCompanySchema>;
