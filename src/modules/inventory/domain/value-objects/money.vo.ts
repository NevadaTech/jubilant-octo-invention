import { ValueObject } from "@/shared/domain";

interface MoneyProps {
  amount: number;
  currency: string;
}

export class Money extends ValueObject<MoneyProps> {
  private static readonly DEFAULT_CURRENCY = "USD";

  private constructor(props: MoneyProps) {
    super(props);
  }

  static create(
    amount: number,
    currency: string = Money.DEFAULT_CURRENCY,
  ): Money {
    if (amount < 0) {
      throw new Error("Amount cannot be negative");
    }

    return new Money({
      amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
      currency: currency.toUpperCase(),
    });
  }

  static zero(currency: string = Money.DEFAULT_CURRENCY): Money {
    return Money.create(0, currency);
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  add(other: Money): Money {
    if (this.props.currency !== other.currency) {
      throw new Error("Cannot add money with different currencies");
    }
    return Money.create(this.props.amount + other.amount, this.props.currency);
  }

  subtract(other: Money): Money {
    if (this.props.currency !== other.currency) {
      throw new Error("Cannot subtract money with different currencies");
    }
    return Money.create(this.props.amount - other.amount, this.props.currency);
  }

  multiply(factor: number): Money {
    return Money.create(this.props.amount * factor, this.props.currency);
  }

  format(locale: string = "en-US"): string {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: this.props.currency,
    }).format(this.props.amount);
  }
}
