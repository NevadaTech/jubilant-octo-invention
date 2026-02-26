import { WorkflowService } from "@/shared/domain/services/workflow.service";

export type TransferWorkflowStatus =
  | "DRAFT"
  | "IN_TRANSIT"
  | "PARTIAL"
  | "RECEIVED"
  | "REJECTED"
  | "CANCELED";

export const transferWorkflow = new WorkflowService<TransferWorkflowStatus>(
  new Map<TransferWorkflowStatus, TransferWorkflowStatus[]>([
    ["DRAFT", ["IN_TRANSIT", "CANCELED"]],
    ["IN_TRANSIT", ["PARTIAL", "RECEIVED", "REJECTED", "CANCELED"]],
    ["PARTIAL", ["RECEIVED"]],
    ["RECEIVED", []],
    ["REJECTED", []],
    ["CANCELED", []],
  ]),
);
