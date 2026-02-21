import { ValueObject } from "@/shared/domain";

interface SkuProps {
  value: string;
}

export class Sku extends ValueObject<SkuProps> {
  private static readonly SKU_PATTERN = /^[A-Za-z0-9-_]+$/;
  private static readonly MAX_LENGTH = 50;

  private constructor(props: SkuProps) {
    super(props);
  }

  static create(sku: string): Sku {
    const trimmed = sku.trim().toUpperCase();

    if (!trimmed || trimmed.length === 0) {
      throw new Error("SKU cannot be empty");
    }

    if (trimmed.length > Sku.MAX_LENGTH) {
      throw new Error(`SKU cannot exceed ${Sku.MAX_LENGTH} characters`);
    }

    if (!Sku.SKU_PATTERN.test(trimmed)) {
      throw new Error(
        "SKU can only contain letters, numbers, hyphens and underscores",
      );
    }

    return new Sku({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
