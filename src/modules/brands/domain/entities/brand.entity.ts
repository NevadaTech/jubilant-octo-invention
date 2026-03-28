import { Entity } from "@/shared/domain";

export interface BrandProps {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Brand extends Entity<string> {
  private readonly props: Omit<BrandProps, "id">;

  private constructor(id: string, props: Omit<BrandProps, "id">) {
    super(id);
    this.props = props;
  }

  static create(props: BrandProps): Brand {
    return new Brand(props.id, {
      name: props.name,
      description: props.description,
      isActive: props.isActive,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null {
    return this.props.description;
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

  toJSON() {
    return { id: this._id, ...this.props };
  }
}
