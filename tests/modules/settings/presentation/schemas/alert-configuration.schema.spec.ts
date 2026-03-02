import { describe, it, expect } from "vitest";
import { alertConfigurationSchema } from "@/modules/settings/presentation/schemas/alert-configuration.schema";

describe("Alert Configuration Schema", () => {
  const validConfig = {
    isEnabled: true,
    cronFrequency: "EVERY_DAY" as const,
    notifyLowStock: true,
    notifyCriticalStock: true,
    notifyOutOfStock: false,
    recipientEmails: "admin@example.com",
  };

  describe("alertConfigurationSchema", () => {
    it("Given: valid configuration with all fields When: validating Then: should pass validation", () => {
      // Act
      const result = alertConfigurationSchema.safeParse(validConfig);

      // Assert
      expect(result.success).toBe(true);
    });

    it("Given: empty recipientEmails string When: validating Then: should pass validation", () => {
      // Arrange
      const data = { ...validConfig, recipientEmails: "" };

      // Act
      const result = alertConfigurationSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });

    it("Given: undefined recipientEmails When: validating Then: should pass validation", () => {
      // Arrange
      const { recipientEmails, ...dataWithout } = validConfig;

      // Act
      const result = alertConfigurationSchema.safeParse(dataWithout);

      // Assert
      expect(result.success).toBe(true);
    });

    it("Given: all valid cronFrequency enum values When: validating Then: should pass validation for each", () => {
      // Arrange
      const frequencies = [
        "EVERY_HOUR",
        "EVERY_6_HOURS",
        "EVERY_12_HOURS",
        "EVERY_DAY",
        "EVERY_WEEK",
        "EVERY_2_WEEKS",
        "EVERY_MONTH",
      ];

      // Act & Assert
      for (const freq of frequencies) {
        const result = alertConfigurationSchema.safeParse({
          ...validConfig,
          cronFrequency: freq,
        });
        expect(result.success).toBe(true);
      }
    });

    it("Given: invalid cronFrequency value When: validating Then: should fail validation", () => {
      // Arrange
      const invalidData = { ...validConfig, cronFrequency: "EVERY_MINUTE" };

      // Act
      const result = alertConfigurationSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });

    it("Given: missing isEnabled field When: validating Then: should fail validation", () => {
      // Arrange
      const { isEnabled, ...dataWithout } = validConfig;

      // Act
      const result = alertConfigurationSchema.safeParse(dataWithout);

      // Assert
      expect(result.success).toBe(false);
    });

    it("Given: non-boolean isEnabled When: validating Then: should fail validation", () => {
      // Arrange
      const invalidData = { ...validConfig, isEnabled: "yes" };

      // Act
      const result = alertConfigurationSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });

    it("Given: missing cronFrequency When: validating Then: should fail validation", () => {
      // Arrange
      const { cronFrequency, ...dataWithout } = validConfig;

      // Act
      const result = alertConfigurationSchema.safeParse(dataWithout);

      // Assert
      expect(result.success).toBe(false);
    });

    it("Given: missing notification boolean fields When: validating Then: should fail validation", () => {
      // Arrange
      const incompleteData = {
        isEnabled: true,
        cronFrequency: "EVERY_DAY",
      };

      // Act
      const result = alertConfigurationSchema.safeParse(incompleteData);

      // Assert
      expect(result.success).toBe(false);
    });

    it("Given: all notification flags set to false When: validating Then: should pass validation", () => {
      // Arrange
      const data = {
        ...validConfig,
        notifyLowStock: false,
        notifyCriticalStock: false,
        notifyOutOfStock: false,
      };

      // Act
      const result = alertConfigurationSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });

    it("Given: disabled configuration When: validating Then: should pass validation", () => {
      // Arrange
      const data = {
        isEnabled: false,
        cronFrequency: "EVERY_HOUR" as const,
        notifyLowStock: false,
        notifyCriticalStock: false,
        notifyOutOfStock: false,
      };

      // Act
      const result = alertConfigurationSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });
  });
});
