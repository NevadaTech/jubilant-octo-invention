import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  MultiSelect,
  type MultiSelectOption,
} from "@/ui/components/multi-select";

// --- Mocks ---

vi.mock("lucide-react", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    Check: () => <span data-testid="check-icon" />,
    ChevronDown: () => <span data-testid="chevron-down-icon" />,
    X: () => <span data-testid="x-icon" />,
  };
});

// --- Test data ---

const options: MultiSelectOption[] = [
  { value: "red", label: "Red" },
  { value: "green", label: "Green" },
  { value: "blue", label: "Blue" },
];

// --- Tests ---

describe("MultiSelect", () => {
  const mockOnValueChange = vi.fn();

  beforeEach(() => {
    mockOnValueChange.mockClear();
  });

  it("Given: no values selected When: rendering Then: should display the placeholder or allLabel", () => {
    render(
      <MultiSelect
        value={[]}
        onValueChange={mockOnValueChange}
        options={options}
        allLabel="All colors"
      />,
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("All colors");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("Given: one value is selected When: rendering Then: should display the label of the selected option", () => {
    render(
      <MultiSelect
        value={["green"]}
        onValueChange={mockOnValueChange}
        options={options}
      />,
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("Green");
  });

  it("Given: multiple values are selected When: rendering Then: should display the count with selectedLabel", () => {
    render(
      <MultiSelect
        value={["red", "blue"]}
        onValueChange={mockOnValueChange}
        options={options}
        selectedLabel="chosen"
      />,
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("2 chosen");
  });

  it("Given: the dropdown is closed When: clicking the trigger Then: should open and show all options", () => {
    render(
      <MultiSelect
        value={[]}
        onValueChange={mockOnValueChange}
        options={options}
      />,
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");

    const optionElements = screen.getAllByRole("option");
    expect(optionElements).toHaveLength(3);
    expect(optionElements[0]).toHaveTextContent("Red");
    expect(optionElements[1]).toHaveTextContent("Green");
    expect(optionElements[2]).toHaveTextContent("Blue");
  });

  it("Given: the dropdown is open and no values selected When: clicking an option Then: should add it to the selection", () => {
    render(
      <MultiSelect
        value={[]}
        onValueChange={mockOnValueChange}
        options={options}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));

    const optionElements = screen.getAllByRole("option");
    fireEvent.click(optionElements[1]);

    expect(mockOnValueChange).toHaveBeenCalledWith(["green"]);
  });

  it("Given: the dropdown is open and a value is already selected When: clicking the selected option Then: should remove it from the selection", () => {
    render(
      <MultiSelect
        value={["red", "green"]}
        onValueChange={mockOnValueChange}
        options={options}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));

    const optionElements = screen.getAllByRole("option");
    fireEvent.click(optionElements[0]); // click "Red" which is selected

    expect(mockOnValueChange).toHaveBeenCalledWith(["green"]);
  });

  it("Given: values are selected When: clicking the clear button Then: should call onValueChange with an empty array", () => {
    render(
      <MultiSelect
        value={["red", "blue"]}
        onValueChange={mockOnValueChange}
        options={options}
      />,
    );

    const clearButton = screen.getByRole("button", { name: "" });
    // The clear button is the inner span with role="button"
    const clearSpan = screen.getByTestId("x-icon").closest("[role='button']");
    expect(clearSpan).toBeInTheDocument();
    fireEvent.click(clearSpan!);

    expect(mockOnValueChange).toHaveBeenCalledWith([]);
  });

  it("Given: no values selected and no allLabel When: rendering Then: should display the placeholder", () => {
    render(
      <MultiSelect
        value={[]}
        onValueChange={mockOnValueChange}
        options={options}
        placeholder="Pick colors"
      />,
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("Pick colors");
  });

  it("Given: one value selected that is not in options When: rendering Then: should display the raw value", () => {
    render(
      <MultiSelect
        value={["unknown"]}
        onValueChange={mockOnValueChange}
        options={options}
      />,
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("unknown");
  });

  it("Given: multiple values selected without selectedLabel When: rendering Then: should display count with 'selected'", () => {
    render(
      <MultiSelect
        value={["red", "blue"]}
        onValueChange={mockOnValueChange}
        options={options}
      />,
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("2 selected");
  });

  it("Given: disabled is true When: clicking trigger Then: should not open dropdown", () => {
    render(
      <MultiSelect
        value={[]}
        onValueChange={mockOnValueChange}
        options={options}
        disabled={true}
      />,
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("Given: dropdown is open When: clicking outside Then: should close the dropdown", () => {
    render(
      <MultiSelect
        value={[]}
        onValueChange={mockOnValueChange}
        options={options}
      />,
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    // Click outside
    fireEvent.mouseDown(document.body);

    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("Given: values are selected When: pressing Enter on clear button Then: should clear selection", () => {
    render(
      <MultiSelect
        value={["red"]}
        onValueChange={mockOnValueChange}
        options={options}
      />,
    );

    const clearSpan = screen.getByTestId("x-icon").closest("[role='button']");
    fireEvent.keyDown(clearSpan!, { key: "Enter" });

    expect(mockOnValueChange).toHaveBeenCalledWith([]);
  });

  it("Given: values are selected When: pressing non-Enter key on clear button Then: should not clear", () => {
    render(
      <MultiSelect
        value={["red"]}
        onValueChange={mockOnValueChange}
        options={options}
      />,
    );

    const clearSpan = screen.getByTestId("x-icon").closest("[role='button']");
    fireEvent.keyDown(clearSpan!, { key: "Tab" });

    expect(mockOnValueChange).not.toHaveBeenCalled();
  });

  it("Given: the dropdown is open When: pressing Escape Then: should close the dropdown", () => {
    render(
      <MultiSelect
        value={[]}
        onValueChange={mockOnValueChange}
        options={options}
      />,
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(document, { key: "Escape" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
