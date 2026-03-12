import { Entity } from "@/shared/domain";

export type SyncAction = "SYNCED" | "FAILED" | "ALREADY_SYNCED";

export interface IntegrationSyncLogProps {
  id: string;
  connectionId: string;
  externalOrderId: string;
  action: SyncAction;
  saleId: string | null;
  saleNumber: string | null;
  contactId: string | null;
  errorMessage: string | null;
  rawPayload: unknown | null;
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
      action: props.action,
      saleId: props.saleId,
      saleNumber: props.saleNumber,
      contactId: props.contactId,
      errorMessage: props.errorMessage,
      rawPayload: props.rawPayload,
      processedAt: props.processedAt,
    });
  }

  get connectionId(): string {
    return this.props.connectionId;
  }
  get externalOrderId(): string {
    return this.props.externalOrderId;
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
  get errorMessage(): string | null {
    return this.props.errorMessage;
  }
  get rawPayload(): unknown | null {
    return this.props.rawPayload;
  }
  get processedAt(): Date {
    return this.props.processedAt;
  }

  get isFailed(): boolean {
    return this.props.action === "FAILED";
  }
  get isSynced(): boolean {
    return this.props.action === "SYNCED";
  }
}
