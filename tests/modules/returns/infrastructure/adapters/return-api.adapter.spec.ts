import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/shared/infrastructure/http", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from "@/shared/infrastructure/http";
import { ReturnApiAdapter } from "@/modules/returns/infrastructure/adapters/return-api.adapter";
import { Return } from "@/modules/returns/domain/entities/return.entity";
import type {
  ReturnApiRawDto,
  ReturnResponseDto,
} from "@/modules/returns/application/dto/return.dto";

const mockedGet = vi.mocked(apiClient.get);
const mockedPost = vi.mocked(apiClient.post);
const mockedPut = vi.mocked(apiClient.put);
const mockedDelete = vi.mocked(apiClient.delete);

function buildReturnRawDto(
  overrides: Partial<ReturnApiRawDto> = {},
): ReturnApiRawDto {
  return {
    id: "ret-1",
    returnNumber: "RT-0001",
    status: "DRAFT",
    type: "RETURN_CUSTOMER",
    warehouseId: "wh-1",
    totalAmount: 50,
    currency: "USD",
    createdBy: "user-1",
    createdAt: "2026-02-01T10:00:00.000Z",
    ...overrides,
  };
}

function buildReturnResponseDto(
  overrides: Partial<ReturnResponseDto> = {},
): ReturnResponseDto {
  return {
    id: "ret-1",
    returnNumber: "RT-0001",
    status: "DRAFT",
    type: "RETURN_CUSTOMER",
    reason: null,
    warehouseId: "wh-1",
    saleId: null,
    note: null,
    totalAmount: 50,
    currency: "USD",
    lines: [],
    createdBy: "user-1",
    createdAt: "2026-02-01T10:00:00.000Z",
    ...overrides,
  };
}

function wrapListResponse(
  data: ReturnApiRawDto[],
  pagination = { page: 1, limit: 20, total: 1, totalPages: 1 },
) {
  return {
    data: { data, pagination },
    status: 200,
    headers: {},
  };
}

function wrapDetailResponse(data: ReturnResponseDto) {
  return {
    data: { data },
    status: 200,
    headers: {},
  };
}

