import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CurrencyInput } from "@/ui/components/currency-input";

// --- Tests ---

describe("CurrencyInput", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("Given: no initial value When: rendering Then: should show the dollar sign prefix and empty input", () => {
    render(<CurrencyInput onChange={mockOnChange} />);

    expect(screen.getByText("$")).toBeInTheDocument();
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("");
  });

  it("Given: an initial numeric value When: rendering Then: should display the formatted number", () => {
    render(<CurrencyInput value={1500000} onChange={mockOnChange} />);

    const input = screen.getByRole("textbox");
    // es-CO formatting uses period as thousands separator
    expect(input).toHaveValue("1.500.000");
  });

  it("Given: the input is empty When: typing digits Then: should format the number and call onChange with the numeric value", () => {
    render(<CurrencyInput onChange={mockOnChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "25000" } });

    expect(input).toHaveValue("25.000");
    expect(mockOnChange).toHaveBeenCalledWith(25000);
  });

  it("Given: the input has a value When: clearing all text Then: should call onChange with 0", () => {
    render(<CurrencyInput value={500} onChange={mockOnChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "" } });

    expect(input).toHaveValue("");
    expect(mockOnChange).toHaveBeenCalledWith(0);
  });

  it("Given: the input receives non-digit characters When: typing Then: should strip them and only process digits", () => {
    render(<CurrencyInput onChange={mockOnChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "abc12xyz34" } });

    expect(input).toHaveValue("1.234");
    expect(mockOnChange).toHaveBeenCalledWith(1234);
  });

  it("Given: disabled is true When: rendering Then: should disable the input", () => {
    render(<CurrencyInput onChange={mockOnChange} disabled />);

    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });

  it("Given: a custom placeholder When: rendering without value Then: should display the placeholder", () => {
    render(
      <CurrencyInput onChange={mockOnChange} placeholder="Enter amount" />,
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("placeholder", "Enter amount");
  });

  it("Given: the value prop changes externally When: parent updates value Then: should sync the display", () => {
    const { rerender } = render(
      <CurrencyInput value={1000} onChange={mockOnChange} />,
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("1.000");

    rerender(<CurrencyInput value={2500} onChange={mockOnChange} />);
    expect(input).toHaveValue("2.500");
  });
});
