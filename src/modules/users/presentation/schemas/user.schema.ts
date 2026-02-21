import { z } from "zod";
import type { CreateUserDto } from "../../application/dto/user.dto";

export const createUserSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(100),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(100),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

export function toCreateUserDto(data: CreateUserFormData): CreateUserDto {
  return {
    email: data.email,
    username: data.username,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
  };
}

export const updateUserSchema = z.object({
  email: z.string().email("Please enter a valid email").optional(),
  username: z.string().min(3).max(50).optional(),
  firstName: z.string().min(2).max(100).optional(),
  lastName: z.string().min(2).max(100).optional(),
});

export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
