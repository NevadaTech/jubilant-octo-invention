import { AggregateRoot } from "@/shared/domain";
import { ValueObject } from "@/shared/domain/value-objects/value-object";
import { transferWorkflow } from "@/modules/inventory/domain/services/transfer-workflow.service";

export type TransferStatus =
  | "DRAFT"
  | "IN_TRANSIT"
  | "PARTIAL"
  | "RECEIVED"
  | "REJECTED"
  | "CANCELED";

export interface TransferLineProps {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  receivedQuantity: number | null;
}

export class TransferLine extends ValueObject<TransferLineProps> {
  private constructor(props: TransferLineProps) {
    super(props);
  }

  static create(props: TransferLineProps): TransferLine {
    return new TransferLine(props);
  }

  get id(): string {
    return this.props.id;
  }

  get productId(): string {
    return this.props.productId;
  }

  get productName(): string {
    return this.props.productName;
  }

  get productSku(): string {
    return this.props.productSku;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get receivedQuantity(): number | null {
    return this.props.receivedQuantity;
  }
}

export interface TransferProps {
  id: string;
  fromWarehouseId: string;
  fromWarehouseName: string;
  toWarehouseId: string;
  toWarehouseName: string;
  status: TransferStatus;
  notes: string | null;
  lines: TransferLine[];
  linesCount: number;
  createdBy: string;
  receivedBy: string | null;
  createdAt: Date;
  completedAt: Date | null;
}

export class Transfer extends AggregateRoot<string> {
  private readonly props: Omit<TransferProps, "id">;

  private constructor(id: string, props: Omit<TransferProps, "id">) {
    super(id);
    this.props = props;
  }

  static create(props: TransferProps): Transfer {
    return new Transfer(props.id, {
      fromWarehouseId: props.fromWarehouseId,
      fromWarehouseName: props.fromWarehouseName,
      toWarehouseId: props.toWarehouseId,
      toWarehouseName: props.toWarehouseName,
      status: props.status,
      notes: props.notes,
      lines: props.lines,
      linesCount: props.linesCount,
      createdBy: props.createdBy,
      receivedBy: props.receivedBy,
      createdAt: props.createdAt,
      completedAt: props.completedAt,
    });
  }

  get fromWarehouseId(): string {
    return this.props.fromWarehouseId;
  }

  get fromWarehouseName(): string {
    return this.props.fromWarehouseName;
  }

  get toWarehouseId(): string {
    return this.props.toWarehouseId;
  }

  get toWarehouseName(): string {
    return this.props.toWarehouseName;
  }

  get status(): TransferStatus {
    return this.props.status;
  }

  get notes(): string | null {
    return this.props.notes;
  }

  get lines(): TransferLine[] {
    return this.props.lines;
  }

  get linesCount(): number {
    return this.props.linesCount;
  }

  get totalItems(): number {
    return this.props.linesCount || this.props.lines.length;
  }

  get totalQuantity(): number {
    return this.props.lines.reduce((sum, line) => sum + line.quantity, 0);
  }

  get createdBy(): string {
    return this.props.createdBy;
  }

  get receivedBy(): string | null {
    return this.props.receivedBy;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get completedAt(): Date | null {
    return this.props.completedAt;
  }

  get isDraft(): boolean {
    return this.props.status === "DRAFT";
  }

  get isInTransit(): boolean {
    return this.props.status === "IN_TRANSIT";
  }

  get isPartial(): boolean {
    return this.props.status === "PARTIAL";
  }

  get isReceived(): boolean {
    return this.props.status === "RECEIVED";
  }

  get isRejected(): boolean {
    return this.props.status === "REJECTED";
  }

  get isCanceled(): boolean {
    return this.props.status === "CANCELED";
  }

  get canStartTransit(): boolean {
    return transferWorkflow.canTransition(this.props.status, "IN_TRANSIT");
  }

  get canReceive(): boolean {
    return transferWorkflow.canTransition(this.props.status, "RECEIVED");
  }

  get canReject(): boolean {
    return transferWorkflow.canTransition(this.props.status, "REJECTED");
  }

  get canCancel(): boolean {
    return transferWorkflow.canTransition(this.props.status, "CANCELED");
  }
}
