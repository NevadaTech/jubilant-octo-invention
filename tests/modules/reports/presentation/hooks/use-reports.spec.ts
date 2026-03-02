import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { createQueryWrapper } from "@tests/utils/create-query-wrapper";

const mockViewReport = vi.fn();
const mockExportReport = vi.fn();

vi.mock("@/config/di/container", () => ({
  getContainer: vi.fn(() => ({
    reportRepository: {
      viewReport: mockViewReport,
      exportReport: mockExportReport,
    },
  })),
}));

import {
  useReportView,
  useReportExport,
} from "@/modules/reports/presentation/hooks/use-reports";

describe("use-reports hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── useReportView ──────────────────────────────────────────────────

  describe("useReportView", () => {
    it("Given a valid report type, When the hook fetches, Then it returns report data", async () => {
      const reportData = {
        data: [
          { productId: "p-1", name: "Widget", quantity: 100 },
          { productId: "p-2", name: "Gadget", quantity: 50 },
        ],
        metadata: { totalRecords: 2 },
      };
      mockViewReport.mockResolvedValueOnce(reportData);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(
        () => useReportView("AVAILABLE_INVENTORY" as any),
        { wrapper: Wrapper },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockViewReport).toHaveBeenCalledWith(
        "AVAILABLE_INVENTORY",
        undefined,
      );
      expect(result.current.data).toEqual(reportData);
    });

    it("Given a null type, When the hook renders, Then it does not fetch", () => {
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useReportView(null), {
        wrapper: Wrapper,
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockViewReport).not.toHaveBeenCalled();
    });

    it("Given enabled=false, When the hook renders, Then it does not fetch", () => {
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(
        () => useReportView("SALES" as any, undefined, false),
        { wrapper: Wrapper },
      );

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockViewReport).not.toHaveBeenCalled();
    });

    it("Given a report type and parameters, When the hook fetches, Then it passes parameters", async () => {
      mockViewReport.mockResolvedValueOnce({ data: [], metadata: {} });
      const params = { warehouseId: "w-1", startDate: "2026-01-01" };
      const { Wrapper } = createQueryWrapper();

      renderHook(() => useReportView("LOW_STOCK" as any, params), {
        wrapper: Wrapper,
      });

      await waitFor(() =>
        expect(mockViewReport).toHaveBeenCalledWith("LOW_STOCK", params),
      );
    });

    it("Given a server error, When the hook fetches with retry exhausted, Then it reports the error", async () => {
      // The hook has retry: 1, so we need to fail twice (initial + 1 retry)
      mockViewReport
        .mockRejectedValueOnce(new Error("Server error"))
        .mockRejectedValueOnce(new Error("Server error"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(
        () => useReportView("VALUATION" as any),
        { wrapper: Wrapper },
      );

      await waitFor(
        () => expect(result.current.isError).toBe(true),
        { timeout: 10000 },
      );
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  // ── useReportExport ────────────────────────────────────────────────

  describe("useReportExport", () => {
    it("Given a valid report, When exporting as EXCEL, Then it calls exportReport with correct args", async () => {
      const mockBlob = new Blob(["test"], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      mockExportReport.mockResolvedValueOnce(mockBlob);

      // Mock DOM APIs needed by the onSuccess handler without breaking renderHook
      const mockClick = vi.fn();
      const originalCreateElement = document.createElement.bind(document);
      const originalAppendChild = document.body.appendChild.bind(document.body);
      const originalRemoveChild = document.body.removeChild.bind(document.body);

      const mockCreateObjectURL = vi.fn(() => "blob:mock-url");
      const mockRevokeObjectURL = vi.fn();
      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;

      const createElementSpy = vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
        if (tag === "a") {
          return { href: "", download: "", click: mockClick, style: {} } as any;
        }
        return originalCreateElement(tag);
      });
      const appendChildSpy = vi.spyOn(document.body, "appendChild").mockImplementation((node: any) => {
        if (node?.click === mockClick) return node;
        return originalAppendChild(node);
      });
      const removeChildSpy = vi.spyOn(document.body, "removeChild").mockImplementation((node: any) => {
        if (node?.click === mockClick) return node;
        return originalRemoveChild(node);
      });

      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useReportExport(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          type: "SALES" as any,
          format: "EXCEL" as any,
          parameters: { startDate: "2026-01-01" },
        });
      });

      expect(mockExportReport).toHaveBeenCalledWith(
        "SALES",
        "EXCEL",
        { startDate: "2026-01-01" },
        undefined,
      );
      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it("Given a server error, When exporting, Then the mutation fails", async () => {
      mockExportReport.mockRejectedValueOnce(new Error("Export failed"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useReportExport(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        result.current.mutate({
          type: "SALES" as any,
          format: "CSV" as any,
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });
});
