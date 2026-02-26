import { WorkflowService } from "@/shared/domain/services/workflow.service";

export type MovementStatus = "DRAFT" | "POSTED" | "VOID" | "RETURNED";

export const movementWorkflow = new WorkflowService<MovementStatus>(
  new Map<MovementStatus, MovementStatus[]>([
    ["DRAFT", ["POSTED"]],
    ["POSTED", ["VOID", "RETURNED"]],
    ["VOID", []],
    ["RETURNED", []],
  ]),
);
