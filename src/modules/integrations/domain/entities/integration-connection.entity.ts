import { Entity } from "@/shared/domain";

export type IntegrationProvider = "VTEX" | "MERCADOLIBRE";
export type ConnectionStatus = "CONNECTED" | "DISCONNECTED" | "ERROR";
export type SyncStrategy = "WEBHOOK" | "POLLING" | "BOTH";
export type SyncDirection = "INBOUND" | "OUTBOUND" | "BIDIRECTIONAL";
export type TokenStatus =
  | "VALID"
  | "REFRESHING"
  | "EXPIRED"
  | "REAUTH_REQUIRED";

export interface IntegrationConnectionProps {
  id: string;
  provider: IntegrationProvider;
  accountName: string;
  storeName: string;
  status: ConnectionStatus;
  syncStrategy: SyncStrategy;
  syncDirection: SyncDirection;
  defaultWarehouseId: string;
  warehouseName: string | null;
  defaultContactId: string | null;
  defaultContactName: string | null;
  companyId: string | null;
  companyName: string | null;
  connectedAt: Date | null;
  lastSyncAt: Date | null;
  lastSyncError: string | null;
  syncedOrdersCount: number;
  webhookSecret: string | null;
  tokenStatus: TokenStatus | null;
  meliUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class IntegrationConnection extends Entity<string> {
  private readonly props: Omit<IntegrationConnectionProps, "id">;

  private constructor(
    id: string,
    props: Omit<IntegrationConnectionProps, "id">,
  ) {
    super(id);
    this.props = props;
  }

  static create(props: IntegrationConnectionProps): IntegrationConnection {
    return new IntegrationConnection(props.id, {
      provider: props.provider,
      accountName: props.accountName,
      storeName: props.storeName,
      status: props.status,
      syncStrategy: props.syncStrategy,
      syncDirection: props.syncDirection,
      defaultWarehouseId: props.defaultWarehouseId,
      warehouseName: props.warehouseName,
      defaultContactId: props.defaultContactId,
      defaultContactName: props.defaultContactName,
      companyId: props.companyId,
      companyName: props.companyName,
      connectedAt: props.connectedAt,
      lastSyncAt: props.lastSyncAt,
      lastSyncError: props.lastSyncError,
      syncedOrdersCount: props.syncedOrdersCount,
      webhookSecret: props.webhookSecret,
      tokenStatus: props.tokenStatus,
      meliUserId: props.meliUserId,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  get provider(): IntegrationProvider {
    return this.props.provider;
  }
  get accountName(): string {
    return this.props.accountName;
  }
  get storeName(): string {
    return this.props.storeName;
  }
  get status(): ConnectionStatus {
    return this.props.status;
  }
  get syncStrategy(): SyncStrategy {
    return this.props.syncStrategy;
  }
  get syncDirection(): SyncDirection {
    return this.props.syncDirection;
  }
  get defaultWarehouseId(): string {
    return this.props.defaultWarehouseId;
  }
  get warehouseName(): string | null {
    return this.props.warehouseName;
  }
  get defaultContactId(): string | null {
    return this.props.defaultContactId;
  }
  get defaultContactName(): string | null {
    return this.props.defaultContactName;
  }
  get companyId(): string | null {
    return this.props.companyId;
  }
  get companyName(): string | null {
    return this.props.companyName;
  }
  get connectedAt(): Date | null {
    return this.props.connectedAt;
  }
  get lastSyncAt(): Date | null {
    return this.props.lastSyncAt;
  }
  get lastSyncError(): string | null {
    return this.props.lastSyncError;
  }
  get syncedOrdersCount(): number {
    return this.props.syncedOrdersCount;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get webhookSecret(): string | null {
    return this.props.webhookSecret;
  }
  get tokenStatus(): TokenStatus | null {
    return this.props.tokenStatus;
  }
  get meliUserId(): string | null {
    return this.props.meliUserId;
  }

  get isConnected(): boolean {
    return this.props.status === "CONNECTED";
  }
  get hasError(): boolean {
    return this.props.status === "ERROR";
  }
  get needsReauth(): boolean {
    return this.props.tokenStatus === "REAUTH_REQUIRED";
  }
}
