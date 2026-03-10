import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/shared/infrastructure/http", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { apiClient } from "@/shared/infrastructure/http";
import { ImportApiAdapter } from "@/modules/imports/infrastructure/adapters/import-api.adapter";
import type { ImportFilters } from "@/modules/imports/application/dto/import.dto";

const mockedGet = vi.mocked(apiClient.get);
const mockedPost = vi.mocked(apiClient.post);

describe("ImportApiAdapter", () => {
  let adapter: ImportApiAdapter;

  beforeEach(() => {
    adapter = new ImportApiAdapter();
    vi.clearAllMocks();
  });

  describe("findAll", () => {
    it("should fetch paginated imports", async () => {
      mockedGet.mockResolvedValue({
        data: {
          success: true,
          data: [
            {
              id: "b1",
              type: "PRODUCTS",
              status: "COMPLETED",
              fileName: "test.csv",
              totalRows: 10,
              processedRows: 10,
              validRows: 10,
              invalidRows: 0,
              progress: 100,
              createdBy: "user-1",
              createdAt: "2024-01-01",
            },
          ],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        },
        status: 200,
        headers: {},
      });

      const result = await adapter.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].type).toBe("PRODUCTS");
      expect(result.pagination.total).toBe(1);
    });
  });

  describe("getStatus", () => {
    it("should return batch status", async () => {
      mockedGet.mockResolvedValue({
        data: {
          success: true,
          data: {
            id: "b1",
            type: "PRODUCTS",
            status: "PROCESSING",
            fileName: "test.csv",
            totalRows: 100,
            processedRows: 50,
            validRows: 50,
            invalidRows: 0,
            progress: 50,
            createdBy: "user-1",
            createdAt: "2024-01-01",
          },
        },
        status: 200,
        headers: {},
      });

      const result = await adapter.getStatus("b1");

      expect(result).not.toBeNull();
      expect(result?.status).toBe("PROCESSING");
      expect(result?.isProcessing).toBe(true);
    });

    it("should return null on error", async () => {
      mockedGet.mockRejectedValue(new Error("Not found"));

      const result = await adapter.getStatus("invalid");
      expect(result).toBeNull();
    });
  });

  describe("preview", () => {
    it("should post file for preview", async () => {
      mockedPost.mockResolvedValue({
        data: {
          success: true,
          data: {
            totalRows: 5,
            validRows: 5,
            invalidRows: 0,
            structureErrors: [],
            rowErrors: [],
            warnings: [],
          },
        },
        status: 200,
        headers: {},
      });

      const file = new File(["content"], "test.csv", { type: "text/csv" });
      const result = await adapter.preview(file, "PRODUCTS");

      expect(result.totalRows).toBe(5);
      expect(result.canBeProcessed).toBe(true);
      expect(mockedPost).toHaveBeenCalledWith(
        "/imports/preview",
        expect.any(FormData),
      );
    });
  });

  describe("findAll", () => {
    it("Given: type filter When: findAll Then: should append type param", async () => {
      mockedGet.mockResolvedValue({
        data: {
          success: true,
          data: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        },
      });

      await adapter.findAll({ page: 1, limit: 10, type: "PRODUCTS" });

      expect(mockedGet).toHaveBeenCalledWith(
        expect.stringContaining("type=PRODUCTS"),
      );
    });

    it("Given: status filter When: findAll Then: should append status param", async () => {
      mockedGet.mockResolvedValue({
        data: {
          success: true,
          data: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        },
      });

      await adapter.findAll({ page: 1, limit: 10, status: "COMPLETED" });

      expect(mockedGet).toHaveBeenCalledWith(
        expect.stringContaining("status=COMPLETED"),
      );
    });

    it("Given: no page/limit When: findAll Then: should use basePath only", async () => {
      mockedGet.mockResolvedValue({
        data: {
          success: true,
          data: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        },
      });

      await adapter.findAll({} as ImportFilters);

      expect(mockedGet).toHaveBeenCalledWith("/imports");
    });
  });

  describe("execute", () => {
    it("Given: file and type with note When: execute Then: should append note to FormData", async () => {
      mockedPost.mockResolvedValue({
        data: {
          success: true,
          data: {
            id: "b2",
            status: "PROCESSING",
            totalRows: 10,
            processedRows: 0,
            validRows: 0,
            invalidRows: 0,
          },
        },
      });

      const file = new File(["content"], "test.csv", { type: "text/csv" });
      const result = await adapter.execute(file, "PRODUCTS", "my note");

      expect(result).toBeDefined();
      const calledFormData = mockedPost.mock.calls[0][1] as FormData;
      expect(calledFormData.get("note")).toBe("my note");
    });

    it("Given: file and type without note When: execute Then: should not append note", async () => {
      mockedPost.mockResolvedValue({
        data: {
          success: true,
          data: {
            id: "b3",
            status: "PROCESSING",
            totalRows: 10,
            processedRows: 5,
            validRows: 5,
            invalidRows: 0,
          },
        },
      });

      const file = new File(["content"], "test.csv", { type: "text/csv" });
      await adapter.execute(file, "PRODUCTS");

      const calledFormData = mockedPost.mock.calls[0][1] as FormData;
      expect(calledFormData.get("note")).toBeNull();
    });

    it("Given: totalRows is 0 When: execute Then: progress should be 0", async () => {
      mockedPost.mockResolvedValue({
        data: {
          success: true,
          data: {
            id: "b4",
            status: "PROCESSING",
            totalRows: 0,
            processedRows: 0,
            validRows: 0,
            invalidRows: 0,
          },
        },
      });

      const file = new File(["content"], "test.csv", { type: "text/csv" });
      const result = await adapter.execute(file, "PRODUCTS");

      expect(result.progress).toBe(0);
    });

    it("Given: totalRows > 0 When: execute Then: progress should be calculated", async () => {
      mockedPost.mockResolvedValue({
        data: {
          success: true,
          data: {
            id: "b5",
            status: "PROCESSING",
            totalRows: 100,
            processedRows: 50,
            validRows: 50,
            invalidRows: 0,
          },
        },
      });

      const file = new File(["content"], "test.csv", { type: "text/csv" });
      const result = await adapter.execute(file, "PRODUCTS");

      expect(result.progress).toBe(50);
    });
  });

  describe("downloadTemplate", () => {
    it("Given: csv format When: downloadTemplate Then: should return blob", async () => {
      const mockBlob = new Blob(["csv content"]);
      mockedGet.mockResolvedValue({
        data: mockBlob,
        status: 200,
        headers: {},
      });

      const result = await adapter.downloadTemplate("PRODUCTS", "csv");
      expect(result).toBeInstanceOf(Blob);
    });

    it("Given: xlsx format When: downloadTemplate Then: should return blob", async () => {
      const mockBlob = new Blob(["xlsx content"]);
      mockedGet.mockResolvedValue({
        data: mockBlob,
        status: 200,
        headers: {},
      });

      const result = await adapter.downloadTemplate("PRODUCTS", "xlsx");
      expect(result).toBeInstanceOf(Blob);
    });

    it("Given: response is not Blob When: downloadTemplate Then: should wrap in new Blob with csv mime", async () => {
      mockedGet.mockResolvedValue({
        data: "raw csv data",
        status: 200,
        headers: {},
      });

      const result = await adapter.downloadTemplate("PRODUCTS", "csv");
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe("text/csv");
    });

    it("Given: response is not Blob and xlsx format When: downloadTemplate Then: should wrap with xlsx mime", async () => {
      mockedGet.mockResolvedValue({
        data: "raw xlsx data",
        status: 200,
        headers: {},
      });

      const result = await adapter.downloadTemplate("PRODUCTS", "xlsx");
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
    });
  });

  describe("downloadErrors", () => {
    it("Given: csv format response is Blob When: downloadErrors Then: should return the blob", async () => {
      const mockBlob = new Blob(["error csv"]);
      mockedGet.mockResolvedValue({
        data: mockBlob,
        status: 200,
        headers: {},
      });

      const result = await adapter.downloadErrors("b1", "csv");
      expect(result).toBeInstanceOf(Blob);
    });

    it("Given: xlsx format response is Blob When: downloadErrors Then: should return the blob", async () => {
      const mockBlob = new Blob(["error xlsx"]);
      mockedGet.mockResolvedValue({
        data: mockBlob,
        status: 200,
        headers: {},
      });

      const result = await adapter.downloadErrors("b1", "xlsx");
      expect(result).toBeInstanceOf(Blob);
    });

    it("Given: response is not Blob and csv format When: downloadErrors Then: should wrap in Blob with csv mime", async () => {
      mockedGet.mockResolvedValue({
        data: "raw error csv",
        status: 200,
        headers: {},
      });

      const result = await adapter.downloadErrors("b1", "csv");
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe("text/csv");
    });

    it("Given: response is not Blob and xlsx format When: downloadErrors Then: should wrap in Blob with xlsx mime", async () => {
      mockedGet.mockResolvedValue({
        data: "raw error xlsx",
        status: 200,
        headers: {},
      });

      const result = await adapter.downloadErrors("b1", "xlsx");
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
    });
  });
});
