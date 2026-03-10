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
import { SaleApiAdapter } from "@/modules/sales/infrastructure/adapters/sale-api.adapter";
import { Sale } from "@/modules/sales/domain/entities/sale.entity";
import type {
  SaleApiRawDto,
  SaleResponseDto,
} from "@/modules/sales/application/dto/sale.dto";

const mockedGet = vi.mocked(apiClient.get);
const mockedPost = vi.mocked(apiClient.post);
const mockedPatch = vi.mocked(apiClient.patch);
const mockedDelete = vi.mocked(apiClient.delete);

function buildSaleRawDto(
  overrides: Partial<SaleApiRawDto> = {},
): SaleApiRawDto {
  return {
    id: "sale-1",
    saleNumber: "SL-0001",
    status: "DRAFT",
    warehouseId: "wh-1",
    customerReference: null,
    note: null,
    totalAmount: 100,
    currency: "USD",
    movementId: null,
    createdBy: "user-1",
    createdAt: "2026-02-01T10:00:00.000Z",
    confirmedAt: null,
    ...overrides,
  };
}

function buildSaleResponseDto(
  overrides: Partial<SaleResponseDto> = {},
): SaleResponseDto {
  return {
    id: "sale-1",
    saleNumber: "SL-0001",
    status: "DRAFT",
    warehouseId: "wh-1",
    customerReference: null,
    note: null,
    totalAmount: 100,
    currency: "USD",
    movementId: null,
    createdBy: "user-1",
    createdAt: "2026-02-01T10:00:00.000Z",
    confirmedAt: null,
    lines: [],
    ...overrides,
  };
}

function wrapListResponse(
  data: SaleApiRawDto[],
  pagination = { page: 1, limit: 20, total: 1, totalPages: 1 },
) {
  return {
    data: { data, pagination },
    status: 200,
    headers: {},
  };
}

function wrapDetailResponse(data: SaleResponseDto) {
  return {
    data: { data },
    status: 200,
    headers: {},
  };
}

