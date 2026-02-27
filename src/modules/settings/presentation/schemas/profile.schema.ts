import { z } from "zod";

export const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(100, "First name cannot exceed 100 characters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(100, "Last name cannot exceed 100 characters"),
  phone: z
    .string()
    .max(20, "Phone cannot exceed 20 characters")
    .optional()
    .or(z.literal("")),
  timezone: z.string().optional(),
  language: z.enum(["en", "es"]).optional(),
  jobTitle: z
    .string()
    .max(100, "Job title cannot exceed 100 characters")
    .optional()
    .or(z.literal("")),
  department: z
    .string()
    .max(100, "Department cannot exceed 100 characters")
    .optional()
    .or(z.literal("")),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
