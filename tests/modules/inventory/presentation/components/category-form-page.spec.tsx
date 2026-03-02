import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategoryFormPage } from "@/modules/inventory/presentation/components/categories/category-form-page";

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

let mockCategoryData: { data: { id: string; name: string; description: string | null; parentId: string | null } | null; isLoading: boolean };
let mockCategoriesData: { data: { data: { id: string; name: string }[] } };

vi.mock("@/modules/inventory/presentation/hooks/use-categories", () => ({
  useCreateCategory: () => ({ isPending: false, isError: false, mutateAsync: vi.fn() }),
  useUpdateCategory: () => ({ isPending: false, isError: false, mutateAsync: vi.fn() }),
  useCategory: () => mockCategoryData,
  useCategories: () => mockCategoriesData,
}));

vi.mock("@/modules/inventory/presentation/schemas/category.schema", () => ({
  createCategorySchema: { parse: vi.fn() },
  toCreateCategoryDto: vi.fn((d: unknown) => d),
  toUpdateCategoryDto: vi.fn((d: unknown) => d),
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => vi.fn(),
}));

// --- Tests ---

describe("CategoryFormPage", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockCategoryData = { data: null, isLoading: false };
    mockCategoriesData = { data: { data: [{ id: "cat-1", name: "Electronics" }] } };
  });

  it("Given: no categoryId When: rendering Then: should show create title", () => {
    render(<CategoryFormPage />);

    expect(screen.getByText("form.createTitle")).toBeInTheDocument();
    expect(screen.getByText("form.createDescription")).toBeInTheDocument();
  });

  it("Given: no categoryId When: rendering Then: should show form fields for name, description, and parent", () => {
    render(<CategoryFormPage />);

    expect(screen.getByText(/fields\.name/)).toBeInTheDocument();
    expect(screen.getByText("fields.description")).toBeInTheDocument();
    expect(screen.getByText("fields.parent")).toBeInTheDocument();
  });

  it("Given: no categoryId When: rendering Then: should show cancel and create buttons", () => {
    render(<CategoryFormPage />);

    expect(screen.getByText("cancel")).toBeInTheDocument();
    expect(screen.getByText("create")).toBeInTheDocument();
  });

  it("Given: no categoryId When: rendering Then: should show category info card title", () => {
    render(<CategoryFormPage />);

    expect(screen.getByText("form.categoryInfo")).toBeInTheDocument();
  });

  it("Given: categoryId with loading state When: rendering Then: should show loading spinner", () => {
    mockCategoryData = { data: null, isLoading: true };

    const { container } = render(<CategoryFormPage categoryId="cat-1" />);

    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("Given: categoryId with loaded data When: rendering Then: should show edit title", () => {
    mockCategoryData = {
      data: { id: "cat-1", name: "Electronics", description: "Electronic devices", parentId: null },
      isLoading: false,
    };

    render(<CategoryFormPage categoryId="cat-1" />);

    expect(screen.getByText("form.editTitle")).toBeInTheDocument();
    expect(screen.getByText("form.editDescription")).toBeInTheDocument();
  });

  it("Given: categoryId with loaded data When: rendering Then: should show save button instead of create", () => {
    mockCategoryData = {
      data: { id: "cat-1", name: "Electronics", description: null, parentId: null },
      isLoading: false,
    };

    render(<CategoryFormPage categoryId="cat-1" />);

    expect(screen.getByText("save")).toBeInTheDocument();
    expect(screen.queryByText("create")).not.toBeInTheDocument();
  });

  it("Given: no categoryId When: rendering Then: should render back link pointing to categories list", () => {
    render(<CategoryFormPage />);

    const links = screen.getAllByRole("link");
    const backLink = links.find((link) => link.getAttribute("href") === "/dashboard/inventory/categories");
    expect(backLink).toBeDefined();
  });
});
