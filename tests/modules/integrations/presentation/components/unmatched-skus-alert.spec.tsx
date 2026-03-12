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

vi.mock(
  "@/modules/integrations/presentation/components/sku-mapping-form",
  () => ({
    SkuMappingForm: () => <div data-testid="sku-mapping-form" />,
  }),
);

const mockUnmatchedSkus = [
  { id: "log-1", externalSku: "VTEX-UNKNOWN-1", externalOrderId: "ORD-500" },
  { id: "log-2", externalSku: "VTEX-UNKNOWN-2", externalOrderId: "ORD-501" },
  { id: "log-3", externalSku: "VTEX-UNKNOWN-3", externalOrderId: "ORD-502" },
];

let mockUnmatchedState: {
  data: typeof mockUnmatchedSkus | undefined;
};

vi.mock("@/modules/integrations/presentation/hooks/use-integrations", () => ({
  useUnmatchedSkus: () => mockUnmatchedState,
}));

import { UnmatchedSkusAlert } from "@/modules/integrations/presentation/components/unmatched-skus-alert";

describe("UnmatchedSkusAlert", () => {
  beforeEach(() => {
    mockUnmatchedState = {
      data: mockUnmatchedSkus,
    };
  });

  it("Given: empty unmatched SKUs array When: rendering Then: should return null", () => {
    mockUnmatchedState = {
      data: [],
    };

    const { container } = render(<UnmatchedSkusAlert connectionId="conn-1" />);

    expect(container.innerHTML).toBe("");
  });

  it("Given: undefined unmatched SKUs When: rendering Then: should return null", () => {
    mockUnmatchedState = {
      data: undefined,
    };

    const { container } = render(<UnmatchedSkusAlert connectionId="conn-1" />);

    expect(container.innerHTML).toBe("");
  });

  it("Given: unmatched SKUs data When: rendering Then: should show unmatched SKU values", () => {
    render(<UnmatchedSkusAlert connectionId="conn-1" />);

    expect(screen.getByText("VTEX-UNKNOWN-1")).toBeInTheDocument();
    expect(screen.getByText("VTEX-UNKNOWN-2")).toBeInTheDocument();
    expect(screen.getByText("VTEX-UNKNOWN-3")).toBeInTheDocument();
  });

  it("Given: unmatched SKUs data When: rendering Then: should show external order IDs", () => {
    render(<UnmatchedSkusAlert connectionId="conn-1" />);

    expect(screen.getByText("(ORD-500)")).toBeInTheDocument();
    expect(screen.getByText("(ORD-501)")).toBeInTheDocument();
    expect(screen.getByText("(ORD-502)")).toBeInTheDocument();
  });

  it("Given: unmatched SKUs data When: rendering Then: should show Map This buttons", () => {
    render(<UnmatchedSkusAlert connectionId="conn-1" />);

    const mapButtons = screen.getAllByText("mapThis");
    expect(mapButtons).toHaveLength(3);
  });

  it("Given: unmatched SKUs data When: rendering Then: should show alert title", () => {
    render(<UnmatchedSkusAlert connectionId="conn-1" />);

    expect(screen.getByText("unmatchedAlert")).toBeInTheDocument();
  });

  it("Given: unmatched SKUs data When: rendering Then: should show count badge", () => {
    render(<UnmatchedSkusAlert connectionId="conn-1" />);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("Given: unmatched SKUs data When: rendering Then: should show description", () => {
    render(<UnmatchedSkusAlert connectionId="conn-1" />);

    expect(screen.getByText("unmatchedDescription")).toBeInTheDocument();
  });
});
