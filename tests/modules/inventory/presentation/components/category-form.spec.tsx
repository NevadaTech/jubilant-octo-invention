import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategoryForm } from "@/modules/inventory/presentation/components/categories/category-form";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/modules/inventory/presentation/hooks/use-categories", () => ({
  useCreateCategory: () => ({ isPending: false, isError: false, mutateAsync: vi.fn() }),
  useUpdateCategory: () => ({ isPending: false, isError: false, mutateAsync: vi.fn() }),
  useCategory: () => ({ data: null, isLoading: false }),
  useCategories: () => ({ data: { data: [] } }),
}));

const mockClose = vi.fn();
let mockIsOpen = true;
let mockEditingId: string | null = null;

vi.mock("@/modules/inventory/presentation/hooks/use-inventory-store", () => ({
  useCategoryFormState: () => ({
    isOpen: mockIsOpen,
    editingId: mockEditingId,
    close: mockClose,
  }),
}));

describe("CategoryForm", () => {
  it("Given: isOpen false When: rendering Then: should return null", () => {
    mockIsOpen = false;
    const { container } = render(<CategoryForm />);
    expect(container.innerHTML).toBe("");
    mockIsOpen = true;
  });

  it("Given: isOpen true When: rendering Then: should show create title", () => {
    mockEditingId = null;
    render(<CategoryForm />);
    expect(screen.getByText("form.createTitle")).toBeDefined();
  });

  it("Given: isOpen true When: rendering Then: should show name field", () => {
    render(<CategoryForm />);
    expect(screen.getByText("fields.name")).toBeDefined();
  });

  it("Given: isOpen true When: rendering Then: should show description field", () => {
    render(<CategoryForm />);
    expect(screen.getByText("fields.description")).toBeDefined();
  });

  it("Given: isOpen true When: rendering Then: should show cancel and create buttons", () => {
    render(<CategoryForm />);
    expect(screen.getByText("cancel")).toBeDefined();
    expect(screen.getByText("create")).toBeDefined();
  });

  it("Given: editing mode When: rendering Then: should show edit title", () => {
    mockEditingId = "cat-1";
    render(<CategoryForm />);
    expect(screen.getByText("form.editTitle")).toBeDefined();
    mockEditingId = null;
  });
});
