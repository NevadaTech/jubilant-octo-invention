import { Entity } from "@/shared/domain";

export interface ComboItemProps {
  id: string;
  productId: string;
  quantity: number;
}

export interface ComboProps {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  isActive: boolean;
  orgId: string;
  items: ComboItemProps[];
  createdAt: string;
  updatedAt: string;
}

export class Combo extends Entity<string> {
  private readonly props: Omit<ComboProps, "id">;

  private constructor(id: string, props: Omit<ComboProps, "id">) {
    super(id);
    this.props = props;
  }

  static create(props: ComboProps): Combo {
    return new Combo(props.id, {
      sku: props.sku,
      name: props.name,
      description: props.description,
      price: props.price,
      currency: props.currency,
      isActive: props.isActive,
      orgId: props.orgId,
      items: props.items,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  get sku(): string {
    return this.props.sku;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null {
    return this.props.description;
  }

  get price(): number {
    return this.props.price;
  }

  get currency(): string {
    return this.props.currency;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get orgId(): string {
    return this.props.orgId;
  }

  get items(): ComboItemProps[] {
    return this.props.items;
  }

  get createdAt(): string {
    return this.props.createdAt;
  }

  get updatedAt(): string {
    return this.props.updatedAt;
  }

  toJSON() {
    return { id: this._id, ...this.props };
  }
}
