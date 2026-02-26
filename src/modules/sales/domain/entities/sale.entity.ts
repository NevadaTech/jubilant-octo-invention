import { AggregateRoot } from "@/shared/domain";
import { ValueObject } from "@/shared/domain/value-objects/value-object";
import { saleWorkflow } from "@/modules/sales/domain/services/sale-workflow.service";

export type SaleStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "PICKING"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED"
  | "RETURNED";

export interface SaleLineProps {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  salePrice: number;
  currency: string;
  totalPrice: number;
}

export interface SaleProps {
  id: string;
  saleNumber: string;
  status: SaleStatus;
  warehouseId: string;
  warehouseName: string;
  customerReference: string | null;
  externalReference: string | null;
  note: string | null;
  totalAmount: number;
  currency: string;
  lines: SaleLine[];
  movementId: string | null;
  createdBy: string;
  createdByName: string | null;
  createdAt: Date;
  confirmedAt: Date | null;
  confirmedBy: string | null;
  confirmedByName: string | null;
  cancelledAt: Date | null;
  cancelledBy: string | null;
  cancelledByName: string | null;
  pickedAt: Date | null;
  pickedBy: string | null;
  pickedByName: string | null;
  shippedAt: Date | null;
  shippedBy: string | null;
  shippedByName: string | null;
  trackingNumber: string | null;
  shippingCarrier: string | null;
  shippingNotes: string | null;
  completedAt: Date | null;
  completedBy: string | null;
  completedByName: string | null;
  returnedAt: Date | null;
  returnedBy: string | null;
  returnedByName: string | null;
  pickingEnabled: boolean;
}

export class SaleLine extends ValueObject<SaleLineProps> {
  private constructor(props: SaleLineProps) {
    super(props);
  }

  static create(props: SaleLineProps): SaleLine {
    return new SaleLine(props);
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

  get salePrice(): number {
    return this.props.salePrice;
  }

  get currency(): string {
    return this.props.currency;
  }

  get totalPrice(): number {
    return this.props.totalPrice;
  }
}

export class Sale extends AggregateRoot<string> {
  private readonly props: Omit<SaleProps, "id">;

  private constructor(id: string, props: Omit<SaleProps, "id">) {
    super(id);
    this.props = props;
  }

  static create(props: SaleProps): Sale {
    return new Sale(props.id, {
      saleNumber: props.saleNumber,
      status: props.status,
      warehouseId: props.warehouseId,
      warehouseName: props.warehouseName,
      customerReference: props.customerReference,
      externalReference: props.externalReference,
      note: props.note,
      totalAmount: props.totalAmount,
      currency: props.currency,
      lines: props.lines,
      movementId: props.movementId,
      createdBy: props.createdBy,
      createdByName: props.createdByName,
      createdAt: props.createdAt,
      confirmedAt: props.confirmedAt,
      confirmedBy: props.confirmedBy,
      confirmedByName: props.confirmedByName,
      cancelledAt: props.cancelledAt,
      cancelledBy: props.cancelledBy,
      cancelledByName: props.cancelledByName,
      pickedAt: props.pickedAt,
      pickedBy: props.pickedBy,
      pickedByName: props.pickedByName,
      shippedAt: props.shippedAt,
      shippedBy: props.shippedBy,
      shippedByName: props.shippedByName,
      trackingNumber: props.trackingNumber,
      shippingCarrier: props.shippingCarrier,
      shippingNotes: props.shippingNotes,
      completedAt: props.completedAt,
      completedBy: props.completedBy,
      completedByName: props.completedByName,
      returnedAt: props.returnedAt,
      returnedBy: props.returnedBy,
      returnedByName: props.returnedByName,
      pickingEnabled: props.pickingEnabled,
    });
  }

  get saleNumber(): string {
    return this.props.saleNumber;
  }

  get status(): SaleStatus {
    return this.props.status;
  }

  get warehouseId(): string {
    return this.props.warehouseId;
  }

  get warehouseName(): string {
    return this.props.warehouseName;
  }

  get customerReference(): string | null {
    return this.props.customerReference;
  }

  get externalReference(): string | null {
    return this.props.externalReference;
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

  get lines(): SaleLine[] {
    return this.props.lines;
  }

  get totalItems(): number {
    return this.props.lines.length;
  }

  get totalQuantity(): number {
    return this.props.lines.reduce((sum, line) => sum + line.quantity, 0);
  }

  get movementId(): string | null {
    return this.props.movementId;
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

  get confirmedAt(): Date | null {
    return this.props.confirmedAt;
  }

  get confirmedBy(): string | null {
    return this.props.confirmedBy;
  }

  get confirmedByName(): string | null {
    return this.props.confirmedByName;
  }

  get cancelledAt(): Date | null {
    return this.props.cancelledAt;
  }

  get cancelledBy(): string | null {
    return this.props.cancelledBy;
  }

  get cancelledByName(): string | null {
    return this.props.cancelledByName;
  }

  get pickedAt(): Date | null {
    return this.props.pickedAt;
  }

  get pickedBy(): string | null {
    return this.props.pickedBy;
  }

  get pickedByName(): string | null {
    return this.props.pickedByName;
  }

  get shippedAt(): Date | null {
    return this.props.shippedAt;
  }

  get shippedBy(): string | null {
    return this.props.shippedBy;
  }

  get shippedByName(): string | null {
    return this.props.shippedByName;
  }

  get trackingNumber(): string | null {
    return this.props.trackingNumber;
  }

  get shippingCarrier(): string | null {
    return this.props.shippingCarrier;
  }

  get shippingNotes(): string | null {
    return this.props.shippingNotes;
  }

  get completedAt(): Date | null {
    return this.props.completedAt;
  }

  get completedBy(): string | null {
    return this.props.completedBy;
  }

  get completedByName(): string | null {
    return this.props.completedByName;
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

  get pickingEnabled(): boolean {
    return this.props.pickingEnabled;
  }

  // Status helpers
  get isDraft(): boolean {
    return this.props.status === "DRAFT";
  }

  get isConfirmed(): boolean {
    return this.props.status === "CONFIRMED";
  }

  get isPicking(): boolean {
    return this.props.status === "PICKING";
  }

  get isShipped(): boolean {
    return this.props.status === "SHIPPED";
  }

  get isCompleted(): boolean {
    return this.props.status === "COMPLETED";
  }

  get isCancelled(): boolean {
    return this.props.status === "CANCELLED";
  }

  get isReturned(): boolean {
    return this.props.status === "RETURNED";
  }

  get canConfirm(): boolean {
    return (
      saleWorkflow.canTransition(this.props.status, "CONFIRMED") &&
      this.props.lines.length > 0
    );
  }

  get canStartPicking(): boolean {
    return (
      saleWorkflow.canTransition(this.props.status, "PICKING") &&
      this.props.pickingEnabled
    );
  }

  get canShip(): boolean {
    return (
      saleWorkflow.canTransition(this.props.status, "SHIPPED") &&
      this.props.pickingEnabled
    );
  }

  get canComplete(): boolean {
    return (
      saleWorkflow.canTransition(this.props.status, "COMPLETED") &&
      this.props.pickingEnabled
    );
  }

  get canCancel(): boolean {
    return saleWorkflow.canTransition(this.props.status, "CANCELLED");
  }

  get canEdit(): boolean {
    return this.props.status === "DRAFT";
  }

  get canAddLines(): boolean {
    return this.props.status === "DRAFT";
  }
}
