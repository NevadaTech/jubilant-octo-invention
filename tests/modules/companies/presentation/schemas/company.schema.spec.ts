import { describe, it, expect } from "vitest";
import {
  createCompanySchema,
  updateCompanySchema,
} from "@/modules/companies/presentation/schemas/company.schema";

describe("Company Schemas", () => {
  describe("createCompanySchema", () => {
    it("Given: valid data When: parsing Then: should pass validation", () => {
      const data = { name: "Acme Corp", code: "ACME" };

      const result = createCompanySchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it("Given: all fields When: parsing Then: should pass validation", () => {
      const data = {
        name: "Acme Corp",
        code: "ACME-01",
        description: "Main company",
      };

      const result = createCompanySchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe("Main company");
      }
    });

    it("Given: missing name When: parsing Then: should fail validation", () => {
      const data = { name: "", code: "ACME" };

      const result = createCompanySchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("Given: missing code When: parsing Then: should fail validation", () => {
      const data = { name: "Acme Corp", code: "" };

      const result = createCompanySchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("Given: code with special characters When: parsing Then: should fail validation", () => {
      const data = { name: "Acme", code: "ACME @#$" };

      const result = createCompanySchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("Given: code with alphanumeric and hyphens When: parsing Then: should pass", () => {
      const data = { name: "Acme", code: "ACME-01_test" };

      const result = createCompanySchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it("Given: name exceeding max length When: parsing Then: should fail validation", () => {
      const data = { name: "A".repeat(201), code: "ACME" };

      const result = createCompanySchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("Given: code exceeding max length When: parsing Then: should fail validation", () => {
      const data = { name: "Acme", code: "A".repeat(51) };

      const result = createCompanySchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("Given: description exceeding max length When: parsing Then: should fail", () => {
      const data = {
        name: "Acme",
        code: "ACME",
        description: "D".repeat(1001),
      };

      const result = createCompanySchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("Given: no description When: parsing Then: should pass with undefined", () => {
      const data = { name: "Acme", code: "ACME" };

      const result = createCompanySchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBeUndefined();
      }
    });

    it("Given: code with spaces When: parsing Then: should fail regex", () => {
      const data = { name: "Acme", code: "ACME CORP" };

      const result = createCompanySchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });

  describe("updateCompanySchema", () => {
    it("Given: partial data with isActive When: parsing Then: should pass", () => {
      const data = { name: "Updated Corp", isActive: false };

      const result = updateCompanySchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isActive).toBe(false);
      }
    });

    it("Given: empty object When: parsing Then: should pass (all fields optional)", () => {
      const result = updateCompanySchema.safeParse({});

      expect(result.success).toBe(true);
    });

    it("Given: only isActive When: parsing Then: should pass", () => {
      const result = updateCompanySchema.safeParse({ isActive: true });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isActive).toBe(true);
      }
    });

    it("Given: invalid code When: parsing Then: should fail regex", () => {
      const result = updateCompanySchema.safeParse({ code: "invalid code!" });

      expect(result.success).toBe(false);
    });
  });
});
