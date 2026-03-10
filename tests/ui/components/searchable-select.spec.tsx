import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/ui/components/searchable-select";

// --- Mocks ---

vi.mock("lucide-react", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    Check: () => <span data-testid="check-icon" />,
    ChevronDown: () => <span data-testid="chevron-down-icon" />,
    Search: () => <span data-testid="search-icon" />,
  };
});

// --- Test data ---

const options: SearchableSelectOption[] = [
  { value: "apple", label: "Apple", description: "A red fruit" },
  { value: "banana", label: "Banana", description: "A yellow fruit" },
  { value: "cherry", label: "Cherry" },
];

// --- Tests ---

describe("SearchableSelect", () => {
  const mockOnValueChange = vi.fn();

  beforeEach(() => {
    mockOnValueChange.mockClear();
  });

  it("Given: no value selected When: rendering Then: should display the placeholder text", () => {
    render(
      <SearchableSelect
        options={options}
        onValueChange={mockOnValueChange}
        placeholder="Pick a fruit"
      />,
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("Pick a fruit");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("Given: a value is selected When: rendering Then: should display the selected option label", () => {
    render(
      <SearchableSelect
        options={options}
        value="banana"
        onValueChange={mockOnValueChange}
      />,
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("Banana");
  });

  it("Given: the dropdown is closed When: clicking the trigger Then: should open the dropdown and show all options", async () => {
    render(
      <SearchableSelect options={options} onValueChange={mockOnValueChange} />,
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");

    const optionElements = screen.getAllByRole("option");
    expect(optionElements).toHaveLength(3);
    expect(optionElements[0]).toHaveTextContent("Apple");
    expect(optionElements[1]).toHaveTextContent("Banana");
    expect(optionElements[2]).toHaveTextContent("Cherry");
  });

  it("Given: the dropdown is open When: clicking an option Then: should call onValueChange and close the dropdown", () => {
    render(
      <SearchableSelect options={options} onValueChange={mockOnValueChange} />,
    );

    fireEvent.click(screen.getByRole("combobox"));

    const optionElements = screen.getAllByRole("option");
    fireEvent.click(optionElements[0]);

    expect(mockOnValueChange).toHaveBeenCalledWith("apple");
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("Given: the dropdown is open When: typing in the search input Then: should filter options by label", () => {
    render(
      <SearchableSelect
        options={options}
        onValueChange={mockOnValueChange}
        searchPlaceholder="Search fruits..."
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));

    const searchInput = screen.getByPlaceholderText("Search fruits...");
    fireEvent.change(searchInput, { target: { value: "ban" } });

    const optionElements = screen.getAllByRole("option");
    expect(optionElements).toHaveLength(1);
    expect(optionElements[0]).toHaveTextContent("Banana");
  });

  it("Given: the dropdown is open and search matches nothing When: typing a non-matching query Then: should show the empty message", () => {
    render(
      <SearchableSelect
        options={options}
        onValueChange={mockOnValueChange}
        emptyMessage="Nothing found"
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));

    const searchInput = screen.getByPlaceholderText("Search...");
    fireEvent.change(searchInput, { target: { value: "zzz" } });

    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText("Nothing found")).toBeInTheDocument();
  });

  it("Given: the dropdown is open When: pressing Escape Then: should close the dropdown", () => {
    render(
      <SearchableSelect options={options} onValueChange={mockOnValueChange} />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("Given: dropdown is open When: clicking outside Then: should close the dropdown", () => {
    render(
      <SearchableSelect options={options} onValueChange={mockOnValueChange} />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    fireEvent.mouseDown(document.body);

    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("Given: dropdown is open When: searching by description Then: should filter by description", () => {
    render(
      <SearchableSelect options={options} onValueChange={mockOnValueChange} />,
    );

    fireEvent.click(screen.getByRole("combobox"));

    const searchInput = screen.getByPlaceholderText("Search...");
    fireEvent.change(searchInput, { target: { value: "red fruit" } });

    const optionElements = screen.getAllByRole("option");
    expect(optionElements).toHaveLength(1);
    expect(optionElements[0]).toHaveTextContent("Apple");
  });

  it("Given: a function ref When: rendering Then: should call the function ref with the element", () => {
    const fnRef = vi.fn();

    render(
      <SearchableSelect
        ref={fnRef}
        options={options}
        onValueChange={mockOnValueChange}
      />,
    );

    expect(fnRef).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });

  it("Given: an object ref When: rendering Then: should set ref.current to the element", () => {
    const objRef = { current: null as HTMLButtonElement | null };

    render(
      <SearchableSelect
        ref={objRef}
        options={options}
        onValueChange={mockOnValueChange}
      />,
    );

    expect(objRef.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("Given: the component is disabled When: clicking the trigger Then: should not open the dropdown", () => {
    render(
      <SearchableSelect
        options={options}
        onValueChange={mockOnValueChange}
        disabled
      />,
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });
});
