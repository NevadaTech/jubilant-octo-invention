import { Entity } from "@/shared/domain";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "STATUS_CHANGE"
  | "EXPORT"
  | "VIEW"
  | "ASSIGN"
  | "REMOVE";

export interface AuditLogProps {
  id: string;
  orgId: string | null;
  entityType: string;
  entityId: string | null;
  action: string;
  performedBy: string | null;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  httpMethod: string | null;
  httpUrl: string | null;
  httpStatusCode: number | null;
  duration: number | null;
  createdAt: Date;
}

export class AuditLog extends Entity<string> {
  private readonly props: Omit<AuditLogProps, "id">;

  private constructor(id: string, props: Omit<AuditLogProps, "id">) {
    super(id);
    this.props = props;
  }

  static create(props: AuditLogProps): AuditLog {
    return new AuditLog(props.id, {
      orgId: props.orgId,
      entityType: props.entityType,
      entityId: props.entityId,
      action: props.action,
      performedBy: props.performedBy,
      metadata: props.metadata,
      ipAddress: props.ipAddress,
      userAgent: props.userAgent,
      httpMethod: props.httpMethod,
      httpUrl: props.httpUrl,
      httpStatusCode: props.httpStatusCode,
      duration: props.duration,
      createdAt: props.createdAt,
    });
  }

  get orgId(): string | null {
    return this.props.orgId;
  }
  get entityType(): string {
    return this.props.entityType;
  }
  get entityId(): string | null {
    return this.props.entityId;
  }
  get action(): string {
    return this.props.action;
  }
  get performedBy(): string | null {
    return this.props.performedBy;
  }
  get metadata(): Record<string, unknown> {
    return this.props.metadata;
  }
  get ipAddress(): string | null {
    return this.props.ipAddress;
  }
  get userAgent(): string | null {
    return this.props.userAgent;
  }
  get httpMethod(): string | null {
    return this.props.httpMethod;
  }
  get httpUrl(): string | null {
    return this.props.httpUrl;
  }
  get httpStatusCode(): number | null {
    return this.props.httpStatusCode;
  }
  get duration(): number | null {
    return this.props.duration;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }

  get isSuccess(): boolean {
    return (
      this.props.httpStatusCode !== null &&
      this.props.httpStatusCode >= 200 &&
      this.props.httpStatusCode < 400
    );
  }

  get isError(): boolean {
    return (
      this.props.httpStatusCode !== null && this.props.httpStatusCode >= 400
    );
  }
}