describe("SaleApiAdapter", () => {
  let adapter: SaleApiAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new SaleApiAdapter();
  });

  describe("findAll", () => {
    it("Given sales exist, When findAll is called without filters, Then it returns paginated sales mapped via fromApiRaw", async () => {
      const raw1 = buildSaleRawDto({ id: "s1", saleNumber: "SL-0001" });
      const raw2 = buildSaleRawDto({ id: "s2", saleNumber: "SL-0002" });
      mockedGet.mockResolvedValue(
        wrapListResponse([raw1, raw2], {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
        }),
      );

      const result = await adapter.findAll();

      expect(mockedGet).toHaveBeenCalledWith("/sales", { params: {} });
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toBeInstanceOf(Sale);
      expect(result.pagination.total).toBe(2);
    });

    it("Given filters are provided, When findAll is called, Then query params are built correctly", async () => {
      mockedGet.mockResolvedValue(wrapListResponse([]));

      await adapter.findAll({
        warehouseIds: ["wh-1", "wh-2"],
        status: ["DRAFT", "CONFIRMED"],
        startDate: "2026-01-01",
        endDate: "2026-01-31",
        search: "SL-001",
        sortBy: "createdAt",
        sortOrder: "desc",
        page: 2,
        limit: 10,
      });

      expect(mockedGet).toHaveBeenCalledWith("/sales", {
        params: {
          warehouseId: "wh-1,wh-2",
          status: "DRAFT,CONFIRMED",
          startDate: "2026-01-01",
          endDate: "2026-01-31",
          search: "SL-001",
          sortBy: "createdAt",
          sortOrder: "desc",
          page: 2,
          limit: 10,
        },
      });
    });
  });

  describe("findById", () => {
    it("Given a sale exists, When findById is called, Then it returns the mapped Sale via toDomain", async () => {
      const dto = buildSaleResponseDto({
        id: "sale-42",
        saleNumber: "SL-0042",
        status: "CONFIRMED",
      });
      mockedGet.mockResolvedValue(wrapDetailResponse(dto));

      const result = await adapter.findById("sale-42");

      expect(mockedGet).toHaveBeenCalledWith("/sales/sale-42");
      expect(result).toBeInstanceOf(Sale);
      expect(result!.id).toBe("sale-42");
    });

    it("Given the sale does not exist, When findById is called, Then it returns null", async () => {
      mockedGet.mockRejectedValue({ response: { status: 404 } });

      const result = await adapter.findById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("Given valid sale data, When create is called, Then it posts and returns the created Sale", async () => {
      const createDto = { warehouseId: "wh-1", note: "Test sale" };
      const responseDto = buildSaleResponseDto({
        id: "sale-new",
        note: "Test sale",
      });
      mockedPost.mockResolvedValue(wrapDetailResponse(responseDto));

      const result = await adapter.create(createDto);

      expect(mockedPost).toHaveBeenCalledWith("/sales", createDto);
      expect(result).toBeInstanceOf(Sale);
      expect(result.id).toBe("sale-new");
    });
  });

  describe("update", () => {
    it("Given a sale exists, When update is called, Then it patches and returns the updated Sale", async () => {
      const updateDto = { note: "Updated note" };
      const responseDto = buildSaleResponseDto({
        id: "sale-1",
        note: "Updated note",
      });
      mockedPatch.mockResolvedValue(wrapDetailResponse(responseDto));

      const result = await adapter.update("sale-1", updateDto);

      expect(mockedPatch).toHaveBeenCalledWith("/sales/sale-1", updateDto);
      expect(result).toBeInstanceOf(Sale);
    });
  });

  describe("confirm", () => {
    it("Given a draft sale, When confirm is called, Then it posts to /sales/:id/confirm", async () => {
      const dto = buildSaleResponseDto({ id: "sale-1", status: "CONFIRMED" });
      mockedPost.mockResolvedValue(wrapDetailResponse(dto));

      const result = await adapter.confirm("sale-1");

      expect(mockedPost).toHaveBeenCalledWith("/sales/sale-1/confirm");
      expect(result).toBeInstanceOf(Sale);
    });
  });

  describe("cancel", () => {
    it("Given a sale, When cancel is called, Then it posts to /sales/:id/cancel", async () => {
      const dto = buildSaleResponseDto({
        id: "sale-1",
        status: "CANCELLED" as never,
      });
      mockedPost.mockResolvedValue(wrapDetailResponse(dto));

      const result = await adapter.cancel("sale-1");

      expect(mockedPost).toHaveBeenCalledWith("/sales/sale-1/cancel");
      expect(result).toBeInstanceOf(Sale);
    });
  });

  describe("startPicking", () => {
    it("Given a confirmed sale, When startPicking is called, Then it posts to /sales/:id/pick", async () => {
      const dto = buildSaleResponseDto({ id: "sale-1", status: "PICKING" });
      mockedPost.mockResolvedValue(wrapDetailResponse(dto));

      const result = await adapter.startPicking("sale-1");

      expect(mockedPost).toHaveBeenCalledWith("/sales/sale-1/pick");
      expect(result).toBeInstanceOf(Sale);
    });
  });

  describe("ship", () => {
    it("Given a picking sale and shipping data, When ship is called, Then it posts to /sales/:id/ship with data", async () => {
      const shipDto = {
        trackingNumber: "TRK-123",
        shippingCarrier: "DHL",
        shippingNotes: "Handle with care",
      };
      const dto = buildSaleResponseDto({
        id: "sale-1",
        status: "SHIPPED",
        trackingNumber: "TRK-123",
      });
      mockedPost.mockResolvedValue(wrapDetailResponse(dto));

      const result = await adapter.ship("sale-1", shipDto);

      expect(mockedPost).toHaveBeenCalledWith("/sales/sale-1/ship", shipDto);
      expect(result).toBeInstanceOf(Sale);
    });
  });

  describe("complete", () => {
    it("Given a shipped sale, When complete is called, Then it posts to /sales/:id/complete", async () => {
      const dto = buildSaleResponseDto({ id: "sale-1", status: "COMPLETED" });
      mockedPost.mockResolvedValue(wrapDetailResponse(dto));

      const result = await adapter.complete("sale-1");

      expect(mockedPost).toHaveBeenCalledWith("/sales/sale-1/complete");
      expect(result).toBeInstanceOf(Sale);
    });
  });

  describe("addLine", () => {
    it("Given a sale, When addLine is called with line data, Then it posts to /sales/:id/lines", async () => {
      const lineDto = { productId: "prod-1", quantity: 5, salePrice: 25.0 };
      const dto = buildSaleResponseDto({ id: "sale-1", totalAmount: 125.0 });
      mockedPost.mockResolvedValue(wrapDetailResponse(dto));

      const result = await adapter.addLine("sale-1", lineDto);

      expect(mockedPost).toHaveBeenCalledWith("/sales/sale-1/lines", lineDto);
      expect(result).toBeInstanceOf(Sale);
    });
  });

  describe("removeLine", () => {
    it("Given a sale with lines, When removeLine is called, Then it deletes /sales/:saleId/lines/:lineId", async () => {
      const dto = buildSaleResponseDto({ id: "sale-1" });
      mockedDelete.mockResolvedValue(wrapDetailResponse(dto));

      const result = await adapter.removeLine("sale-1", "line-5");

      expect(mockedDelete).toHaveBeenCalledWith("/sales/sale-1/lines/line-5");
      expect(result).toBeInstanceOf(Sale);
    });
  });

  describe("getReturns", () => {
    it("Given a sale has returns, When getReturns is called, Then it returns mapped SaleReturnSummary array", async () => {
      const returnData = [
        {
          id: "ret-1",
          returnNumber: "RT-001",
          status: "CONFIRMED",
          type: "RETURN_CUSTOMER",
          totalAmount: 50,
          currency: "USD",
          createdAt: "2026-02-10T10:00:00.000Z",
        },
      ];
      mockedGet.mockResolvedValue({
        data: { data: returnData },
        status: 200,
        headers: {},
      });

      const result = await adapter.getReturns("sale-1");

      expect(mockedGet).toHaveBeenCalledWith("/sales/sale-1/returns");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("ret-1");
      expect(result[0].returnNumber).toBe("RT-001");
      expect(result[0].createdAt).toBeInstanceOf(Date);
    });

    it("Given a sale has no returns, When getReturns is called, Then it returns an empty array (body.data is null)", async () => {
      mockedGet.mockResolvedValue({
        data: { data: null },
        status: 200,
        headers: {},
      });

      const result = await adapter.getReturns("sale-1");

      expect(result).toEqual([]);
    });
  });

  describe("swapLine", () => {
    it("Given valid swap data, When swapLine is called, Then it posts to /sales/:id/swap and returns the swap result", async () => {
      const swapDto = {
        lineId: "l-1",
        replacementProductId: "p-2",
        swapQuantity: 2,
        sourceWarehouseId: "wh-1",
        pricingStrategy: "KEEP_ORIGINAL" as const,
      };
      const swapResult = {
        swapId: "sw-1",
        saleId: "sale-1",
        originalProductId: "p-1",
        replacementProductId: "p-2",
        swapQuantity: 2,
        originalSalePrice: 100,
        replacementSalePrice: 100,
        pricingStrategy: "KEEP_ORIGINAL",
        isCrossWarehouse: false,
        returnMovementId: "mov-r1",
        deductMovementId: "mov-d1",
        isPartial: false,
      };
      mockedPost.mockResolvedValue({
        data: { success: true, data: swapResult },
        status: 200,
        headers: {},
      });

      const result = await adapter.swapLine("sale-1", swapDto);

      expect(mockedPost).toHaveBeenCalledWith("/sales/sale-1/swap", swapDto);
      expect(result.swapId).toBe("sw-1");
      expect(result.isCrossWarehouse).toBe(false);
    });
  });

  describe("getSwapHistory", () => {
    it("Given a sale has swap history, When getSwapHistory is called, Then it returns the swap history array", async () => {
      const history = [
        {
          id: "sw-1",
          saleId: "sale-1",
          originalLineId: "l-1",
          newLineId: "l-2",
          originalProductId: "p-1",
          originalProductName: "Product A",
          originalProductSku: "SKU-A",
          replacementProductId: "p-2",
          replacementProductName: "Product B",
          replacementProductSku: "SKU-B",
          originalQuantity: 3,
          replacementQuantity: 3,
          originalSalePrice: 50,
          replacementSalePrice: 50,
          originalCurrency: "USD",
          replacementCurrency: "USD",
          pricingStrategy: "KEEP_ORIGINAL",
          isCrossWarehouse: false,
          reason: null,
          performedBy: "user-1",
          performedByName: "Admin",
          createdAt: "2026-02-15T10:00:00.000Z",
        },
      ];
      mockedGet.mockResolvedValue({
        data: { success: true, data: history },
        status: 200,
        headers: {},
      });

      const result = await adapter.getSwapHistory("sale-1");

      expect(mockedGet).toHaveBeenCalledWith("/sales/sale-1/swaps");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("sw-1");
    });
  });

  describe("findById error branches", () => {
    it("Given a non-404 error occurs, When findById is called, Then it rethrows the error", async () => {
      mockedGet.mockRejectedValue(new Error("Server error"));

      await expect(adapter.findById("sale-1")).rejects.toThrow("Server error");
    });

    it("Given a non-object error, When findById is called, Then it rethrows", async () => {
      mockedGet.mockRejectedValue("string error");

      await expect(adapter.findById("sale-1")).rejects.toBe("string error");
    });

    it("Given a null error, When findById is called, Then it rethrows", async () => {
      mockedGet.mockRejectedValue(null);

      await expect(adapter.findById("sale-1")).rejects.toBe(null);
    });

    it("Given error with response but non-404 status, When findById is called, Then it rethrows", async () => {
      const error = { response: { status: 500 } };
      mockedGet.mockRejectedValue(error);

      await expect(adapter.findById("sale-1")).rejects.toBe(error);
    });

    it("Given error with response but no status, When findById is called, Then it rethrows", async () => {
      const error = { response: {} };
      mockedGet.mockRejectedValue(error);

      await expect(adapter.findById("sale-1")).rejects.toBe(error);
    });

    it("Given error with response set to null, When findById is called, Then it rethrows", async () => {
      const error = { response: null };
      mockedGet.mockRejectedValue(error);

      await expect(adapter.findById("sale-1")).rejects.toBe(error);
    });
  });

  describe("buildQueryParams additional branches", () => {
    it("Given companyId filter, When findAll is called, Then it includes companyId in params", async () => {
      mockedGet.mockResolvedValue(wrapListResponse([]));

      await adapter.findAll({ companyId: "comp-1" });

      expect(mockedGet).toHaveBeenCalledWith("/sales", {
        params: { companyId: "comp-1" },
      });
    });

    it("Given empty arrays in filters, When findAll is called, Then empty arrays are omitted", async () => {
      mockedGet.mockResolvedValue(wrapListResponse([]));

      await adapter.findAll({ warehouseIds: [], status: [] });

      expect(mockedGet).toHaveBeenCalledWith("/sales", { params: {} });
    });

    it("Given only page and limit, When findAll is called, Then only those params are sent", async () => {
      mockedGet.mockResolvedValue(wrapListResponse([]));

      await adapter.findAll({ page: 3, limit: 25 });

      expect(mockedGet).toHaveBeenCalledWith("/sales", {
        params: { page: 3, limit: 25 },
      });
    });

    it("Given null data from API, When findAll is called, Then data defaults to empty array", async () => {
      mockedGet.mockResolvedValue({
        data: {
          data: null,
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        },
        status: 200,
        headers: {},
      });

      const result = await adapter.findAll();

      expect(result.data).toEqual([]);
    });

    it("Given only search filter, When findAll is called, Then only search param is sent", async () => {
      mockedGet.mockResolvedValue(wrapListResponse([]));

      await adapter.findAll({ search: "widget" });

      expect(mockedGet).toHaveBeenCalledWith("/sales", {
        params: { search: "widget" },
      });
    });

    it("Given only sortBy filter, When findAll is called, Then only sortBy param is sent", async () => {
      mockedGet.mockResolvedValue(wrapListResponse([]));

      await adapter.findAll({ sortBy: "saleNumber" });

      expect(mockedGet).toHaveBeenCalledWith("/sales", {
        params: { sortBy: "saleNumber" },
      });
    });

    it("Given only sortOrder filter, When findAll is called, Then only sortOrder param is sent", async () => {
      mockedGet.mockResolvedValue(wrapListResponse([]));

      await adapter.findAll({ sortOrder: "asc" });

      expect(mockedGet).toHaveBeenCalledWith("/sales", {
        params: { sortOrder: "asc" },
      });
    });

    it("Given only startDate filter, When findAll is called, Then only startDate param is sent", async () => {
      mockedGet.mockResolvedValue(wrapListResponse([]));

      await adapter.findAll({ startDate: "2026-01-01" });

      expect(mockedGet).toHaveBeenCalledWith("/sales", {
        params: { startDate: "2026-01-01" },
      });
    });

    it("Given only endDate filter, When findAll is called, Then only endDate param is sent", async () => {
      mockedGet.mockResolvedValue(wrapListResponse([]));

      await adapter.findAll({ endDate: "2026-12-31" });

      expect(mockedGet).toHaveBeenCalledWith("/sales", {
        params: { endDate: "2026-12-31" },
      });
    });

    it("Given undefined filter values, When findAll is called, Then they are omitted from params", async () => {
      mockedGet.mockResolvedValue(wrapListResponse([]));

      await adapter.findAll({
        search: undefined,
        sortBy: undefined,
        sortOrder: undefined,
        startDate: undefined,
        endDate: undefined,
        companyId: undefined,
      });

      expect(mockedGet).toHaveBeenCalledWith("/sales", { params: {} });
    });
  });
});
