import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { WarehouseFormPage } from "@/modules/inventory/presentation/components/warehouses/warehouse-form-page";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

const mockPush = vi.fn();
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({ push: mockPush }),
}));

let mockWarehouseData: {
  data: {
    id: string;
    code: string;
    name: string;
    address: string | null;
  } | null;
  isLoading: boolean;
};

vi.mock("@/modules/inventory/presentation/hooks/use-warehouses", () => ({
  useCreateWarehouse: () => ({ isPending: false, isError: false, mutateAsync: vi.fn() }),
  useUpdateWarehouse: () => ({ isPending: false, isError: false, mutateAsync: vi.fn() }),
  useWarehouse: () => mockWarehouseData,
}));

vi.mock("@/modules/inventory/presentation/schemas/warehouse.schema", () => ({
  createWarehouseSchema: { parse: vi.fn() },
  toCreateWarehouseDto: vi.fn((d: unknown) => d),
  toUpdateWarehouseDto: vi.fn((d: unknown) => d),
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => vi.fn(),
}));

// --- Tests ---

describe("WarehouseFormPage", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockWarehouseData = { data: null, isLoading: false };
  });

  it("Given: no warehouseId When: rendering Then: should show create title and description", () => {
    render(<WarehouseFormPage />);

    expect(screen.getByText("form.createTitle")).toBeInTheDocument();
    expect(screen.getByText("form.createDescription")).toBeInTheDocument();
  });

  it("Given: no warehouseId When: rendering Then: should show form fields for code, name, and address", () => {
    render(<WarehouseFormPage />);

    expect(screen.getByText(/fields\.code/)).toBeInTheDocument();
    expect(screen.getByText(/fields\.name/)).toBeInTheDocument();
    expect(screen.getByText("fields.address")).toBeInTheDocument();
  });

  it("Given: no warehouseId When: rendering Then: should show warehouse info card title", () => {
    render(<WarehouseFormPage />);

    expect(screen.getByText("form.warehouseInfo")).toBeInTheDocument();
  });

  it("Given: no warehouseId When: rendering Then: should show cancel and create buttons", () => {
    render(<WarehouseFormPage />);

    expect(screen.getByText("cancel")).toBeInTheDocument();
    expect(screen.getByText("create")).toBeInTheDocument();
  });

  it("Given: warehouseId with loading state When: rendering Then: should show loading spinner", () => {
    mockWarehouseData = { data: null, isLoading: true };

    const { container } = render(<WarehouseFormPage warehouseId="wh-1" />);

    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("Given: warehouseId with loaded data When: rendering Then: should show edit title", () => {
    mockWarehouseData = {
      data: { id: "wh-1", code: "WH-01", name: "Main Warehouse", address: "123 Main St" },
      isLoading: false,
    };

    render(<WarehouseFormPage warehouseId="wh-1" />);

    expect(screen.getByText("form.editTitle")).toBeInTheDocument();
    expect(screen.getByText("form.editDescription")).toBeInTheDocument();
  });

  it("Given: warehouseId with loaded data When: rendering Then: should show save button instead of create", () => {
    mockWarehouseData = {
      data: { id: "wh-1", code: "WH-01", name: "Main Warehouse", address: null },
      isLoading: false,
    };

    render(<WarehouseFormPage warehouseId="wh-1" />);

    expect(screen.getByText("save")).toBeInTheDocument();
    expect(screen.queryByText("create")).not.toBeInTheDocument();
  });

  it("Given: no warehouseId When: rendering Then: should render back link to warehouses list", () => {
    render(<WarehouseFormPage />);

    const links = screen.getAllByRole("link");
    const backLink = links.find((link) => link.getAttribute("href") === "/dashboard/inventory/warehouses");
    expect(backLink).toBeDefined();
  });
});
