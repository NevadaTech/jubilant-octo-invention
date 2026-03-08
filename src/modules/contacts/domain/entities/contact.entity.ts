import { Entity } from "@/shared/domain";

export type ContactType = "CUSTOMER" | "SUPPLIER";

export interface ContactProps {
  id: string;
  name: string;
  identification: string;
  type: ContactType;
  address: string | null;
  notes: string | null;
  isActive: boolean;
  salesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Contact extends Entity<string> {
  private readonly props: Omit<ContactProps, "id">;

  private constructor(id: string, props: Omit<ContactProps, "id">) {
    super(id);
    this.props = props;
  }

  static create(props: ContactProps): Contact {
    return new Contact(props.id, {
      name: props.name,
      identification: props.identification,
      type: props.type,
      address: props.address,
      notes: props.notes,
      isActive: props.isActive,
      salesCount: props.salesCount,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  get name(): string {
    return this.props.name;
  }
  get identification(): string {
    return this.props.identification;
  }
  get type(): ContactType {
    return this.props.type;
  }
  get address(): string | null {
    return this.props.address;
  }
  get notes(): string | null {
    return this.props.notes;
  }
  get isActive(): boolean {
    return this.props.isActive;
  }
  get salesCount(): number {
    return this.props.salesCount;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get isCustomer(): boolean {
    return this.props.type === "CUSTOMER";
  }
  get isSupplier(): boolean {
    return this.props.type === "SUPPLIER";
  }
}
