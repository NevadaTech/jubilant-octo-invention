import { Entity } from "@/shared/domain";

export interface CompanyProps {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Company extends Entity<string> {
  private readonly props: Omit<CompanyProps, "id">;

  private constructor(id: string, props: Omit<CompanyProps, "id">) {
    super(id);
    this.props = props;
  }

  static create(props: CompanyProps): Company {
    return new Company(props.id, {
      name: props.name,
      code: props.code,
      description: props.description,
      isActive: props.isActive,
      productCount: props.productCount,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  get name(): string {
    return this.props.name;
  }

  get code(): string {
    return this.props.code;
  }

  get description(): string | null {
    return this.props.description;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get productCount(): number {
    return this.props.productCount;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get hasProducts(): boolean {
    return this.props.productCount > 0;
  }

  get canDelete(): boolean {
    return this.props.productCount === 0;
  }
}
