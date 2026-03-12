import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePathname: () => "/dashboard/integrations",
  useRouter: () => ({ push: vi.fn() }),
}));

const mockLogs = [
  {
    id: "log-1",
    connectionId: "conn-1",
    externalOrderId: "VTEX-ORD-001",
    action: "SYNCED" as const,
    saleId: "sale-abcd1234-efgh",
    saleNumber: "S-0042",
    contactId: null,
    errorMessage: null,
    rawPayload: null,
    processedAt: new Date("2026-01-10T10:00:00"),
    isFailed: false,
    isSynced: true,
  },
  {
    id: "log-2",
    connectionId: "conn-1",
    externalOrderId: "VTEX-ORD-002",
    action: "FAILED" as const,
    saleId: null,
    saleNumber: null,
    contactId: null,
    errorMessage: "Product not found",
    rawPayload: null,
    processedAt: new Date("2026-01-11T14:30:00"),
    isFailed: true,
    isSynced: false,
  },
  {
    id: "log-3",
    connectionId: "conn-1",
    externalOrderId: "VTEX-ORD-003",
    action: "ALREADY_SYNCED" as const,
    saleId: null,
    saleNumber: null,
    contactId: null,
    errorMessage: null,
    rawPayload: null,
    processedAt: new Date("2026-01-12T09:00:00"),
    isFailed: false,
    isSynced: false,
  },
];

let mockSyncLogsState: {
  data:
    | {
        data: typeof mockLogs;
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
      }
    | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
};

const mockRetryMutate = vi.fn();

vi.mock("@/modules/integrations/presentation/hooks/use-integrations", () => ({
  useSyncLogs: () => mockSyncLogsState,
  useRetrySyncLog: () => ({
    isPending: false,
    mutate: mockRetryMutate,
  }),
}));

import { SyncLogTable } from "@/modules/integrations/presentation/components/sync-log-table";

describe("SyncLogTable", () => {
  beforeEach(() => {
    mockSyncLogsState = {
      data: {
        data: mockLogs,
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
    };
    mockRetryMutate.mockClear();
  });

  it("Given: loading state When: rendering Then: should show skeleton", () => {
    mockSyncLogsState = {
      data: undefined,
      isLoading: true,
      isFetching: true,
      isError: false,
    };

    const { container } = render(<SyncLogTable connectionId="conn-1" />);

    expect(container.querySelector(".h-64")).toBeInTheDocument();
  });

  it("Given: error state When: rendering Then: should show error message", () => {
    mockSyncLogsState = {
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
    };

    render(<SyncLogTable connectionId="conn-1" />);

    expect(screen.getByText("error")).toBeInTheDocument();
  });

  it("Given: empty logs When: rendering Then: should show empty message", () => {
    mockSyncLogsState = {
      data: {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
    };

    render(<SyncLogTable connectionId="conn-1" />);

    expect(screen.getByText("empty")).toBeInTheDocument();
  });

  it("Given: logs data When: rendering Then: should show external order IDs", () => {
    render(<SyncLogTable connectionId="conn-1" />);

    expect(screen.getByText("VTEX-ORD-001")).toBeInTheDocument();
    expect(screen.getByText("VTEX-ORD-002")).toBeInTheDocument();
    expect(screen.getByText("VTEX-ORD-003")).toBeInTheDocument();
  });

  it("Given: log with saleId When: rendering Then: should show sale link", () => {
    render(<SyncLogTable connectionId="conn-1" />);

    const saleLink = screen.getByText("S-0042");
    expect(saleLink).toBeInTheDocument();
    expect(saleLink.closest("a")).toHaveAttribute(
      "href",
      "/dashboard/sales/sale-abcd1234-efgh",
    );
  });

  it("Given: log without saleId When: rendering Then: should show dash", () => {
    render(<SyncLogTable connectionId="conn-1" />);

    const dashes = screen.getAllByText("-");
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  it("Given: failed log When: rendering Then: should show retry button", () => {
    render(<SyncLogTable connectionId="conn-1" />);

    const buttons = screen.getAllByRole("button");
    const retryButtons = buttons.filter(
      (btn) => !btn.closest("[data-radix-collection-item]"),
    );
    expect(retryButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("Given: log with error message When: rendering Then: should show error message", () => {
    render(<SyncLogTable connectionId="conn-1" />);

    expect(screen.getByText("Product not found")).toBeInTheDocument();
  });

  it("Given: log with action When: rendering Then: should show action badge with translation key", () => {
    render(<SyncLogTable connectionId="conn-1" />);

    expect(screen.getByText("actions.SYNCED")).toBeInTheDocument();
    expect(screen.getByText("actions.FAILED")).toBeInTheDocument();
    expect(screen.getByText("actions.ALREADY_SYNCED")).toBeInTheDocument();
  });

  it("Given: log row When: clicking Then: should open detail dialog", () => {
    render(<SyncLogTable connectionId="conn-1" />);

    const row = screen.getByText("VTEX-ORD-001").closest("tr")!;
    fireEvent.click(row);

    expect(screen.getByText("detail.title")).toBeInTheDocument();
    expect(screen.getByText("detail.externalOrderId")).toBeInTheDocument();
    expect(screen.getByText("detail.processedAt")).toBeInTheDocument();
  });

  it("Given: failed log detail When: opening Then: should show error and retry button", () => {
    render(<SyncLogTable connectionId="conn-1" />);

    const row = screen.getByText("VTEX-ORD-002").closest("tr")!;
    fireEvent.click(row);

    expect(screen.getByText("detail.errorMessage")).toBeInTheDocument();
    expect(screen.getByText("detail.retry")).toBeInTheDocument();
  });

  it("Given: synced log detail When: opening Then: should show sale link", () => {
    render(<SyncLogTable connectionId="conn-1" />);

    const row = screen.getByText("VTEX-ORD-001").closest("tr")!;
    fireEvent.click(row);

    expect(screen.getByText("detail.sale")).toBeInTheDocument();
    const saleLinks = screen
      .getAllByText("S-0042")
      .filter((el) => el.closest("a"));
    expect(saleLinks.length).toBeGreaterThanOrEqual(1);
    expect(saleLinks[0].closest("a")).toHaveAttribute(
      "href",
      "/dashboard/sales/sale-abcd1234-efgh",
    );
  });
});
