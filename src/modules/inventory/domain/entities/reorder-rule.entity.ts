import { Entity } from "@/shared/domain";

export interface ReorderRuleProps {
  id: string;
  productId: string;
  warehouseId: string;
  minQty: number;
  maxQty: number;
  safetyQty: number;
}

export class ReorderRule extends Entity<string> {
  private readonly props: Omit<ReorderRuleProps, "id">;

  private constructor(id: string, props: Omit<ReorderRuleProps, "id">) {
    super(id);
    this.props = props;
  }

  static create(props: ReorderRuleProps): ReorderRule {
    return new ReorderRule(props.id, {
      productId: props.productId,
      warehouseId: props.warehouseId,
      minQty: props.minQty,
      maxQty: props.maxQty,
      safetyQty: props.safetyQty,
    });
  }

  get productId(): string {
    return this.props.productId;
  }

  get warehouseId(): string {
    return this.props.warehouseId;
  }

  get minQty(): number {
    return this.props.minQty;
  }

  get maxQty(): number {
    return this.props.maxQty;
  }

  get safetyQty(): number {
    return this.props.safetyQty;
  }
}
