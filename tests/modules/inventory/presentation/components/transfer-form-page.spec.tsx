import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TransferFormPage } from "@/modules/inventory/presentation/components/transfers/transfer-form-page";

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

vi.mock("@/modules/inventory/presentation/hooks/use-transfers", () => ({
  useCreateTransfer: () => ({
    isPending: false,
    isError: false,
    mutateAsync: vi.fn(),
  }),
}));

vi.mock("@/modules/inventory/presentation/hooks/use-products", () => ({
  useProducts: () => ({
    data: {
      data: [
        { id: "p1", name: "Widget A", sku: "WA-001" },
        { id: "p2", name: "Widget B", sku: "WB-002" },
      ],
    },
  }),
}));

vi.mock("@/modules/inventory/presentation/hooks/use-warehouses", () => ({
  useWarehouses: () => ({
    data: {
      data: [
        { id: "wh-1", name: "Main Warehouse", code: "MW" },
        { id: "wh-2", name: "Secondary Warehouse", code: "SW" },
      ],
    },
  }),
}));

vi.mock("@/modules/inventory/presentation/schemas/transfer.schema", () => ({
  createTransferSchema: { parse: vi.fn() },
  toCreateTransferDto: vi.fn((d: unknown) => d),
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => vi.fn(),
}));

// --- Tests ---

describe("TransferFormPage", () => {
  it("Given: component renders When: rendering Then: should show create title and description", () => {
    render(<TransferFormPage />);

    expect(screen.getByText("form.createTitle")).toBeInTheDocument();
    expect(screen.getByText("form.createDescription")).toBeInTheDocument();
  });

  it("Given: component renders When: rendering Then: should show transfer info card title", () => {
    render(<TransferFormPage />);

    expect(screen.getByText("form.transferInfo")).toBeInTheDocument();
  });

  it("Given: component renders When: rendering Then: should show from and to warehouse fields", () => {
    render(<TransferFormPage />);

    expect(
      screen.getByText(
        (content) =>
          content.startsWith("fields.from") && !content.includes("Placeholder"),
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        (content) =>
          content.startsWith("fields.to") && !content.includes("Placeholder"),
      ),
    ).toBeInTheDocument();
  });

  it("Given: component renders When: rendering Then: should show products label and add product button", () => {
    render(<TransferFormPage />);

    expect(screen.getByText(/fields\.products/)).toBeInTheDocument();
    expect(screen.getByText("actions.addProduct")).toBeInTheDocument();
  });

  it("Given: component renders When: rendering Then: should show notes field", () => {
    render(<TransferFormPage />);

    expect(screen.getByText("fields.notes")).toBeInTheDocument();
  });

  it("Given: component renders When: rendering Then: should show cancel and create buttons", () => {
    render(<TransferFormPage />);

    expect(screen.getByText("cancel")).toBeInTheDocument();
    expect(screen.getByText("create")).toBeInTheDocument();
  });

  it("Given: component renders When: rendering Then: should render back link to transfers list", () => {
    render(<TransferFormPage />);

    const links = screen.getAllByRole("link");
    const backLink = links.find(
      (link) => link.getAttribute("href") === "/dashboard/inventory/transfers",
    );
    expect(backLink).toBeDefined();
  });

  it("Given: component renders When: rendering Then: should render one product line by default", () => {
    const { container } = render(<TransferFormPage />);

    // At least one line should be rendered with a quantity input
    const numberInputs = container.querySelectorAll('input[type="number"]');
    expect(numberInputs.length).toBeGreaterThanOrEqual(1);
  });
});
