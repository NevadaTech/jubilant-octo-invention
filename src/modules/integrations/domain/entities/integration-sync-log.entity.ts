import { Entity } from "@/shared/domain";

export type SyncAction = "SYNCED" | "FAILED" | "PARTIAL" | "ALREADY_SYNCED";

export interface SyncLogOrderItem {
  name: string;
  sku: string | null;
  quantity: number;
  price: number;
}

export interface IntegrationSyncLogProps {
  id: string;
  connectionId: string;
  externalOrderId: string;
  externalOrderStatus: string | null;
  action: SyncAction;
  saleId: string | null;
  saleNumber: string | null;
  contactId: string | null;
  contactName: string | null;
  errorMessage: string | null;
  rawPayload: unknown | null;
  externalOrderDate: Date | null;
  orderItems: SyncLogOrderItem[];
  processedAt: Date;
}

export class IntegrationSyncLog extends Entity<string> {
  private readonly props: Omit<IntegrationSyncLogProps, "id">;

  private constructor(id: string, props: Omit<IntegrationSyncLogProps, "id">) {
    super(id);
    this.props = props;
  }

  static create(props: IntegrationSyncLogProps): IntegrationSyncLog {
    return new IntegrationSyncLog(props.id, {
      connectionId: props.connectionId,
      externalOrderId: props.externalOrderId,
      externalOrderStatus: props.externalOrderStatus,
      action: props.action,
      saleId: props.saleId,
      saleNumber: props.saleNumber,
      contactId: props.contactId,
      contactName: props.contactName,
      errorMessage: props.errorMessage,
      rawPayload: props.rawPayload,
      externalOrderDate: props.externalOrderDate,
      orderItems: props.orderItems,
      processedAt: props.processedAt,
    });
  }

  get connectionId(): string {
    return this.props.connectionId;
  }
  get externalOrderId(): string {
    return this.props.externalOrderId;
  }
  get externalOrderStatus(): string | null {
    return this.props.externalOrderStatus;
  }
  get action(): SyncAction {
    return this.props.action;
  }
  get saleId(): string | null {
    return this.props.saleId;
  }
  get saleNumber(): string | null {
    return this.props.saleNumber;
  }
  get contactId(): string | null {
    return this.props.contactId;
  }
  get contactName(): string | null {
    return this.props.contactName;
  }
  get errorMessage(): string | null {
    return this.props.errorMessage;
  }
  get rawPayload(): unknown | null {
    return this.props.rawPayload;
  }
  get externalOrderDate(): Date | null {
    return this.props.externalOrderDate;
  }
  get orderItems(): SyncLogOrderItem[] {
    return this.props.orderItems;
  }
  get processedAt(): Date {
    return this.props.processedAt;
  }

  toJSON() {
    return { id: this._id, ...this.props };
  }

  get isFailed(): boolean {
    return this.props.action === "FAILED";
  }
  get isPartial(): boolean {
    return this.props.action === "PARTIAL";
  }
  get isRetriable(): boolean {
    return this.props.action === "FAILED" || this.props.action === "PARTIAL";
  }
  get isSynced(): boolean {
    return this.props.action === "SYNCED";
  }
}
