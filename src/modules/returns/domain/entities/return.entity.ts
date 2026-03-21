import { AggregateRoot } from "@/shared/domain";
import { ValueObject } from "@/shared/domain/value-objects/value-object";
import { returnWorkflow } from "@/modules/returns/domain/services/return-workflow.service";

export type ReturnStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";
export type ReturnType = "RETURN_CUSTOMER" | "RETURN_SUPPLIER";

export interface ReturnLineProps {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  comboId?: string | null;
  quantity: number;
  originalSalePrice: number | null;
  originalUnitCost: number | null;
  currency: string;
  totalPrice: number;
}

export class ReturnLine extends ValueObject<ReturnLineProps> {
  private constructor(props: ReturnLineProps) {
    super(props);
  }

  static create(props: ReturnLineProps): ReturnLine {
    return new ReturnLine(props);
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

  get comboId(): string | null | undefined {
    return this.props.comboId;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get originalSalePrice(): number | null {
    return this.props.originalSalePrice;
  }

  get originalUnitCost(): number | null {
    return this.props.originalUnitCost;
  }

  get currency(): string {
    return this.props.currency;
  }

  get totalPrice(): number {
    return this.props.totalPrice;
  }
}

export interface ReturnProps {
  id: string;
  returnNumber: string;
  status: ReturnStatus;
  type: ReturnType;
  reason: string | null;
  warehouseId: string;
  warehouseName: string;
  saleId: string | null;
  saleNumber: string | null;
  sourceMovementId: string | null;
  returnMovementId: string | null;
  note: string | null;
  totalAmount: number;
  currency: string;
  lines: ReturnLine[];
  createdBy: string;
  createdAt: Date;
  confirmedAt: Date | null;
  cancelledAt: Date | null;
}

export class Return extends AggregateRoot<string> {
  private readonly props: Omit<ReturnProps, "id">;

  private constructor(id: string, props: Omit<ReturnProps, "id">) {
    super(id);
    this.props = props;
  }

  static create(props: ReturnProps): Return {
    return new Return(props.id, {
      returnNumber: props.returnNumber,
      status: props.status,
      type: props.type,
      reason: props.reason,
      warehouseId: props.warehouseId,
      warehouseName: props.warehouseName,
      saleId: props.saleId,
      saleNumber: props.saleNumber,
      sourceMovementId: props.sourceMovementId,
      returnMovementId: props.returnMovementId,
      note: props.note,
      totalAmount: props.totalAmount,
      currency: props.currency,
      lines: props.lines,
      createdBy: props.createdBy,
      createdAt: props.createdAt,
      confirmedAt: props.confirmedAt,
      cancelledAt: props.cancelledAt,
    });
  }

  get returnNumber(): string {
    return this.props.returnNumber;
  }

  get status(): ReturnStatus {
    return this.props.status;
  }

  get type(): ReturnType {
    return this.props.type;
  }

  get reason(): string | null {
    return this.props.reason;
  }

  get warehouseId(): string {
    return this.props.warehouseId;
  }

  get warehouseName(): string {
    return this.props.warehouseName;
  }

  get saleId(): string | null {
    return this.props.saleId;
  }

  get saleNumber(): string | null {
    return this.props.saleNumber;
  }

  get sourceMovementId(): string | null {
    return this.props.sourceMovementId;
  }

  get returnMovementId(): string | null {
    return this.props.returnMovementId;
  }

  get note(): string | null {
    return this.props.note;
  }

  get totalAmount(): number {
    return this.props.totalAmount;
  }

  get currency(): string {
    return this.props.currency;
  }

  get lines(): ReturnLine[] {
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

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get confirmedAt(): Date | null {
    return this.props.confirmedAt;
  }

  get cancelledAt(): Date | null {
    return this.props.cancelledAt;
  }

  toJSON() {
    return {
      id: this._id,
      ...this.props,
      lines: this.props.lines.map((l) => l.toJSON()),
      // Computed properties — included so they survive SSR hydration
      // (dehydrateState serializes class instances to plain objects)
      canConfirm: this.canConfirm,
      canCancel: this.canCancel,
      canEdit: this.canEdit,
      totalItems: this.totalItems,
      totalQuantity: this.totalQuantity,
      lineCount: this.lineCount,
      isDraft: this.isDraft,
      isConfirmed: this.isConfirmed,
      isCancelled: this.isCancelled,
      isCustomerReturn: this.isCustomerReturn,
      isSupplierReturn: this.isSupplierReturn,
    };
  }

  // Type helpers
  get isCustomerReturn(): boolean {
    return this.props.type === "RETURN_CUSTOMER";
  }

  get isSupplierReturn(): boolean {
    return this.props.type === "RETURN_SUPPLIER";
  }

  // Status helpers
  get isDraft(): boolean {
    return this.props.status === "DRAFT";
  }

  get isConfirmed(): boolean {
    return this.props.status === "CONFIRMED";
  }

  get isCancelled(): boolean {
    return this.props.status === "CANCELLED";
  }

  get canConfirm(): boolean {
    return (
      returnWorkflow.canTransition(this.props.status, "CONFIRMED") &&
      this.props.lines.length > 0
    );
  }

  get canCancel(): boolean {
    return returnWorkflow.canTransition(this.props.status, "CANCELLED");
  }

  get canEdit(): boolean {
    return this.props.status === "DRAFT";
  }

  /** Total number of line items */
  get lineCount(): number {
    return this.props.lines?.length ?? 0;
  }
}
