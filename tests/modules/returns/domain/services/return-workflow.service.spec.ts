import { describe, it, expect } from "vitest";
import { returnWorkflow } from "@/modules/returns/domain/services/return-workflow.service";

describe("Return Workflow Service", () => {
  describe("canTransition", () => {
    it("Given: DRAFT When: transitioning to CONFIRMED Then: should return true", () => {
      expect(returnWorkflow.canTransition("DRAFT", "CONFIRMED")).toBe(true);
    });

    it("Given: DRAFT When: transitioning to CANCELLED Then: should return true", () => {
      expect(returnWorkflow.canTransition("DRAFT", "CANCELLED")).toBe(true);
    });

    it("Given: CONFIRMED When: transitioning to CANCELLED Then: should return true", () => {
      expect(returnWorkflow.canTransition("CONFIRMED", "CANCELLED")).toBe(true);
    });

    it("Given: CANCELLED When: transitioning to any Then: should return false (terminal)", () => {
      expect(returnWorkflow.canTransition("CANCELLED", "DRAFT")).toBe(false);
      expect(returnWorkflow.canTransition("CANCELLED", "CONFIRMED")).toBe(
        false,
      );
    });

    it("Given: DRAFT When: transitioning to DRAFT Then: should return false (self)", () => {
      expect(returnWorkflow.canTransition("DRAFT", "DRAFT")).toBe(false);
    });
  });

  describe("getAllowedTransitions", () => {
    it("Given: DRAFT When: getting allowed Then: should return CONFIRMED and CANCELLED", () => {
      expect(returnWorkflow.getAllowedTransitions("DRAFT")).toEqual([
        "CONFIRMED",
        "CANCELLED",
      ]);
    });

    it("Given: CONFIRMED When: getting allowed Then: should return CANCELLED", () => {
      expect(returnWorkflow.getAllowedTransitions("CONFIRMED")).toEqual([
        "CANCELLED",
      ]);
    });

    it("Given: CANCELLED When: getting allowed Then: should return empty", () => {
      expect(returnWorkflow.getAllowedTransitions("CANCELLED")).toEqual([]);
    });
  });
});
