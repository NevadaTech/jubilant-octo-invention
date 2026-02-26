import { WorkflowService } from "@/shared/domain/services/workflow.service";

export type ReturnStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

export const returnWorkflow = new WorkflowService<ReturnStatus>(
  new Map<ReturnStatus, ReturnStatus[]>([
    ["DRAFT", ["CONFIRMED", "CANCELLED"]],
    ["CONFIRMED", ["CANCELLED"]],
    ["CANCELLED", []],
  ]),
);
