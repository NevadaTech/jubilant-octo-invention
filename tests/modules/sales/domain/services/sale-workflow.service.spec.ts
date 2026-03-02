import { describe, it, expect } from "vitest";
import { saleWorkflow } from "@/modules/sales/domain/services/sale-workflow.service";

describe("Sale Workflow Service", () => {
  describe("canTransition", () => {
    it("Given: DRAFT When: transitioning to CONFIRMED Then: should return true", () => {
      expect(saleWorkflow.canTransition("DRAFT", "CONFIRMED")).toBe(true);
    });

    it("Given: DRAFT When: transitioning to CANCELLED Then: should return true", () => {
      expect(saleWorkflow.canTransition("DRAFT", "CANCELLED")).toBe(true);
    });

    it("Given: CONFIRMED When: transitioning to PICKING Then: should return true", () => {
      expect(saleWorkflow.canTransition("CONFIRMED", "PICKING")).toBe(true);
    });

    it("Given: CONFIRMED When: transitioning to CANCELLED Then: should return true", () => {
      expect(saleWorkflow.canTransition("CONFIRMED", "CANCELLED")).toBe(true);
    });

    it("Given: PICKING When: transitioning to SHIPPED Then: should return true", () => {
      expect(saleWorkflow.canTransition("PICKING", "SHIPPED")).toBe(true);
    });

    it("Given: SHIPPED When: transitioning to COMPLETED Then: should return true", () => {
      expect(saleWorkflow.canTransition("SHIPPED", "COMPLETED")).toBe(true);
    });

    it("Given: COMPLETED When: transitioning to RETURNED Then: should return true", () => {
      expect(saleWorkflow.canTransition("COMPLETED", "RETURNED")).toBe(true);
    });

    it("Given: DRAFT When: transitioning to SHIPPED Then: should return false (skip)", () => {
      expect(saleWorkflow.canTransition("DRAFT", "SHIPPED")).toBe(false);
    });

    it("Given: CANCELLED When: transitioning to any Then: should return false (terminal)", () => {
      expect(saleWorkflow.canTransition("CANCELLED", "DRAFT")).toBe(false);
      expect(saleWorkflow.canTransition("CANCELLED", "CONFIRMED")).toBe(false);
    });

    it("Given: RETURNED When: transitioning to any Then: should return false (terminal)", () => {
      expect(saleWorkflow.canTransition("RETURNED", "DRAFT")).toBe(false);
    });
  });

  describe("getAllowedTransitions", () => {
    it("Given: DRAFT When: getting allowed Then: should return CONFIRMED and CANCELLED", () => {
      expect(saleWorkflow.getAllowedTransitions("DRAFT")).toEqual([
        "CONFIRMED",
        "CANCELLED",
      ]);
    });

    it("Given: CONFIRMED When: getting allowed Then: should return PICKING and CANCELLED", () => {
      expect(saleWorkflow.getAllowedTransitions("CONFIRMED")).toEqual([
        "PICKING",
        "CANCELLED",
      ]);
    });

    it("Given: SHIPPED When: getting allowed Then: should return COMPLETED only", () => {
      expect(saleWorkflow.getAllowedTransitions("SHIPPED")).toEqual([
        "COMPLETED",
      ]);
    });

    it("Given: CANCELLED When: getting allowed Then: should return empty", () => {
      expect(saleWorkflow.getAllowedTransitions("CANCELLED")).toEqual([]);
    });
  });
});
