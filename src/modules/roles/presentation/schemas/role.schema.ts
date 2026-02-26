import { z } from "zod";
import type { CreateRoleDto } from "@/modules/roles/application/dto/role.dto";

export const createRoleSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(50),
  description: z.string().max(500).optional().or(z.literal("")),
});

export type CreateRoleFormData = z.infer<typeof createRoleSchema>;

export function toCreateRoleDto(data: CreateRoleFormData): CreateRoleDto {
  return {
    name: data.name.toUpperCase(),
    description: data.description || undefined,
  };
}
