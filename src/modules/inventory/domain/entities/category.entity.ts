import { Entity } from "@/shared/domain";

export interface CategoryProps {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  parentName: string | null;
  isActive: boolean;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Category extends Entity<string> {
  private readonly props: Omit<CategoryProps, "id">;

  private constructor(id: string, props: Omit<CategoryProps, "id">) {
    super(id);
    this.props = props;
  }

  static create(props: CategoryProps): Category {
    return new Category(props.id, {
      name: props.name,
      description: props.description,
      parentId: props.parentId,
      parentName: props.parentName,
      isActive: props.isActive,
      productCount: props.productCount,
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

  get parentId(): string | null {
    return this.props.parentId;
  }

  get parentName(): string | null {
    return this.props.parentName;
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

  toJSON() {
    return { id: this._id, ...this.props };
  }

  get hasParent(): boolean {
    return this.props.parentId !== null;
  }

  get hasProducts(): boolean {
    return this.props.productCount > 0;
  }

  /** Whether this category can be safely deleted (no associated products) */
  get canDelete(): boolean {
    return this.props.productCount === 0;
  }

  /** Whether this is a root-level category (no parent) */
  get isRoot(): boolean {
    return this.props.parentId === null;
  }
}
