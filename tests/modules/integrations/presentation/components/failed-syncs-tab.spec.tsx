import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

const mockFailedLogs = [
  {
    id: "log-1",
    externalOrderId: "VTEX-001",
    action: "FAILED" as const,
    saleId: null,
    errorMessage: "Connection timeout",
    processedAt: new Date("2026-03-07T10:00:00.000Z"),
    isFailed: true,
  },
  {
    id: "log-2",
    externalOrderId: "VTEX-002",
    action: "FAILED" as const,
    saleId: null,
    errorMessage: null,
    processedAt: new Date("2026-03-07T11:00:00.000Z"),
    isFailed: true,
  },
];

let mockSyncLogsData:
  | { data: typeof mockFailedLogs; pagination: object }
  | undefined;
let mockIsLoading = false;

vi.mock("@/modules/integrations/presentation/hooks/use-integrations", () => ({
  useSyncLogs: () => ({
    data: mockSyncLogsData,
    isLoading: mockIsLoading,
  }),
  useRetrySyncLog: () => ({
    isPending: false,
    mutate: vi.fn(),
  }),
  useRetryAllFailed: () => ({
    isPending: false,
    mutate: vi.fn(),
  }),
}));

import { FailedSyncsTab } from "@/modules/integrations/presentation/components/failed-syncs-tab";

describe("FailedSyncsTab", () => {
  beforeEach(() => {
    mockSyncLogsData = {
      data: mockFailedLogs,
      pagination: { page: 1, limit: 50, total: 2, totalPages: 1 },
    };
    mockIsLoading = false;
  });

  it("Given: loading state When: rendering Then: should show loading text", () => {
    mockIsLoading = true;
    mockSyncLogsData = undefined;

    render(<FailedSyncsTab connectionId="conn-1" />);

    expect(screen.getByText("loading")).toBeInTheDocument();
  });

  it("Given: no failed logs When: rendering Then: should show empty message", () => {
    mockSyncLogsData = {
      data: [],
      pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
    };

    render(<FailedSyncsTab connectionId="conn-1" />);

    expect(screen.getByText("empty")).toBeInTheDocument();
  });

  it("Given: failed logs When: rendering Then: should show title", () => {
    render(<FailedSyncsTab connectionId="conn-1" />);

    expect(screen.getByText("title")).toBeInTheDocument();
  });

  it("Given: failed logs When: rendering Then: should show order IDs", () => {
    render(<FailedSyncsTab connectionId="conn-1" />);

    expect(screen.getByText("VTEX-001")).toBeInTheDocument();
    expect(screen.getByText("VTEX-002")).toBeInTheDocument();
  });

  it("Given: failed logs > 0 When: rendering Then: should show count badge", () => {
    render(<FailedSyncsTab connectionId="conn-1" />);

    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("Given: failed logs > 0 When: rendering Then: should show retry all button", () => {
    render(<FailedSyncsTab connectionId="conn-1" />);

    expect(screen.getByText("retryAll")).toBeInTheDocument();
  });

  it("Given: log with errorMessage When: rendering Then: should show error", () => {
    render(<FailedSyncsTab connectionId="conn-1" />);

    expect(screen.getByText("Connection timeout")).toBeInTheDocument();
  });

  it("Given: log without errorMessage When: rendering Then: should not show error text", () => {
    mockSyncLogsData = {
      data: [mockFailedLogs[1]],
      pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
    };

    render(<FailedSyncsTab connectionId="conn-1" />);

    expect(screen.queryByText("Connection timeout")).not.toBeInTheDocument();
  });

  it("Given: failed logs When: rendering Then: should show retry buttons for each", () => {
    render(<FailedSyncsTab connectionId="conn-1" />);

    const retryButtons = screen.getAllByText("retryOne");
    expect(retryButtons).toHaveLength(2);
  });
});
