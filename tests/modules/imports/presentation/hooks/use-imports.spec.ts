import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { createQueryWrapper } from "@tests/utils/create-query-wrapper";

const mockFindAll = vi.fn();
const mockGetStatus = vi.fn();
const mockPreview = vi.fn();
const mockExecute = vi.fn();
const mockDownloadTemplate = vi.fn();
const mockDownloadErrors = vi.fn();

vi.mock("@/config/di/container", () => ({
  getContainer: vi.fn(() => ({
    importRepository: {
      findAll: mockFindAll,
      getStatus: mockGetStatus,
      preview: mockPreview,
      execute: mockExecute,
      downloadTemplate: mockDownloadTemplate,
      downloadErrors: mockDownloadErrors,
    },
  })),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/shared/presentation/utils/get-api-error-message", () => ({
  getApiErrorMessage: vi.fn(() => "Error message"),
}));

import {
  useImports,
  useImportStatus,
  useDownloadTemplate,
  usePreviewImport,
  useExecuteImport,
  useDownloadErrors,
} from "@/modules/imports/presentation/hooks/use-imports";
import { toast } from "sonner";

describe("use-imports hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("useImports", () => {
    it("Given: import batches exist When: hook fetches Then: returns the batch list", async () => {
      const mockData = {
        data: [
          {
            id: "batch-1",
            type: "PRODUCTS",
            status: "COMPLETED",
            fileName: "products.csv",
          },
        ],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };
      mockFindAll.mockResolvedValueOnce(mockData);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useImports({ page: 1, limit: 20 }), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockFindAll).toHaveBeenCalledWith({ page: 1, limit: 20 });
      expect(result.current.data).toEqual(mockData);
    });

    it("Given: no filters When: hook fetches Then: passes default filters", async () => {
      mockFindAll.mockResolvedValueOnce({ data: [], pagination: {} });
      const { Wrapper } = createQueryWrapper();

      renderHook(() => useImports(), { wrapper: Wrapper });

      await waitFor(() =>
        expect(mockFindAll).toHaveBeenCalledWith({ page: 1, limit: 20 }),
      );
    });

    it("Given: filters with type When: hook fetches Then: passes filters to findAll", async () => {
      const filters = { type: "PRODUCTS" as const, page: 1, limit: 10 };
      mockFindAll.mockResolvedValueOnce({ data: [], pagination: {} });
      const { Wrapper } = createQueryWrapper();

      renderHook(() => useImports(filters), { wrapper: Wrapper });

      await waitFor(() => expect(mockFindAll).toHaveBeenCalledWith(filters));
    });
  });

  describe("useImportStatus", () => {
    it("Given: valid id When: hook fetches Then: returns the batch status", async () => {
      const batch = {
        id: "batch-1",
        type: "PRODUCTS",
        status: "PROCESSING",
        isTerminal: false,
      };
      mockGetStatus.mockResolvedValueOnce(batch);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useImportStatus("batch-1"), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockGetStatus).toHaveBeenCalledWith("batch-1");
      expect(result.current.data).toEqual(batch);
    });

    it("Given: null id When: hook renders Then: does not fetch", () => {
      const { Wrapper } = createQueryWrapper();
      const { result } = renderHook(() => useImportStatus(null), {
        wrapper: Wrapper,
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockGetStatus).not.toHaveBeenCalled();
    });
  });

  describe("useDownloadTemplate", () => {
    it("Given: valid type and format When: mutate Then: calls downloadTemplate and shows success toast", async () => {
      const mockBlob = new Blob(["csv data"], { type: "text/csv" });
      mockDownloadTemplate.mockResolvedValueOnce(mockBlob);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useDownloadTemplate(), {
        wrapper: Wrapper,
      });

      // Mock DOM methods AFTER renderHook so they don't interfere with rendering
      const originalCreateElement = document.createElement.bind(document);
      const mockLink = {
        href: "",
        download: "",
        click: vi.fn(),
        style: {},
      } as unknown as HTMLAnchorElement;
      vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
        if (tag === "a") return mockLink;
        return originalCreateElement(tag);
      });
      vi.spyOn(document.body, "appendChild").mockImplementation((node) => node);
      vi.spyOn(document.body, "removeChild").mockImplementation((node) => node);
      vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:url");
      vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

      await act(async () => {
        await result.current.mutateAsync({
          type: "PRODUCTS",
          format: "csv",
        });
      });

      expect(mockDownloadTemplate).toHaveBeenCalledWith("PRODUCTS", "csv");
      expect(toast.success).toHaveBeenCalledWith(
        "imports.messages.templateDownloaded",
      );
    });

    it("Given: server error When: mutate Then: shows error toast", async () => {
      mockDownloadTemplate.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useDownloadTemplate(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            type: "PRODUCTS",
            format: "csv",
          });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe("usePreviewImport", () => {
    it("Given: valid file and type When: mutate Then: returns preview result", async () => {
      const mockPreviewResult = {
        totalRows: 10,
        validRows: 8,
        invalidRows: 2,
        structureErrors: [],
        rowErrors: [],
        warnings: [],
      };
      mockPreview.mockResolvedValueOnce(mockPreviewResult);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => usePreviewImport(), {
        wrapper: Wrapper,
      });

      const file = new File(["content"], "test.csv", { type: "text/csv" });
      await act(async () => {
        await result.current.mutateAsync({ file, type: "PRODUCTS" });
      });

      expect(mockPreview).toHaveBeenCalledWith(file, "PRODUCTS");
    });

    it("Given: server error When: mutate Then: shows error toast", async () => {
      mockPreview.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => usePreviewImport(), {
        wrapper: Wrapper,
      });

      const file = new File(["content"], "test.csv", { type: "text/csv" });
      await act(async () => {
        try {
          await result.current.mutateAsync({ file, type: "PRODUCTS" });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe("useExecuteImport", () => {
    it("Given: valid file and type When: mutate Then: executes and shows success toast", async () => {
      const mockResult = {
        id: "batch-1",
        status: "PENDING",
        totalRows: 10,
        processedRows: 0,
        validRows: 0,
        invalidRows: 0,
      };
      mockExecute.mockResolvedValueOnce(mockResult);
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useExecuteImport(), {
        wrapper: Wrapper,
      });

      const file = new File(["content"], "test.csv", { type: "text/csv" });
      await act(async () => {
        await result.current.mutateAsync({ file, type: "PRODUCTS" });
      });

      expect(mockExecute).toHaveBeenCalledWith(file, "PRODUCTS", undefined);
      expect(toast.success).toHaveBeenCalledWith(
        "imports.messages.importStarted",
      );
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["imports", "list"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["products"],
      });
    });

    it("Given: valid file with note When: mutate Then: passes note to execute", async () => {
      const mockResult = { id: "batch-2", status: "PENDING" };
      mockExecute.mockResolvedValueOnce(mockResult);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useExecuteImport(), {
        wrapper: Wrapper,
      });

      const file = new File(["content"], "test.csv", { type: "text/csv" });
      await act(async () => {
        await result.current.mutateAsync({
          file,
          type: "WAREHOUSES",
          note: "Initial import",
        });
      });

      expect(mockExecute).toHaveBeenCalledWith(
        file,
        "WAREHOUSES",
        "Initial import",
      );
    });

    it("Given: server error When: mutate Then: shows error toast", async () => {
      mockExecute.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useExecuteImport(), {
        wrapper: Wrapper,
      });

      const file = new File(["content"], "test.csv", { type: "text/csv" });
      await act(async () => {
        try {
          await result.current.mutateAsync({ file, type: "PRODUCTS" });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe("useDownloadErrors", () => {
    it("Given: valid id and format When: mutate Then: downloads and shows success toast", async () => {
      const mockBlob = new Blob(["error data"], {
        type: "application/octet-stream",
      });
      mockDownloadErrors.mockResolvedValueOnce(mockBlob);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useDownloadErrors(), {
        wrapper: Wrapper,
      });

      // Mock DOM methods AFTER renderHook
      const originalCreateElement = document.createElement.bind(document);
      const mockLink = {
        href: "",
        download: "",
        click: vi.fn(),
        style: {},
      } as unknown as HTMLAnchorElement;
      vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
        if (tag === "a") return mockLink;
        return originalCreateElement(tag);
      });
      vi.spyOn(document.body, "appendChild").mockImplementation((node) => node);
      vi.spyOn(document.body, "removeChild").mockImplementation((node) => node);
      vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:url");
      vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

      await act(async () => {
        await result.current.mutateAsync({ id: "batch-1", format: "xlsx" });
      });

      expect(mockDownloadErrors).toHaveBeenCalledWith("batch-1", "xlsx");
      expect(toast.success).toHaveBeenCalledWith(
        "imports.messages.errorReportDownloaded",
      );
    });

    it("Given: server error When: mutate Then: shows error toast", async () => {
      mockDownloadErrors.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useDownloadErrors(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({ id: "batch-1", format: "xlsx" });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });
});
