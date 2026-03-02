import { describe, it, expect } from "vitest";
import { WorkflowService } from "@/shared/domain/services/workflow.service";

type TestStatus = "DRAFT" | "ACTIVE" | "CLOSED" | "CANCELLED";

describe("WorkflowService", () => {
  const transitions = new Map<TestStatus, TestStatus[]>([
    ["DRAFT", ["ACTIVE", "CANCELLED"]],
    ["ACTIVE", ["CLOSED", "CANCELLED"]],
    ["CLOSED", []],
    ["CANCELLED", []],
  ]);
  const workflow = new WorkflowService<TestStatus>(transitions);

  describe("canTransition", () => {
    it("Given: valid transition When: checking Then: should return true", () => {
      // Act
      const result = workflow.canTransition("DRAFT", "ACTIVE");

      // Assert
      expect(result).toBe(true);
    });

    it("Given: another valid transition When: checking Then: should return true", () => {
      // Act
      const result = workflow.canTransition("ACTIVE", "CLOSED");

      // Assert
      expect(result).toBe(true);
    });

    it("Given: DRAFT to CANCELLED transition When: checking Then: should return true", () => {
      // Act
      const result = workflow.canTransition("DRAFT", "CANCELLED");

      // Assert
      expect(result).toBe(true);
    });

    it("Given: ACTIVE to CANCELLED transition When: checking Then: should return true", () => {
      // Act
      const result = workflow.canTransition("ACTIVE", "CANCELLED");

      // Assert
      expect(result).toBe(true);
    });

    it("Given: invalid transition When: checking Then: should return false", () => {
      // Act
      const result = workflow.canTransition("DRAFT", "CLOSED");

      // Assert
      expect(result).toBe(false);
    });

    it("Given: reverse transition When: checking Then: should return false", () => {
      // Act
      const result = workflow.canTransition("ACTIVE", "DRAFT");

      // Assert
      expect(result).toBe(false);
    });

    it("Given: terminal state When: checking any transition Then: should return false", () => {
      // Act
      const result = workflow.canTransition("CLOSED", "DRAFT");

      // Assert
      expect(result).toBe(false);
    });

    it("Given: another terminal state When: checking any transition Then: should return false", () => {
      // Act
      const result = workflow.canTransition("CANCELLED", "ACTIVE");

      // Assert
      expect(result).toBe(false);
    });

    it("Given: same state transition When: checking Then: should return false", () => {
      // Act
      const result = workflow.canTransition("DRAFT", "DRAFT");

      // Assert
      expect(result).toBe(false);
    });

    it("Given: unknown source state When: checking Then: should return false", () => {
      // Act
      const result = workflow.canTransition("UNKNOWN" as TestStatus, "ACTIVE");

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("getAllowedTransitions", () => {
    it("Given: state with multiple transitions When: getting allowed Then: should return all options", () => {
      // Act
      const result = workflow.getAllowedTransitions("DRAFT");

      // Assert
      expect(result).toEqual(["ACTIVE", "CANCELLED"]);
    });

    it("Given: state with two transitions When: getting allowed Then: should return both options", () => {
      // Act
      const result = workflow.getAllowedTransitions("ACTIVE");

      // Assert
      expect(result).toEqual(["CLOSED", "CANCELLED"]);
    });

    it("Given: terminal state CLOSED When: getting allowed Then: should return empty array", () => {
      // Act
      const result = workflow.getAllowedTransitions("CLOSED");

      // Assert
      expect(result).toEqual([]);
    });

    it("Given: terminal state CANCELLED When: getting allowed Then: should return empty array", () => {
      // Act
      const result = workflow.getAllowedTransitions("CANCELLED");

      // Assert
      expect(result).toEqual([]);
    });

    it("Given: unknown state When: getting allowed Then: should return empty array", () => {
      // Act
      const result = workflow.getAllowedTransitions("UNKNOWN" as TestStatus);

      // Assert
      expect(result).toEqual([]);
    });
  });

  // ── Complex workflow scenario (sale-like) ────────────────────────────

  describe("complex workflow", () => {
    type SaleStatus =
      | "DRAFT"
      | "CONFIRMED"
      | "PICKING"
      | "SHIPPED"
      | "COMPLETED"
      | "CANCELLED";

    const saleTransitions = new Map<SaleStatus, SaleStatus[]>([
      ["DRAFT", ["CONFIRMED", "CANCELLED"]],
      ["CONFIRMED", ["PICKING", "CANCELLED"]],
      ["PICKING", ["SHIPPED", "CANCELLED"]],
      ["SHIPPED", ["COMPLETED"]],
      ["COMPLETED", []],
      ["CANCELLED", []],
    ]);

    const saleWorkflow = new WorkflowService<SaleStatus>(saleTransitions);

    it("Given: a sale workflow When: following the happy path Then: all sequential transitions should be valid", () => {
      // Assert
      expect(saleWorkflow.canTransition("DRAFT", "CONFIRMED")).toBe(true);
      expect(saleWorkflow.canTransition("CONFIRMED", "PICKING")).toBe(true);
      expect(saleWorkflow.canTransition("PICKING", "SHIPPED")).toBe(true);
      expect(saleWorkflow.canTransition("SHIPPED", "COMPLETED")).toBe(true);
    });

    it("Given: a sale workflow When: skipping a step Then: should return false", () => {
      // Assert
      expect(saleWorkflow.canTransition("DRAFT", "SHIPPED")).toBe(false);
      expect(saleWorkflow.canTransition("CONFIRMED", "COMPLETED")).toBe(false);
    });

    it("Given: SHIPPED status When: getting allowed transitions Then: should only allow COMPLETED", () => {
      // Act
      const result = saleWorkflow.getAllowedTransitions("SHIPPED");

      // Assert
      expect(result).toEqual(["COMPLETED"]);
    });

    it("Given: COMPLETED status When: checking any transition Then: should not allow any", () => {
      // Assert
      expect(saleWorkflow.getAllowedTransitions("COMPLETED")).toEqual([]);
      expect(saleWorkflow.canTransition("COMPLETED", "DRAFT")).toBe(false);
      expect(saleWorkflow.canTransition("COMPLETED", "CANCELLED")).toBe(false);
    });
  });
});
