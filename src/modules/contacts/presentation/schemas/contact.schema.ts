import { z } from "zod";
import type {
  CreateContactDto,
  UpdateContactDto,
} from "@/modules/contacts/application/dto/contact.dto";

export const createContactSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  identification: z.string().min(1, "Identification is required").max(100),
  type: z.enum(["CUSTOMER", "SUPPLIER"]).default("CUSTOMER"),
  address: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

export type CreateContactFormData = z.infer<typeof createContactSchema>;

export function toCreateContactDto(
  data: CreateContactFormData | UpdateContactFormData,
): CreateContactDto {
  return {
    name: data.name,
    identification: data.identification,
    type: data.type,
    address: data.address || undefined,
    notes: data.notes || undefined,
  };
}

export const updateContactSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  identification: z.string().min(1, "Identification is required").max(100),
  type: z.enum(["CUSTOMER", "SUPPLIER"]),
  address: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateContactFormData = z.infer<typeof updateContactSchema>;

export function toUpdateContactDto(
  data: UpdateContactFormData,
): UpdateContactDto {
  return {
    name: data.name,
    identification: data.identification,
    type: data.type,
    address: data.address || undefined,
    notes: data.notes || undefined,
    isActive: data.isActive,
  };
}
