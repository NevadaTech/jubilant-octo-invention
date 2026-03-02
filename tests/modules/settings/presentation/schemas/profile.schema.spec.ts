import { describe, it, expect } from "vitest";
import { profileSchema } from "@/modules/settings/presentation/schemas/profile.schema";

describe("Profile Schema", () => {
  const validProfile = {
    firstName: "John",
    lastName: "Doe",
    phone: "+1234567890",
    timezone: "America/New_York",
    language: "en" as const,
    jobTitle: "Warehouse Manager",
    department: "Operations",
  };

  describe("profileSchema", () => {
    it("Given: valid profile with all fields When: validating Then: should pass validation", () => {
      // Act
      const result = profileSchema.safeParse(validProfile);

      // Assert
      expect(result.success).toBe(true);
    });

    it("Given: only required fields When: validating Then: should pass validation", () => {
      // Arrange
      const data = { firstName: "Jane", lastName: "Smith" };

      // Act
      const result = profileSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });

    it("Given: firstName with 1 character When: validating Then: should fail validation", () => {
      // Arrange
      const data = { ...validProfile, firstName: "J" };

      // Act
      const result = profileSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "First name must be at least 2 characters",
        );
      }
    });

    it("Given: lastName with 1 character When: validating Then: should fail validation", () => {
      // Arrange
      const data = { ...validProfile, lastName: "D" };

      // Act
      const result = profileSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Last name must be at least 2 characters",
        );
      }
    });

    it("Given: firstName exceeding 100 characters When: validating Then: should fail validation", () => {
      // Arrange
      const data = { ...validProfile, firstName: "A".repeat(101) };

      // Act
      const result = profileSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "First name cannot exceed 100 characters",
        );
      }
    });

    it("Given: lastName exceeding 100 characters When: validating Then: should fail validation", () => {
      // Arrange
      const data = { ...validProfile, lastName: "B".repeat(101) };

      // Act
      const result = profileSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Last name cannot exceed 100 characters",
        );
      }
    });

    it("Given: phone exceeding 20 characters When: validating Then: should fail validation", () => {
      // Arrange
      const data = { ...validProfile, phone: "1".repeat(21) };

      // Act
      const result = profileSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Phone cannot exceed 20 characters",
        );
      }
    });

    it("Given: empty string for optional fields When: validating Then: should pass validation", () => {
      // Arrange
      const data = {
        firstName: "John",
        lastName: "Doe",
        phone: "",
        jobTitle: "",
        department: "",
      };

      // Act
      const result = profileSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });

    it("Given: valid language enum values When: validating Then: should pass for en and es", () => {
      // Act & Assert
      expect(
        profileSchema.safeParse({ ...validProfile, language: "en" }).success,
      ).toBe(true);
      expect(
        profileSchema.safeParse({ ...validProfile, language: "es" }).success,
      ).toBe(true);
    });

    it("Given: invalid language value When: validating Then: should fail validation", () => {
      // Arrange
      const data = { ...validProfile, language: "fr" };

      // Act
      const result = profileSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
    });

    it("Given: jobTitle exceeding 100 characters When: validating Then: should fail validation", () => {
      // Arrange
      const data = { ...validProfile, jobTitle: "T".repeat(101) };

      // Act
      const result = profileSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Job title cannot exceed 100 characters",
        );
      }
    });

    it("Given: department exceeding 100 characters When: validating Then: should fail validation", () => {
      // Arrange
      const data = { ...validProfile, department: "D".repeat(101) };

      // Act
      const result = profileSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Department cannot exceed 100 characters",
        );
      }
    });
  });
});
