import { z } from "zod";

export const loginSchema = z.object({
  organizationSlug: z
    .string()
    .min(2, "Organization slug must be at least 2 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginDto = z.infer<typeof loginSchema>;

export interface LoginResponseDto {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      username: string;
      firstName: string;
      lastName: string;
      phone?: string;
      timezone?: string;
      language?: string;
      jobTitle?: string;
      department?: string;
      mustChangePassword?: boolean;
      roles: string[];
      permissions: string[];
    };
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: string;
    refreshTokenExpiresAt: string;
    sessionId: string;
  };
  timestamp: string;
}
