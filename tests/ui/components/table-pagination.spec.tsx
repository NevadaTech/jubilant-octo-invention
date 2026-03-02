import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TablePagination } from "@/ui/components/table-pagination";

// --- Mocks ---

vi.mock("lucide-react", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    ChevronLeft: () => <span data-testid="chevron-left-icon" />,
    ChevronRight: () => <span data-testid="chevron-right-icon" />,
  };
});

vi.mock("@/ui/components/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    ...rest
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
    [key: string]: unknown;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      {...rest}
    >
      {children}
    </button>
  ),
}));

vi.mock("@/ui/components/select", () => ({
  Select: ({
    children,
    value,
    onValueChange,
  }: {
    children: React.ReactNode;
    value: string;
    onValueChange: (v: string) => void;
  }) => (
    <div data-testid="select-root" data-value={value}>
      {children}
      <select
        data-testid="page-size-select"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
      >
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-trigger">{children}</div>
  ),
  SelectValue: () => <span data-testid="select-value" />,
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <div data-value={value}>{children}</div>,
}));

// --- Tests ---

describe("TablePagination", () => {
  const mockOnPageChange = vi.fn();
  const mockOnPageSizeChange = vi.fn();

  beforeEach(() => {
    mockOnPageChange.mockClear();
    mockOnPageSizeChange.mockClear();
  });

  it("Given: total is 0 When: rendering Then: should render nothing", () => {
    const { container } = render(
      <TablePagination
        page={1}
        totalPages={0}
        total={0}
        limit={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        showingLabel="Showing 0 items"
      />,
    );

    expect(container.innerHTML).toBe("");
  });

  it("Given: a single page of results When: rendering Then: should show the label and page size selector but no page buttons", () => {
    render(
      <TablePagination
        page={1}
        totalPages={1}
        total={5}
        limit={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        showingLabel="Showing 1-5 of 5"
      />,
    );

    expect(screen.getByText("Showing 1-5 of 5")).toBeInTheDocument();
    expect(screen.getByText("Per page")).toBeInTheDocument();
    // With only 1 page, navigation buttons should not appear
    expect(screen.queryByTestId("chevron-left-icon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("chevron-right-icon")).not.toBeInTheDocument();
  });

  it("Given: multiple pages and currently on page 1 When: rendering Then: should disable the previous button", () => {
    render(
      <TablePagination
        page={1}
        totalPages={5}
        total={50}
        limit={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        showingLabel="Showing 1-10 of 50"
      />,
    );

    const buttons = screen.getAllByRole("button");
    // First button after page-size is the "previous" button
    const prevButton = buttons.find((b) =>
      b.querySelector("[data-testid='chevron-left-icon']"),
    );
    expect(prevButton).toBeDisabled();
  });

  it("Given: multiple pages and currently on the last page When: rendering Then: should disable the next button", () => {
    render(
      <TablePagination
        page={5}
        totalPages={5}
        total={50}
        limit={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        showingLabel="Showing 41-50 of 50"
      />,
    );

    const buttons = screen.getAllByRole("button");
    const nextButton = buttons.find((b) =>
      b.querySelector("[data-testid='chevron-right-icon']"),
    );
    expect(nextButton).toBeDisabled();
  });

  it("Given: currently on page 3 of 5 When: clicking the next button Then: should call onPageChange with page 4", () => {
    render(
      <TablePagination
        page={3}
        totalPages={5}
        total={50}
        limit={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        showingLabel="Showing 21-30 of 50"
      />,
    );

    const buttons = screen.getAllByRole("button");
    const nextButton = buttons.find((b) =>
      b.querySelector("[data-testid='chevron-right-icon']"),
    );
    fireEvent.click(nextButton!);

    expect(mockOnPageChange).toHaveBeenCalledWith(4);
  });

  it("Given: currently on page 3 of 5 When: clicking the previous button Then: should call onPageChange with page 2", () => {
    render(
      <TablePagination
        page={3}
        totalPages={5}
        total={50}
        limit={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        showingLabel="Showing 21-30 of 50"
      />,
    );

    const buttons = screen.getAllByRole("button");
    const prevButton = buttons.find((b) =>
      b.querySelector("[data-testid='chevron-left-icon']"),
    );
    fireEvent.click(prevButton!);

    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it("Given: multiple pages When: clicking a specific page number button Then: should call onPageChange with that page", () => {
    render(
      <TablePagination
        page={1}
        totalPages={5}
        total={50}
        limit={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        showingLabel="Showing 1-10 of 50"
      />,
    );

    // Page 3 button should be visible
    const page3Button = screen.getByRole("button", { name: "3" });
    fireEvent.click(page3Button);

    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  it("Given: the page size selector When: changing the value Then: should call onPageSizeChange with the new size", () => {
    render(
      <TablePagination
        page={1}
        totalPages={5}
        total={50}
        limit={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        showingLabel="Showing 1-10 of 50"
      />,
    );

    const pageSizeSelect = screen.getByTestId("page-size-select");
    fireEvent.change(pageSizeSelect, { target: { value: "50" } });

    expect(mockOnPageSizeChange).toHaveBeenCalledWith(50);
  });
});
