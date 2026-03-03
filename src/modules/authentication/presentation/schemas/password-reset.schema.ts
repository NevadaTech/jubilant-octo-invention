import { z } from "zod";

export const requestResetSchema = z.object({
  organizationSlug: z.string().min(1, "Organization is required"),
  email: z.string().email("Invalid email address"),
});

export type RequestResetFormValues = z.infer<typeof requestResetSchema>;

export const verifyOtpSchema = z.object({
  otpCode: z
    .string()
    .length(6, "Code must be 6 digits")
    .regex(/^\d{6}$/, "Code must be 6 digits"),
});

export type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;

export const newPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/\d/, "Must contain a number")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "Must contain a special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type NewPasswordFormValues = z.infer<typeof newPasswordSchema>;
