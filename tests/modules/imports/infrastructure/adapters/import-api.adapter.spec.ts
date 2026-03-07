import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/shared/infrastructure/http", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { apiClient } from "@/shared/infrastructure/http";
import { ImportApiAdapter } from "@/modules/imports/infrastructure/adapters/import-api.adapter";

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

  describe("downloadTemplate", () => {
    it("should download template as blob", async () => {
      const mockBlob = new Blob(["csv content"]);
      mockedGet.mockResolvedValue({
        data: mockBlob,
        status: 200,
        headers: {},
      });

      const result = await adapter.downloadTemplate("PRODUCTS", "csv");
      expect(result).toBeInstanceOf(Blob);
    });
  });
});
