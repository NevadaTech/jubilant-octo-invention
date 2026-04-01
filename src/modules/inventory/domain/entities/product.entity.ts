import { Entity } from "@/shared/domain";

export interface ProductProps {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  categories: { id: string; name: string }[];
  unitOfMeasure: string;
  cost: number;
  price: number;
  minStock: number;
  maxStock: number;
  isActive: boolean;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Computed fields from backend
  averageCost: number;
  totalStock: number;
  margin: number;
  profit: number;
  safetyStock: number;
  // Rotation metrics
  totalIn30d: number;
  totalOut30d: number;
  avgDailyConsumption: number;
  daysOfStock: number | null;
  turnoverRate: number;
  lastMovementDate: string | null;
  barcode?: string | null;
  statusChangedBy?: string | null;
  statusChangedAt?: string | null;
  companyId?: string | null;
  companyName?: string | null;
  brandId?: string | null;
  brandName?: string | null;
}

export class Product extends Entity<string> {
  private readonly props: Omit<ProductProps, "id">;

  private constructor(id: string, props: Omit<ProductProps, "id">) {
    super(id);
    this.props = props;
  }

  static create(props: ProductProps): Product {
    return new Product(props.id, {
      sku: props.sku,
      name: props.name,
      description: props.description,
      categories: props.categories,
      unitOfMeasure: props.unitOfMeasure,
      cost: props.cost,
      price: props.price,
      minStock: props.minStock,
      maxStock: props.maxStock,
      isActive: props.isActive,
      imageUrl: props.imageUrl,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      averageCost: props.averageCost,
      totalStock: props.totalStock,
      margin: props.margin,
      profit: props.profit,
      safetyStock: props.safetyStock,
      totalIn30d: props.totalIn30d,
      totalOut30d: props.totalOut30d,
      avgDailyConsumption: props.avgDailyConsumption,
      daysOfStock: props.daysOfStock,
      turnoverRate: props.turnoverRate,
      lastMovementDate: props.lastMovementDate,
      barcode: props.barcode,
      statusChangedBy: props.statusChangedBy,
      statusChangedAt: props.statusChangedAt,
      companyId: props.companyId,
      companyName: props.companyName,
      brandId: props.brandId,
      brandName: props.brandName,
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

  get categories(): { id: string; name: string }[] {
    return this.props.categories;
  }

  get unitOfMeasure(): string {
    return this.props.unitOfMeasure;
  }

  get cost(): number {
    return this.props.cost;
  }

  get price(): number {
    return this.props.price;
  }

  get minStock(): number {
    return this.props.minStock;
  }

  get maxStock(): number {
    return this.props.maxStock;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get imageUrl(): string | null {
    return this.props.imageUrl;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get averageCost(): number {
    return this.props.averageCost;
  }

  get totalStock(): number {
    return this.props.totalStock;
  }

  get margin(): number {
    return this.props.margin;
  }

  get profit(): number {
    return this.props.profit;
  }

  get safetyStock(): number {
    return this.props.safetyStock;
  }

  get totalIn30d(): number {
    return this.props.totalIn30d;
  }

  get totalOut30d(): number {
    return this.props.totalOut30d;
  }

  get avgDailyConsumption(): number {
    return this.props.avgDailyConsumption;
  }

  get daysOfStock(): number | null {
    return this.props.daysOfStock;
  }

  get turnoverRate(): number {
    return this.props.turnoverRate;
  }

  get lastMovementDate(): string | null {
    return this.props.lastMovementDate;
  }

  get statusChangedBy(): string | null | undefined {
    return this.props.statusChangedBy;
  }

  get statusChangedAt(): string | null | undefined {
    return this.props.statusChangedAt;
  }

  get companyId(): string | null | undefined {
    return this.props.companyId;
  }

  get companyName(): string | null | undefined {
    return this.props.companyName;
  }

  get brandId(): string | null | undefined {
    return this.props.brandId;
  }

  get brandName(): string | null | undefined {
    return this.props.brandName;
  }

  get barcode(): string | null | undefined {
    return this.props.barcode;
  }

  toJSON() {
    return { id: this._id, ...this.props };
  }

  isLowStock(currentQuantity: number): boolean {
    return currentQuantity <= this.props.minStock;
  }

  isOverStock(currentQuantity: number): boolean {
    return currentQuantity > this.props.maxStock;
  }
}