describe("ReturnApiAdapter", () => {
  let adapter: ReturnApiAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new ReturnApiAdapter();
  });

  describe("findAll", () => {
    it("Given returns exist, When findAll is called without filters, Then it returns paginated results mapped via fromApiRaw", async () => {
      const raw1 = buildReturnRawDto({ id: "ret-1" });
      const raw2 = buildReturnRawDto({ id: "ret-2", type: "RETURN_SUPPLIER" });
      mockedGet.mockResolvedValue(
        wrapListResponse([raw1, raw2], {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
        }),
      );

      const result = await adapter.findAll();

      expect(mockedGet).toHaveBeenCalledWith("/returns", { params: {} });
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toBeInstanceOf(Return);
      expect(result.pagination.total).toBe(2);
    });

    it("Given filters are provided, When findAll is called, Then query params are built correctly", async () => {
      mockedGet.mockResolvedValue(wrapListResponse([]));

      await adapter.findAll({
        warehouseIds: ["wh-1"],
        status: ["DRAFT", "CONFIRMED"],
        types: ["RETURN_CUSTOMER"],
        startDate: "2026-01-01",
        endDate: "2026-01-31",
        search: "RT-001",
        sortBy: "createdAt",
        sortOrder: "desc",
        page: 3,
        limit: 15,
      });

      expect(mockedGet).toHaveBeenCalledWith("/returns", {
        params: {
          warehouseId: "wh-1",
          status: "DRAFT,CONFIRMED",
          type: "RETURN_CUSTOMER",
          startDate: "2026-01-01",
          endDate: "2026-01-31",
          search: "RT-001",
          sortBy: "createdAt",
          sortOrder: "desc",
          page: 3,
          limit: 15,
        },
      });
    });
  });

  describe("findById", () => {
    it("Given a return exists, When findById is called, Then it returns the mapped Return via toDomain", async () => {
      const dto = buildReturnResponseDto({
        id: "ret-42",
        returnNumber: "RT-0042",
        status: "CONFIRMED",
        reason: "Defective item",
      });
      mockedGet.mockResolvedValue(wrapDetailResponse(dto));

      const result = await adapter.findById("ret-42");

      expect(mockedGet).toHaveBeenCalledWith("/returns/ret-42");
      expect(result).toBeInstanceOf(Return);
      expect(result!.id).toBe("ret-42");
    });

    it("Given the return does not exist, When findById is called, Then it returns null", async () => {
      mockedGet.mockRejectedValue({ response: { status: 404 } });

      const result = await adapter.findById("nonexistent");

      expect(result).toBeNull();
    });

    it("Given a non-404 error occurs, When findById is called, Then it rethrows the error", async () => {
      mockedGet.mockRejectedValue(new Error("Server error"));

      await expect(adapter.findById("ret-1")).rejects.toThrow("Server error");
    });
  });

  describe("create", () => {
    it("Given valid create data, When create is called, Then it posts to /returns and returns the created Return", async () => {
      const createDto = {
        type: "RETURN_CUSTOMER" as const,
        warehouseId: "wh-1",
        reason: "Wrong size",
      };
      const responseDto = buildReturnResponseDto({
        id: "ret-new",
        reason: "Wrong size",
      });
      mockedPost.mockResolvedValue(wrapDetailResponse(responseDto));

      const result = await adapter.create(createDto);

      expect(mockedPost).toHaveBeenCalledWith("/returns", createDto);
      expect(result).toBeInstanceOf(Return);
      expect(result.id).toBe("ret-new");
    });
  });

  describe("update", () => {
    it("Given a return exists, When update is called, Then it puts to /returns/:id and returns the updated Return", async () => {
      const updateDto = { reason: "Updated reason", note: "Added note" };
      const responseDto = buildReturnResponseDto({
        id: "ret-1",
        reason: "Updated reason",
        note: "Added note",
      });
      mockedPut.mockResolvedValue(wrapDetailResponse(responseDto));

      const result = await adapter.update("ret-1", updateDto);

      expect(mockedPut).toHaveBeenCalledWith("/returns/ret-1", updateDto);
      expect(result).toBeInstanceOf(Return);
    });
  });

  describe("confirm", () => {
    it("Given a draft return, When confirm is called, Then it posts to /returns/:id/confirm", async () => {
      const dto = buildReturnResponseDto({ id: "ret-1", status: "CONFIRMED" });
      mockedPost.mockResolvedValue(wrapDetailResponse(dto));

      const result = await adapter.confirm("ret-1");

      expect(mockedPost).toHaveBeenCalledWith("/returns/ret-1/confirm");
      expect(result).toBeInstanceOf(Return);
    });
  });

  describe("cancel", () => {
    it("Given a return, When cancel is called, Then it posts to /returns/:id/cancel", async () => {
      const dto = buildReturnResponseDto({ id: "ret-1", status: "CANCELLED" });
      mockedPost.mockResolvedValue(wrapDetailResponse(dto));

      const result = await adapter.cancel("ret-1");

      expect(mockedPost).toHaveBeenCalledWith("/returns/ret-1/cancel");
      expect(result).toBeInstanceOf(Return);
    });
  });

  describe("addLine", () => {
    it("Given a return, When addLine is called, Then it posts to /returns/:id/lines", async () => {
      const lineDto = {
        productId: "prod-1",
        quantity: 3,
        originalSalePrice: 25.0,
        currency: "USD",
      };
      const responseDto = buildReturnResponseDto({ id: "ret-1", totalAmount: 75 });
      mockedPost.mockResolvedValue(wrapDetailResponse(responseDto));

      const result = await adapter.addLine("ret-1", lineDto);

      expect(mockedPost).toHaveBeenCalledWith("/returns/ret-1/lines", lineDto);
      expect(result).toBeInstanceOf(Return);
    });
  });

  describe("removeLine", () => {
    it("Given a return with lines, When removeLine is called, Then it deletes /returns/:returnId/lines/:lineId", async () => {
      const responseDto = buildReturnResponseDto({ id: "ret-1" });
      mockedDelete.mockResolvedValue(wrapDetailResponse(responseDto));

      const result = await adapter.removeLine("ret-1", "line-7");

      expect(mockedDelete).toHaveBeenCalledWith("/returns/ret-1/lines/line-7");
      expect(result).toBeInstanceOf(Return);
    });
  });
});
