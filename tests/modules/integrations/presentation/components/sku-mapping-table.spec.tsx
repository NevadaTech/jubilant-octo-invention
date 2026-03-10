import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePathname: () => "/dashboard/integrations",
  useRouter: () => ({ push: vi.fn() }),
}));

const mockMappings = [
  {
    id: "map-1",
    externalSku: "VTEX-SKU-100",
    productId: "prod-abc-123",
    productName: "Blue Widget",
    productSku: "BW-001",
  },
  {
    id: "map-2",
    externalSku: "VTEX-SKU-200",
    productId: "prod-def-456",
    productName: null,
    productSku: null,
  },
  {
    id: "map-3",
    externalSku: "VTEX-SKU-300",
    productId: "prod-ghi-789",
    productName: "Red Gadget",
    productSku: null,
  },
];

let mockSkuMappingsState: {
  data: typeof mockMappings | undefined;
  isLoading: boolean;
};

vi.mock("@/modules/integrations/presentation/hooks/use-integrations", () => ({
  useSkuMappings: () => mockSkuMappingsState,
  useDeleteSkuMapping: () => ({
    isPending: false,
    mutate: vi.fn(),
  }),
}));

import { SkuMappingTable } from "@/modules/integrations/presentation/components/sku-mapping-table";

describe("SkuMappingTable", () => {
  beforeEach(() => {
    mockSkuMappingsState = {
      data: mockMappings,
      isLoading: false,
    };
  });

  it("Given: loading state When: rendering Then: should show skeleton", () => {
    mockSkuMappingsState = {
      data: undefined,
      isLoading: true,
    };

    const { container } = render(<SkuMappingTable connectionId="conn-1" />);

    expect(container.querySelector(".h-32")).toBeInTheDocument();
  });

  it("Given: empty mappings When: rendering Then: should show empty message", () => {
    mockSkuMappingsState = {
      data: [],
      isLoading: false,
    };

    render(<SkuMappingTable connectionId="conn-1" />);

    expect(screen.getByText("empty")).toBeInTheDocument();
  });

  it("Given: no mappings (undefined) When: rendering Then: should show empty message", () => {
    mockSkuMappingsState = {
      data: undefined,
      isLoading: false,
    };

    render(<SkuMappingTable connectionId="conn-1" />);

    expect(screen.getByText("empty")).toBeInTheDocument();
  });

  it("Given: mappings data When: rendering Then: should show external SKUs", () => {
    render(<SkuMappingTable connectionId="conn-1" />);

    expect(screen.getByText("VTEX-SKU-100")).toBeInTheDocument();
    expect(screen.getByText("VTEX-SKU-200")).toBeInTheDocument();
    expect(screen.getByText("VTEX-SKU-300")).toBeInTheDocument();
  });

  it("Given: mapping with productName When: rendering Then: should show product name", () => {
    render(<SkuMappingTable connectionId="conn-1" />);

    expect(screen.getByText("Blue Widget")).toBeInTheDocument();
    expect(screen.getByText("Red Gadget")).toBeInTheDocument();
  });

  it("Given: mapping without productName When: rendering Then: should show productId as fallback", () => {
    render(<SkuMappingTable connectionId="conn-1" />);

    expect(screen.getByText("prod-def-456")).toBeInTheDocument();
  });

  it("Given: mapping with productSku When: rendering Then: should show product SKU", () => {
    render(<SkuMappingTable connectionId="conn-1" />);

    expect(screen.getByText("BW-001")).toBeInTheDocument();
  });

  it("Given: mapping without productSku When: rendering Then: should show dash", () => {
    render(<SkuMappingTable connectionId="conn-1" />);

    const dashes = screen.getAllByText("-");
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });

  it("Given: mappings data When: rendering Then: should show delete buttons", () => {
    render(<SkuMappingTable connectionId="conn-1" />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);
  });
});
