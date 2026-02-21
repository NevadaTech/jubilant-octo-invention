import { Entity } from "@/shared/domain";

export interface WarehouseProps {
  id: string;
  code: string;
  name: string;
  address: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  statusChangedBy?: string | null;
  statusChangedAt?: string | null;
}

export class Warehouse extends Entity<string> {
  private readonly props: Omit<WarehouseProps, "id">;

  private constructor(id: string, props: Omit<WarehouseProps, "id">) {
    super(id);
    this.props = props;
  }

  static create(props: WarehouseProps): Warehouse {
    return new Warehouse(props.id, {
      code: props.code,
      name: props.name,
      address: props.address,
      isActive: props.isActive,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      statusChangedBy: props.statusChangedBy ?? null,
      statusChangedAt: props.statusChangedAt ?? null,
    });
  }

  get code(): string {
    return this.props.code;
  }

  get name(): string {
    return this.props.name;
  }

  get address(): string | null {
    return this.props.address;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get statusChangedBy(): string | null | undefined {
    return this.props.statusChangedBy;
  }

  get statusChangedAt(): string | null | undefined {
    return this.props.statusChangedAt;
  }

  get displayName(): string {
    return `${this.props.code} - ${this.props.name}`;
  }
}
