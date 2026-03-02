import { describe, it, expect } from "vitest";
import { movementWorkflow } from "@/modules/inventory/domain/services/movement-workflow.service";

describe("Movement Workflow Service", () => {
  describe("canTransition", () => {
    it("Given: DRAFT status When: transitioning to POSTED Then: should return true", () => {
      // Act & Assert
      expect(movementWorkflow.canTransition("DRAFT", "POSTED")).toBe(true);
    });

    it("Given: POSTED status When: transitioning to VOID Then: should return true", () => {
      // Act & Assert
      expect(movementWorkflow.canTransition("POSTED", "VOID")).toBe(true);
    });

    it("Given: POSTED status When: transitioning to RETURNED Then: should return true", () => {
      // Act & Assert
      expect(movementWorkflow.canTransition("POSTED", "RETURNED")).toBe(true);
    });

    it("Given: DRAFT status When: transitioning to VOID Then: should return false", () => {
      // Act & Assert
      expect(movementWorkflow.canTransition("DRAFT", "VOID")).toBe(false);
    });

    it("Given: VOID status When: transitioning to any Then: should return false (terminal)", () => {
      // Act & Assert
      expect(movementWorkflow.canTransition("VOID", "DRAFT")).toBe(false);
      expect(movementWorkflow.canTransition("VOID", "POSTED")).toBe(false);
    });

    it("Given: RETURNED status When: transitioning to any Then: should return false (terminal)", () => {
      // Act & Assert
      expect(movementWorkflow.canTransition("RETURNED", "DRAFT")).toBe(false);
    });
  });

  describe("getAllowedTransitions", () => {
    it("Given: DRAFT status When: getting allowed Then: should return POSTED only", () => {
      // Act
      const result = movementWorkflow.getAllowedTransitions("DRAFT");

      // Assert
      expect(result).toEqual(["POSTED"]);
    });

    it("Given: POSTED status When: getting allowed Then: should return VOID and RETURNED", () => {
      // Act
      const result = movementWorkflow.getAllowedTransitions("POSTED");

      // Assert
      expect(result).toEqual(["VOID", "RETURNED"]);
    });

    it("Given: VOID status When: getting allowed Then: should return empty", () => {
      // Act
      const result = movementWorkflow.getAllowedTransitions("VOID");

      // Assert
      expect(result).toEqual([]);
    });
  });
});
