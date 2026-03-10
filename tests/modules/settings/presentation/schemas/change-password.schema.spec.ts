import { describe, it, expect } from "vitest";
import { changePasswordSchema } from "@/modules/settings/presentation/schemas/change-password.schema";

describe("Change Password Schema", () => {
  const validData = {
    currentPassword: "OldPass123!",
    newPassword: "NewPass456@",
    confirmPassword: "NewPass456@",
  };

  describe("changePasswordSchema", () => {
    it("Given: valid data with all requirements When: validating Then: should pass validation", () => {
      // Act
      const result = changePasswordSchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
    });

    // ── currentPassword ────────────────────────────────────────────────

    it("Given: empty currentPassword When: validating Then: should fail with required message", () => {
      // Arrange
      const data = { ...validData, currentPassword: "" };

      // Act
      const result = changePasswordSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.path[0] === "currentPassword",
        );
        expect(issue?.message).toBe("Current password is required");
      }
    });

    // ── newPassword min length ─────────────────────────────────────────

    it("Given: newPassword shorter than 8 characters When: validating Then: should fail with min length message", () => {
      // Arrange
      const data = {
        ...validData,
        newPassword: "Ab1!",
        confirmPassword: "Ab1!",
      };

      // Act
      const result = changePasswordSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.path[0] === "newPassword" && i.message.includes("8"),
        );
        expect(issue?.message).toBe("Password must be at least 8 characters");
      }
    });

    // ── newPassword max length ─────────────────────────────────────────

    it("Given: newPassword exceeding 128 characters When: validating Then: should fail with max length message", () => {
      // Arrange
      const longPass = "Aa1!" + "x".repeat(125);
      const data = {
        ...validData,
        newPassword: longPass,
        confirmPassword: longPass,
      };

      // Act
      const result = changePasswordSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.path[0] === "newPassword" && i.message.includes("too long"),
        );
        expect(issue?.message).toBe("Password is too long");
      }
    });

    // ── newPassword uppercase regex ────────────────────────────────────

    it("Given: newPassword without uppercase letter When: validating Then: should fail with uppercase message", () => {
      // Arrange
      const data = {
        ...validData,
        newPassword: "newpass456@",
        confirmPassword: "newpass456@",
      };

      // Act
      const result = changePasswordSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.path[0] === "newPassword" && i.message.includes("uppercase"),
        );
        expect(issue?.message).toBe("Must contain an uppercase letter");
      }
    });

    // ── newPassword lowercase regex ────────────────────────────────────

    it("Given: newPassword without lowercase letter When: validating Then: should fail with lowercase message", () => {
      // Arrange
      const data = {
        ...validData,
        newPassword: "NEWPASS456@",
        confirmPassword: "NEWPASS456@",
      };

      // Act
      const result = changePasswordSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.path[0] === "newPassword" && i.message.includes("lowercase"),
        );
        expect(issue?.message).toBe("Must contain a lowercase letter");
      }
    });

    // ── newPassword number regex ───────────────────────────────────────

    it("Given: newPassword without a number When: validating Then: should fail with number message", () => {
      // Arrange
      const data = {
        ...validData,
        newPassword: "NewPassXYZ@",
        confirmPassword: "NewPassXYZ@",
      };

      // Act
      const result = changePasswordSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.path[0] === "newPassword" && i.message.includes("number"),
        );
        expect(issue?.message).toBe("Must contain a number");
      }
    });

    // ── newPassword special char regex ─────────────────────────────────

    it("Given: newPassword without a special character When: validating Then: should fail with special char message", () => {
      // Arrange
      const data = {
        ...validData,
        newPassword: "NewPass456x",
        confirmPassword: "NewPass456x",
      };

      // Act
      const result = changePasswordSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.path[0] === "newPassword" && i.message.includes("special"),
        );
        expect(issue?.message).toBe("Must contain a special character");
      }
    });

    // ── confirmPassword required ───────────────────────────────────────

    it("Given: empty confirmPassword When: validating Then: should fail with required message", () => {
      // Arrange
      const data = { ...validData, confirmPassword: "" };

      // Act
      const result = changePasswordSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.path[0] === "confirmPassword",
        );
        expect(issue?.message).toBe("Please confirm your password");
      }
    });

    // ── refine: passwords must match ───────────────────────────────────

    it("Given: confirmPassword does not match newPassword When: validating Then: should fail with mismatch message", () => {
      // Arrange
      const data = { ...validData, confirmPassword: "Different1!" };

      // Act
      const result = changePasswordSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) =>
            i.path.includes("confirmPassword") &&
            i.message.includes("do not match"),
        );
        expect(issue?.message).toBe("Passwords do not match");
      }
    });

    // ── refine: new password must differ from current ───────────────────

    it("Given: newPassword is identical to currentPassword When: validating Then: should fail with different password message", () => {
      // Arrange
      const data = {
        currentPassword: "SamePass123!",
        newPassword: "SamePass123!",
        confirmPassword: "SamePass123!",
      };

      // Act
      const result = changePasswordSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) =>
            i.path.includes("newPassword") && i.message.includes("different"),
        );
        expect(issue?.message).toBe(
          "New password must be different from current password",
        );
      }
    });

    // ── newPassword exactly 8 characters (boundary) ────────────────────

    it("Given: newPassword with exactly 8 characters meeting all requirements When: validating Then: should pass validation", () => {
      // Arrange
      const data = {
        ...validData,
        newPassword: "Abcdef1!",
        confirmPassword: "Abcdef1!",
      };

      // Act
      const result = changePasswordSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });

    // ── newPassword exactly 128 characters (boundary) ──────────────────

    it("Given: newPassword with exactly 128 characters meeting all requirements When: validating Then: should pass validation", () => {
      // Arrange
      const base = "Aa1!" + "x".repeat(124);
      const data = {
        ...validData,
        newPassword: base,
        confirmPassword: base,
      };

      // Act
      const result = changePasswordSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });
  });
});
