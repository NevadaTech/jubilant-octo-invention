import { describe, it, expect, vi } from "vitest";
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

const mockMutateAsync = vi.fn();

vi.mock("@/modules/integrations/presentation/hooks/use-integrations", () => ({
  useCreateSkuMapping: () => ({
    isPending: false,
    mutateAsync: mockMutateAsync,
  }),
}));

import { SkuMappingForm } from "@/modules/integrations/presentation/components/sku-mapping-form";

describe("SkuMappingForm", () => {
  it("Given: the form When: rendering Then: should render external SKU input", () => {
    render(<SkuMappingForm connectionId="conn-1" />);

    expect(
      screen.getByPlaceholderText("externalSkuPlaceholder"),
    ).toBeInTheDocument();
  });

  it("Given: the form When: rendering Then: should render product ID input", () => {
    render(<SkuMappingForm connectionId="conn-1" />);

    expect(
      screen.getByPlaceholderText("productIdPlaceholder"),
    ).toBeInTheDocument();
  });

  it("Given: the form When: rendering Then: should show add button", () => {
    render(<SkuMappingForm connectionId="conn-1" />);

    expect(screen.getByText("add")).toBeInTheDocument();
  });

  it("Given: the form with submit button When: rendering Then: should have submit type", () => {
    render(<SkuMappingForm connectionId="conn-1" />);

    const submitButton = screen.getByText("add").closest("button");
    expect(submitButton).toHaveAttribute("type", "submit");
  });

  it("Given: defaultExternalSku prop When: rendering Then: should pre-fill the external SKU input", () => {
    render(
      <SkuMappingForm
        connectionId="conn-1"
        defaultExternalSku="PRE-FILLED-SKU"
      />,
    );

    const input = screen.getByPlaceholderText("externalSkuPlaceholder");
    expect(input).toHaveValue("PRE-FILLED-SKU");
  });

  it("Given: no defaultExternalSku prop When: rendering Then: should have empty external SKU input", () => {
    render(<SkuMappingForm connectionId="conn-1" />);

    const input = screen.getByPlaceholderText("externalSkuPlaceholder");
    expect(input).toHaveValue("");
  });
});
