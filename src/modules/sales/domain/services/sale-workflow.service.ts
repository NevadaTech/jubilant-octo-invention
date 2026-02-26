import { WorkflowService } from "@/shared/domain/services/workflow.service";

export type SaleStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "PICKING"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED"
  | "RETURNED";

export const saleWorkflow = new WorkflowService<SaleStatus>(
  new Map<SaleStatus, SaleStatus[]>([
    ["DRAFT", ["CONFIRMED", "CANCELLED"]],
    ["CONFIRMED", ["PICKING", "CANCELLED"]],
    ["PICKING", ["SHIPPED", "CANCELLED"]],
    ["SHIPPED", ["COMPLETED"]],
    ["COMPLETED", ["RETURNED"]],
    ["CANCELLED", []],
    ["RETURNED", []],
  ]),
);
