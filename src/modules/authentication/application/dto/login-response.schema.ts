import { z } from "zod";

export const loginResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    user: z.object({
      id: z.string(),
      email: z.string(),
      username: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      phone: z.string().optional(),
      timezone: z.string().optional(),
      language: z.string().optional(),
      jobTitle: z.string().optional(),
      department: z.string().optional(),
      mustChangePassword: z.boolean().optional(),
      roles: z.array(z.string()),
      permissions: z.array(z.string()),
      orgSettings: z.record(z.string(), z.unknown()).optional(),
    }),
    accessToken: z.string(),
    refreshToken: z.string(),
    accessTokenExpiresAt: z.string(),
    refreshTokenExpiresAt: z.string(),
    sessionId: z.string(),
  }),
  timestamp: z.string(),
});

export const refreshResponseSchema = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    accessTokenExpiresAt: z.string(),
    user: z
      .object({
        orgSettings: z.record(z.string(), z.unknown()).optional(),
      })
      .passthrough()
      .optional(),
  }),
});
