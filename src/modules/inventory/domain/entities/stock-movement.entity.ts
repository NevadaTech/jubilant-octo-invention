import { AggregateRoot } from "@/shared/domain";
import { ValueObject } from "@/shared/domain/value-objects/value-object";
import { movementWorkflow } from "@/modules/inventory/domain/services/movement-workflow.service";

export type MovementType =
  | "IN"
  | "OUT"
  | "ADJUST_IN"
  | "ADJUST_OUT"
  | "TRANSFER_IN"
  | "TRANSFER_OUT";

export type MovementStatus = "DRAFT" | "POSTED" | "VOID" | "RETURNED";

export interface MovementLineProps {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitCost: number | null;
  currency: string | null;
}

export class MovementLine extends ValueObject<MovementLineProps> {
  private constructor(props: MovementLineProps) {
    super(props);
  }

  static create(props: MovementLineProps): MovementLine {
    return new MovementLine(props);
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

  get unitCost(): number | null {
    return this.props.unitCost;
  }

  get currency(): string | null {
    return this.props.currency;
  }
}

export interface StockMovementProps {
  id: string;
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string | null;
  contactId: string | null;
  contactName: string | null;
  type: MovementType;
  status: MovementStatus;
  reference: string | null;
  reason: string | null;
  note: string | null;
  lines: MovementLine[];
  createdBy: string;
  createdByName: string | null;
  createdAt: Date;
  postedAt: Date | null;
  postedBy: string | null;
  postedByName: string | null;
  returnedAt: Date | null;
  returnedBy: string | null;
  returnedByName: string | null;
}

export class StockMovement extends AggregateRoot<string> {
  private readonly props: Omit<StockMovementProps, "id">;

  private constructor(id: string, props: Omit<StockMovementProps, "id">) {
    super(id);
    this.props = props;
  }

  static create(props: StockMovementProps): StockMovement {
    return new StockMovement(props.id, {
      warehouseId: props.warehouseId,
      warehouseName: props.warehouseName,
      warehouseCode: props.warehouseCode,
      contactId: props.contactId,
      contactName: props.contactName,
      type: props.type,
      status: props.status,
      reference: props.reference,
      reason: props.reason,
      note: props.note,
      lines: props.lines,
      createdBy: props.createdBy,
      createdByName: props.createdByName,
      createdAt: props.createdAt,
      postedAt: props.postedAt,
      postedBy: props.postedBy,
      postedByName: props.postedByName,
      returnedAt: props.returnedAt,
      returnedBy: props.returnedBy,
      returnedByName: props.returnedByName,
    });
  }

  get warehouseId(): string {
    return this.props.warehouseId;
  }

  get warehouseName(): string {
    return this.props.warehouseName;
  }

  get warehouseCode(): string | null {
    return this.props.warehouseCode;
  }

  get contactId(): string | null {
    return this.props.contactId;
  }

  get contactName(): string | null {
    return this.props.contactName;
  }

  get type(): MovementType {
    return this.props.type;
  }

  get status(): MovementStatus {
    return this.props.status;
  }

  get reference(): string | null {
    return this.props.reference;
  }

  get reason(): string | null {
    return this.props.reason;
  }

  get note(): string | null {
    return this.props.note;
  }

  get lines(): MovementLine[] {
    return this.props.lines;
  }

  get totalItems(): number {
    return this.props.lines.length;
  }

  get totalQuantity(): number {
    return this.props.lines.reduce((sum, line) => sum + line.quantity, 0);
  }

  get createdBy(): string {
    return this.props.createdBy;
  }

  get createdByName(): string | null {
    return this.props.createdByName;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get postedAt(): Date | null {
    return this.props.postedAt;
  }

  get postedBy(): string | null {
    return this.props.postedBy;
  }

  get postedByName(): string | null {
    return this.props.postedByName;
  }

  get returnedAt(): Date | null {
    return this.props.returnedAt;
  }

  get returnedBy(): string | null {
    return this.props.returnedBy;
  }

  get returnedByName(): string | null {
    return this.props.returnedByName;
  }

  toJSON() {
    return {
      id: this._id,
      ...this.props,
      lines: this.props.lines.map((l) => l.toJSON()),
    };
  }

  // Type helpers
  get isEntry(): boolean {
    return (
      this.props.type === "IN" ||
      this.props.type === "ADJUST_IN" ||
      this.props.type === "TRANSFER_IN"
    );
  }

  get isExit(): boolean {
    return (
      this.props.type === "OUT" ||
      this.props.type === "ADJUST_OUT" ||
      this.props.type === "TRANSFER_OUT"
    );
  }

  get isAdjustment(): boolean {
    return this.props.type === "ADJUST_IN" || this.props.type === "ADJUST_OUT";
  }

  get isTransfer(): boolean {
    return (
      this.props.type === "TRANSFER_IN" || this.props.type === "TRANSFER_OUT"
    );
  }

  // Status helpers
  get isDraft(): boolean {
    return this.props.status === "DRAFT";
  }

  get isPosted(): boolean {
    return this.props.status === "POSTED";
  }

  get isVoid(): boolean {
    return this.props.status === "VOID";
  }

  get isReturned(): boolean {
    return this.props.status === "RETURNED";
  }

  get canPost(): boolean {
    return movementWorkflow.canTransition(this.props.status, "POSTED");
  }

  get canVoid(): boolean {
    return movementWorkflow.canTransition(this.props.status, "VOID");
  }
}
