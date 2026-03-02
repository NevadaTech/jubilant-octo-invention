import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { WarehouseForm } from "@/modules/inventory/presentation/components/warehouses/warehouse-form";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/modules/inventory/presentation/hooks/use-warehouses", () => ({
  useCreateWarehouse: () => ({ isPending: false, isError: false, mutateAsync: vi.fn() }),
  useUpdateWarehouse: () => ({ isPending: false, isError: false, mutateAsync: vi.fn() }),
  useWarehouse: () => ({ data: null, isLoading: false }),
}));

let mockIsOpen = true;
let mockEditingId: string | null = null;

vi.mock("@/modules/inventory/presentation/hooks/use-inventory-store", () => ({
  useWarehouseFormState: () => ({
    isOpen: mockIsOpen,
    editingId: mockEditingId,
    close: vi.fn(),
  }),
}));

describe("WarehouseForm", () => {
  it("Given: isOpen false When: rendering Then: should return null", () => {
    mockIsOpen = false;
    const { container } = render(<WarehouseForm />);
    expect(container.innerHTML).toBe("");
    mockIsOpen = true;
  });

  it("Given: isOpen true When: rendering Then: should show create title", () => {
    mockEditingId = null;
    render(<WarehouseForm />);
    expect(screen.getByText("form.createTitle")).toBeDefined();
  });

  it("Given: isOpen true When: rendering Then: should show code field", () => {
    render(<WarehouseForm />);
    expect(screen.getByText("fields.code")).toBeDefined();
  });

  it("Given: isOpen true When: rendering Then: should show name and address fields", () => {
    render(<WarehouseForm />);
    expect(screen.getByText("fields.name")).toBeDefined();
    expect(screen.getByText("fields.address")).toBeDefined();
  });

  it("Given: isOpen true When: rendering Then: should show cancel and create buttons", () => {
    render(<WarehouseForm />);
    expect(screen.getByText("cancel")).toBeDefined();
    expect(screen.getByText("create")).toBeDefined();
  });

  it("Given: editing mode When: rendering Then: should show edit title", () => {
    mockEditingId = "wh-1";
    render(<WarehouseForm />);
    expect(screen.getByText("form.editTitle")).toBeDefined();
    mockEditingId = null;
  });
});
