import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock(
  "@/modules/imports/presentation/components/import-status-badge",
  () => ({
    ImportStatusBadge: ({ status }: { status: string }) => (
      <span data-testid="status-badge">{status}</span>
    ),
  }),
);

vi.mock("@/modules/imports/presentation/components/import-detail", () => ({
  ImportDetailSheet: () => <div data-testid="import-detail-sheet" />,
}));

const mockBatches = [
  {
    id: "batch-1",
    type: "PRODUCTS",
    status: "COMPLETED",
    fileName: "products.csv",
    totalRows: 100,
    validRows: 95,
    invalidRows: 5,
    processedRows: 100,
    progress: 100,
    createdBy: "user-1",
    createdAt: "2026-01-15T10:00:00.000Z",
  },
  {
    id: "batch-2",
    type: "MOVEMENTS",
    status: "FAILED",
    fileName: "movements.xlsx",
    totalRows: 50,
    validRows: 30,
    invalidRows: 20,
    processedRows: 50,
    progress: 100,
    createdBy: "user-1",
    createdAt: "2026-02-01T12:00:00.000Z",
  },
];

const mockPagination = {
  page: 1,
  limit: 10,
  total: 2,
  totalPages: 1,
};

let mockQueryState: {
  data:
    | { data: typeof mockBatches; pagination: typeof mockPagination }
    | undefined;
  isLoading: boolean;
};

vi.mock("@/modules/imports/presentation/hooks/use-imports", () => ({
  useImports: () => mockQueryState,
}));

import { ImportHistory } from "@/modules/imports/presentation/components/import-history";

describe("ImportHistory", () => {
  beforeEach(() => {
    mockQueryState = {
      data: { data: mockBatches, pagination: mockPagination },
      isLoading: false,
    };
  });

  it("Given: batch data When: rendering Then: should show history title", () => {
    render(<ImportHistory />);

    expect(screen.getByText("history.title")).toBeInTheDocument();
  });

  it("Given: batch data When: rendering Then: should show file names", () => {
    render(<ImportHistory />);

    expect(screen.getByText("products.csv")).toBeInTheDocument();
    expect(screen.getByText("movements.xlsx")).toBeInTheDocument();
  });

  it("Given: batch data When: rendering Then: should show row counts", () => {
    render(<ImportHistory />);

    expect(screen.getByText("95/100")).toBeInTheDocument();
    expect(screen.getByText("30/50")).toBeInTheDocument();
  });

  it("Given: batch data When: rendering Then: should show status badges", () => {
    render(<ImportHistory />);

    const badges = screen.getAllByTestId("status-badge");
    expect(badges).toHaveLength(2);
    expect(badges[0]).toHaveTextContent("COMPLETED");
    expect(badges[1]).toHaveTextContent("FAILED");
  });

  it("Given: batch data When: rendering Then: should show column headers", () => {
    render(<ImportHistory />);

    expect(screen.getByText("history.columns.type")).toBeInTheDocument();
    expect(screen.getByText("history.columns.fileName")).toBeInTheDocument();
    expect(screen.getByText("history.columns.status")).toBeInTheDocument();
    expect(screen.getByText("history.columns.rows")).toBeInTheDocument();
    expect(screen.getByText("history.columns.date")).toBeInTheDocument();
  });

  it("Given: empty batch list When: rendering Then: should show empty state message", () => {
    mockQueryState = {
      data: {
        data: [],
        pagination: { ...mockPagination, total: 0, totalPages: 0 },
      },
      isLoading: false,
    };

    render(<ImportHistory />);

    expect(screen.getByText("history.empty")).toBeInTheDocument();
  });

  it("Given: loading state When: rendering Then: should not show batch data", () => {
    mockQueryState = {
      data: undefined,
      isLoading: true,
    };

    render(<ImportHistory />);

    expect(screen.queryByText("products.csv")).not.toBeInTheDocument();
    expect(screen.queryByText("history.title")).not.toBeInTheDocument();
  });

  it("Given: multi-page pagination When: rendering Then: should show pagination controls", () => {
    mockQueryState = {
      data: {
        data: mockBatches,
        pagination: { page: 1, limit: 10, total: 25, totalPages: 3 },
      },
      isLoading: false,
    };

    render(<ImportHistory />);

    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("Given: single page When: rendering Then: should not show pagination controls", () => {
    render(<ImportHistory />);

    expect(screen.queryByText("1 / 1")).not.toBeInTheDocument();
  });

  it("Given: batch data When: rendering Then: should render the detail sheet", () => {
    render(<ImportHistory />);

    expect(screen.getByTestId("import-detail-sheet")).toBeInTheDocument();
  });
});
