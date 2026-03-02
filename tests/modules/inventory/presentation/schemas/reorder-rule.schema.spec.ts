import { describe, it, expect } from "vitest";
import { reorderRuleSchema } from "@/modules/inventory/presentation/schemas/reorder-rule.schema";

describe("reorderRuleSchema", () => {
  const validData = {
    minQty: 10,
    maxQty: 100,
    safetyQty: 5,
  };

  describe("Given valid reorder rule data", () => {
    it("When parsed, Then it should pass validation", () => {
      const result = reorderRuleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("Given a negative minQty", () => {
    it("When parsed, Then it should fail validation", () => {
      const data = { ...validData, minQty: -1 };
      const result = reorderRuleSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("Given maxQty less than minQty", () => {
    it("When parsed, Then it should fail due to refinement", () => {
      const data = { ...validData, minQty: 50, maxQty: 10 };
      const result = reorderRuleSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("Given maxQty of zero", () => {
    it("When parsed, Then it should fail because maxQty must be at least 1", () => {
      const data = { ...validData, maxQty: 0 };
      const result = reorderRuleSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("Given safetyQty of zero", () => {
    it("When parsed, Then it should pass validation", () => {
      const data = { ...validData, safetyQty: 0 };
      const result = reorderRuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
