import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductForm } from "@/modules/inventory/presentation/components/products/product-form";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/modules/inventory/presentation/hooks/use-products", () => ({
  useCreateProduct: () => ({
    isPending: false,
    isError: false,
    error: null,
    mutateAsync: vi.fn(),
  }),
  useUpdateProduct: () => ({
    isPending: false,
    isError: false,
    error: null,
    mutateAsync: vi.fn(),
  }),
  useProduct: () => ({ data: null, isLoading: false }),
}));

vi.mock(
  "@/modules/inventory/presentation/components/categories/category-multi-selector",
  () => ({
    CategoryMultiSelector: ({
      value,
      onChange,
    }: {
      value: string[];
      onChange: (v: string[]) => void;
    }) => <div data-testid="category-selector">{value.length} selected</div>,
  }),
);

let mockIsOpen = true;
let mockEditingId: string | null = null;

vi.mock("@/modules/inventory/presentation/hooks/use-inventory-store", () => ({
  useProductFormState: () => ({
    isOpen: mockIsOpen,
    editingId: mockEditingId,
    close: vi.fn(),
  }),
}));

describe("ProductForm", () => {
  it("Given: isOpen false When: rendering Then: should return null", () => {
    mockIsOpen = false;
    const { container } = render(<ProductForm />);
    expect(container.innerHTML).toBe("");
    mockIsOpen = true;
  });

  it("Given: isOpen true When: rendering Then: should show create title", () => {
    mockEditingId = null;
    render(<ProductForm />);
    expect(screen.getByText("form.createTitle")).toBeDefined();
  });

  it("Given: isOpen true When: rendering Then: should show SKU field", () => {
    render(<ProductForm />);
    expect(screen.getByPlaceholderText("fields.skuPlaceholder")).toBeDefined();
  });

  it("Given: isOpen true When: rendering Then: should show name field", () => {
    render(<ProductForm />);
    expect(screen.getByPlaceholderText("fields.namePlaceholder")).toBeDefined();
  });

  it("Given: isOpen true When: rendering Then: should show cancel and create buttons", () => {
    render(<ProductForm />);
    expect(screen.getByText("cancel")).toBeDefined();
    expect(screen.getByText("create")).toBeDefined();
  });

  it("Given: editing mode When: rendering Then: should show edit title and save button", () => {
    mockEditingId = "prod-1";
    render(<ProductForm />);
    expect(screen.getByText("form.editTitle")).toBeDefined();
    expect(screen.getByText("save")).toBeDefined();
    mockEditingId = null;
  });
});
