import { describe, it, expect } from "vitest";
import {
  requestResetSchema,
  verifyOtpSchema,
  newPasswordSchema,
} from "@/modules/authentication/presentation/schemas/password-reset.schema";

describe("Password Reset Schemas", () => {
  // ── requestResetSchema ──────────────────────────────────────────────

  describe("requestResetSchema", () => {
    it("Given: valid organization and email When: validating Then: should pass", () => {
      const result = requestResetSchema.safeParse({
        organizationSlug: "acme-corp",
        email: "user@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("Given: empty organizationSlug When: validating Then: should fail with required message", () => {
      const result = requestResetSchema.safeParse({
        organizationSlug: "",
        email: "user@example.com",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Organization is required");
      }
    });

    it("Given: missing organizationSlug When: validating Then: should fail", () => {
      const result = requestResetSchema.safeParse({
        email: "user@example.com",
      });
      expect(result.success).toBe(false);
    });

    it("Given: invalid email When: validating Then: should fail with invalid email message", () => {
      const result = requestResetSchema.safeParse({
        organizationSlug: "acme-corp",
        email: "not-an-email",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid email address");
      }
    });

    it("Given: empty email When: validating Then: should fail", () => {
      const result = requestResetSchema.safeParse({
        organizationSlug: "acme-corp",
        email: "",
      });
      expect(result.success).toBe(false);
    });

    it("Given: missing email field When: validating Then: should fail", () => {
      const result = requestResetSchema.safeParse({
        organizationSlug: "acme-corp",
      });
      expect(result.success).toBe(false);
    });
  });

  // ── verifyOtpSchema ─────────────────────────────────────────────────

  describe("verifyOtpSchema", () => {
    it("Given: valid 6-digit code When: validating Then: should pass", () => {
      const result = verifyOtpSchema.safeParse({ otpCode: "123456" });
      expect(result.success).toBe(true);
    });

    it("Given: code with fewer than 6 digits When: validating Then: should fail", () => {
      const result = verifyOtpSchema.safeParse({ otpCode: "12345" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Code must be 6 digits");
      }
    });

    it("Given: code with more than 6 digits When: validating Then: should fail", () => {
      const result = verifyOtpSchema.safeParse({ otpCode: "1234567" });
      expect(result.success).toBe(false);
    });

    it("Given: code with letters When: validating Then: should fail with regex message", () => {
      const result = verifyOtpSchema.safeParse({ otpCode: "12ab56" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Code must be 6 digits");
      }
    });

    it("Given: empty code When: validating Then: should fail", () => {
      const result = verifyOtpSchema.safeParse({ otpCode: "" });
      expect(result.success).toBe(false);
    });

    it("Given: code with special characters When: validating Then: should fail", () => {
      const result = verifyOtpSchema.safeParse({ otpCode: "12-456" });
      expect(result.success).toBe(false);
    });
  });

  // ── newPasswordSchema ───────────────────────────────────────────────

  describe("newPasswordSchema", () => {
    const validPassword = "StrongP@ss1";

    it("Given: valid matching passwords When: validating Then: should pass", () => {
      const result = newPasswordSchema.safeParse({
        newPassword: validPassword,
        confirmPassword: validPassword,
      });
      expect(result.success).toBe(true);
    });

    it("Given: password shorter than 8 chars When: validating Then: should fail", () => {
      const result = newPasswordSchema.safeParse({
        newPassword: "Ab1!",
        confirmPassword: "Ab1!",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const messages = result.error.issues.map((i) => i.message);
        expect(messages).toContain("Password must be at least 8 characters");
      }
    });

    it("Given: password longer than 128 chars When: validating Then: should fail", () => {
      const longPassword = "A".repeat(120) + "a1!bcdef" + "X".repeat(10);
      const result = newPasswordSchema.safeParse({
        newPassword: longPassword,
        confirmPassword: longPassword,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const messages = result.error.issues.map((i) => i.message);
        expect(messages).toContain("Password is too long");
      }
    });

    it("Given: password without uppercase When: validating Then: should fail", () => {
      const result = newPasswordSchema.safeParse({
        newPassword: "lowercase1!",
        confirmPassword: "lowercase1!",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const messages = result.error.issues.map((i) => i.message);
        expect(messages).toContain("Must contain an uppercase letter");
      }
    });

    it("Given: password without lowercase When: validating Then: should fail", () => {
      const result = newPasswordSchema.safeParse({
        newPassword: "UPPERCASE1!",
        confirmPassword: "UPPERCASE1!",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const messages = result.error.issues.map((i) => i.message);
        expect(messages).toContain("Must contain a lowercase letter");
      }
    });

    it("Given: password without number When: validating Then: should fail", () => {
      const result = newPasswordSchema.safeParse({
        newPassword: "NoNumber!@",
        confirmPassword: "NoNumber!@",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const messages = result.error.issues.map((i) => i.message);
        expect(messages).toContain("Must contain a number");
      }
    });

    it("Given: password without special character When: validating Then: should fail", () => {
      const result = newPasswordSchema.safeParse({
        newPassword: "NoSpecial1A",
        confirmPassword: "NoSpecial1A",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const messages = result.error.issues.map((i) => i.message);
        expect(messages).toContain("Must contain a special character");
      }
    });

    it("Given: mismatched passwords When: validating Then: should fail with mismatch error", () => {
      const result = newPasswordSchema.safeParse({
        newPassword: validPassword,
        confirmPassword: "DifferentP@ss1",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const messages = result.error.issues.map((i) => i.message);
        expect(messages).toContain("Passwords do not match");
      }
    });

    it("Given: empty confirmPassword When: validating Then: should fail", () => {
      const result = newPasswordSchema.safeParse({
        newPassword: validPassword,
        confirmPassword: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const messages = result.error.issues.map((i) => i.message);
        expect(messages).toContain("Please confirm your password");
      }
    });
  });
});
