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

  // --- total = 0 returns null ---

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

  // --- Single page ---

  it("Given: single page of results When: rendering Then: should show label and page size but no navigation", () => {
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
    expect(screen.queryByTestId("chevron-left-icon")).not.toBeInTheDocument();
  });

  // --- totalPages > 1 shows navigation ---

  it("Given: multiple pages When: rendering Then: should show prev/next navigation buttons", () => {
    render(
      <TablePagination
        page={1}
        totalPages={3}
        total={30}
        limit={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        showingLabel="Showing 1-10 of 30"
      />,
    );
    expect(screen.getByTestId("chevron-left-icon")).toBeInTheDocument();
    expect(screen.getByTestId("chevron-right-icon")).toBeInTheDocument();
  });

  // --- Prev/Next disabled states ---

  it("Given: on page 1 When: rendering Then: previous button should be disabled", () => {
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
    const prevButton = buttons.find((b) =>
      b.querySelector("[data-testid='chevron-left-icon']"),
    );
    expect(prevButton).toBeDisabled();
  });

  it("Given: on last page When: rendering Then: next button should be disabled", () => {
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

  it("Given: on middle page When: rendering Then: both prev and next should be enabled", () => {
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
    const nextButton = buttons.find((b) =>
      b.querySelector("[data-testid='chevron-right-icon']"),
    );
    expect(prevButton).not.toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  // --- Prev/Next click ---

  it("Given: on page 3 When: clicking next Then: should call onPageChange with 4", () => {
    render(
      <TablePagination
        page={3}
        totalPages={5}
        total={50}
        limit={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        showingLabel="Showing"
      />,
    );
    const buttons = screen.getAllByRole("button");
    const nextButton = buttons.find((b) =>
      b.querySelector("[data-testid='chevron-right-icon']"),
    );
    fireEvent.click(nextButton!);
    expect(mockOnPageChange).toHaveBeenCalledWith(4);
  });

  it("Given: on page 3 When: clicking prev Then: should call onPageChange with 2", () => {
    render(
      <TablePagination
        page={3}
        totalPages={5}
        total={50}
        limit={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        showingLabel="Showing"
      />,
    );
    const buttons = screen.getAllByRole("button");
    const prevButton = buttons.find((b) =>
      b.querySelector("[data-testid='chevron-left-icon']"),
    );
    fireEvent.click(prevButton!);
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  // --- Page number click ---

  it("Given: multiple pages When: clicking page number button Then: should call onPageChange with that page", () => {
    render(
      <TablePagination
        page={1}
        totalPages={5}
        total={50}
        limit={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        showingLabel="Showing"
      />,
    );
    const page3 = screen.getByRole("button", { name: "3" });
    fireEvent.click(page3);
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  // --- Current page variant ---

  it("Given: on page 2 When: rendering Then: current page button should have default variant", () => {
    render(
      <TablePagination
        page={2}
        totalPages={5}
        total={50}
        limit={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        showingLabel="Showing"
      />,
    );
    const page2Button = screen.getByRole("button", { name: "2" });
    expect(page2Button.getAttribute("data-variant")).toBe("default");

    const page3Button = screen.getByRole("button", { name: "3" });
    expect(page3Button.getAttribute("data-variant")).toBe("outline");
  });

  // --- Page size change ---

  it("Given: page size selector When: changing value Then: should call onPageSizeChange", () => {
    render(
      <TablePagination
        page={1}
        totalPages={5}
        total={50}
        limit={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        showingLabel="Showing"
      />,
    );
    const select = screen.getByTestId("page-size-select");
    fireEvent.change(select, { target: { value: "50" } });
    expect(mockOnPageSizeChange).toHaveBeenCalledWith(50);
  });

  // --- getPageNumbers: totalPages <= 7 (no ellipsis) ---

  it("Given: 5 total pages When: rendering Then: should show all page numbers 1-5 without ellipsis", () => {
    render(
      <TablePagination
        page={1}
        totalPages={5}
        total={50}
        limit={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        showingLabel="Showing"
      />,
    );
    for (let i = 1; i <= 5; i++) {
      expect(
        screen.getByRole("button", { name: String(i) }),
      ).toBeInTheDocument();
    }
    // No ellipsis
    expect(screen.queryByText("...")).not.toBeInTheDocument();
  });

  it("Given: 7 total pages When: rendering Then: should show all page numbers without ellipsis", () => {
    render(
      <TablePagination
        page={4}
        totalPages={7}
        total={70}
        limit={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        showingLabel="Showing"
      />,
    );
    for (let i = 1; i <= 7; i++) {
      expect(
        screen.getByRole("button", { name: String(i) }),
      ).toBeInTheDocument();
    }
    expect(screen.queryByText("...")).not.toBeInTheDocument();
  });

  // --- getPageNumbers: totalPages > 7, page near start (no left ellipsis, right ellipsis) ---

  it("Given: 10 pages on page 1 When: rendering Then: should show right ellipsis only", () => {
    render(
      <TablePagination
        page={1}
        totalPages={10}
        total={100}
        limit={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        showingLabel="Showing"
      />,
    );
    // page=1, pages: [1, 2, ..., 10] — page > 3 is false, page < 10-2 is true
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();
    // Should have 1 ellipsis (right side)
    const ellipses = screen.getAllByText("...");
    expect(ellipses.length).toBe(1);
  });

  // --- getPageNumbers: totalPages > 7, page near end (left ellipsis, no right ellipsis) ---

  it("Given: 10 pages on page 9 When: rendering Then: should show left ellipsis only", () => {
    render(
      <TablePagination
        page={9}
        totalPages={10}
        total={100}
        limit={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        showingLabel="Showing"
      />,
    );
    // page=9: page > 3 → left ellipsis; page < 10-2=8 → false, no right ellipsis
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();
    const ellipses = screen.getAllByText("...");
    expect(ellipses.length).toBe(1);
  });

  // --- getPageNumbers: both ellipses ---

  it("Given: 10 pages on page 5 When: rendering Then: should show both left and right ellipsis", () => {
    render(
      <TablePagination
        page={5}
        totalPages={10}
        total={100}
        limit={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        showingLabel="Showing"
      />,
    );
    // page=5: page > 3 → left ellipsis; page < 10-2=8 → right ellipsis
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "4" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "5" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "6" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();
    const ellipses = screen.getAllByText("...");
    expect(ellipses.length).toBe(2);
  });

  // --- Custom perPageLabel ---

  it("Given: custom perPageLabel When: rendering Then: should display custom label", () => {
    render(
      <TablePagination
        page={1}
        totalPages={1}
        total={5}
        limit={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        showingLabel="Showing"
        perPageLabel="Items per page"
      />,
    );
    expect(screen.getByText("Items per page")).toBeInTheDocument();
    expect(screen.queryByText("Per page")).not.toBeInTheDocument();
  });

  // --- Default perPageLabel ---

  it("Given: no perPageLabel When: rendering Then: should show default 'Per page'", () => {
    render(
      <TablePagination
        page={1}
        totalPages={1}
        total={5}
        limit={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        showingLabel="Showing"
      />,
    );
    expect(screen.getByText("Per page")).toBeInTheDocument();
  });

  // --- Custom pageSizeOptions ---

  it("Given: custom pageSizeOptions When: rendering Then: should display those options", () => {
    const { container } = render(
      <TablePagination
        page={1}
        totalPages={1}
        total={5}
        limit={25}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        showingLabel="Showing"
        pageSizeOptions={[25, 50, 75]}
      />,
    );
    // Custom options are rendered via SelectItem which uses data-value
    const selectContent = screen.getByTestId("select-content");
    expect(selectContent.querySelector('[data-value="25"]')).not.toBeNull();
    expect(selectContent.querySelector('[data-value="50"]')).not.toBeNull();
    expect(selectContent.querySelector('[data-value="75"]')).not.toBeNull();
  });

  // --- Mobile text display ---

  it("Given: multiple pages When: rendering Then: should show page/totalPages in mobile format", () => {
    render(
      <TablePagination
        page={2}
        totalPages={5}
        total={50}
        limit={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        showingLabel="Showing"
      />,
    );
    // The mobile span shows "2/5"
    expect(screen.getByText("2/5")).toBeInTheDocument();
  });

  // --- getPageNumbers: page exactly 3 (boundary: no left ellipsis) ---

  it("Given: 10 pages on page 3 When: rendering Then: should NOT show left ellipsis", () => {
    render(
      <TablePagination
        page={3}
        totalPages={10}
        total={100}
        limit={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        showingLabel="Showing"
      />,
    );
    // page=3: page > 3 is false → no left ellipsis
    // page < 10-2=8 → right ellipsis
    const ellipses = screen.getAllByText("...");
    expect(ellipses.length).toBe(1); // Only right
  });

  // --- getPageNumbers: page exactly totalPages - 2 (boundary: no right ellipsis) ---

  it("Given: 10 pages on page 8 When: rendering Then: should NOT show right ellipsis", () => {
    render(
      <TablePagination
        page={8}
        totalPages={10}
        total={100}
        limit={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        showingLabel="Showing"
      />,
    );
    // page=8: page > 3 → left ellipsis; page < 10-2=8 → false, no right ellipsis
    const ellipses = screen.getAllByText("...");
    expect(ellipses.length).toBe(1); // Only left
  });
});
