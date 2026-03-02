import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SortableHeader } from "@/ui/components/sortable-header";

// --- Mocks ---

vi.mock("lucide-react", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    ArrowUpDown: () => <span data-testid="arrow-updown-icon" />,
    ArrowUp: () => <span data-testid="arrow-up-icon" />,
    ArrowDown: () => <span data-testid="arrow-down-icon" />,
  };
});

// --- Tests ---

describe("SortableHeader", () => {
  const mockOnSort = vi.fn();

  beforeEach(() => {
    mockOnSort.mockClear();
  });

  it("Given: the column is not currently sorted When: rendering Then: should display the label with the neutral ArrowUpDown icon", () => {
    render(
      <table>
        <thead>
          <tr>
            <SortableHeader
              label="Name"
              field="name"
              currentSortBy="price"
              currentSortOrder="asc"
              onSort={mockOnSort}
            />
          </tr>
        </thead>
      </table>,
    );

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByTestId("arrow-updown-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("arrow-up-icon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("arrow-down-icon")).not.toBeInTheDocument();
  });

  it("Given: the column is sorted ascending When: rendering Then: should display the ArrowUp icon", () => {
    render(
      <table>
        <thead>
          <tr>
            <SortableHeader
              label="Price"
              field="price"
              currentSortBy="price"
              currentSortOrder="asc"
              onSort={mockOnSort}
            />
          </tr>
        </thead>
      </table>,
    );

    expect(screen.getByTestId("arrow-up-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("arrow-down-icon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("arrow-updown-icon")).not.toBeInTheDocument();
  });

  it("Given: the column is sorted descending When: rendering Then: should display the ArrowDown icon", () => {
    render(
      <table>
        <thead>
          <tr>
            <SortableHeader
              label="Price"
              field="price"
              currentSortBy="price"
              currentSortOrder="desc"
              onSort={mockOnSort}
            />
          </tr>
        </thead>
      </table>,
    );

    expect(screen.getByTestId("arrow-down-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("arrow-up-icon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("arrow-updown-icon")).not.toBeInTheDocument();
  });

  it("Given: the column is not currently sorted When: clicking the header Then: should call onSort with field and asc", () => {
    render(
      <table>
        <thead>
          <tr>
            <SortableHeader
              label="Name"
              field="name"
              currentSortBy="other"
              currentSortOrder="asc"
              onSort={mockOnSort}
            />
          </tr>
        </thead>
      </table>,
    );

    fireEvent.click(screen.getByText("Name").closest("th")!);

    expect(mockOnSort).toHaveBeenCalledWith("name", "asc");
  });

  it("Given: the column is sorted ascending When: clicking the header Then: should call onSort with field and desc", () => {
    render(
      <table>
        <thead>
          <tr>
            <SortableHeader
              label="Price"
              field="price"
              currentSortBy="price"
              currentSortOrder="asc"
              onSort={mockOnSort}
            />
          </tr>
        </thead>
      </table>,
    );

    fireEvent.click(screen.getByText("Price").closest("th")!);

    expect(mockOnSort).toHaveBeenCalledWith("price", "desc");
  });

  it("Given: the column is sorted descending When: clicking the header Then: should call onSort with field and undefined to clear sort", () => {
    render(
      <table>
        <thead>
          <tr>
            <SortableHeader
              label="Price"
              field="price"
              currentSortBy="price"
              currentSortOrder="desc"
              onSort={mockOnSort}
            />
          </tr>
        </thead>
      </table>,
    );

    fireEvent.click(screen.getByText("Price").closest("th")!);

    expect(mockOnSort).toHaveBeenCalledWith("price", undefined);
  });

  it("Given: a custom className is provided When: rendering Then: should apply the className to the th element", () => {
    render(
      <table>
        <thead>
          <tr>
            <SortableHeader
              label="Date"
              field="date"
              onSort={mockOnSort}
              className="text-right"
            />
          </tr>
        </thead>
      </table>,
    );

    const th = screen.getByText("Date").closest("th");
    expect(th).toHaveClass("text-right");
  });
});
