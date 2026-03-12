import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

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
  "@/modules/integrations/presentation/components/provider-tab-content",
  () => ({
    ProviderTabContent: ({ provider }: { provider: string }) => (
      <div data-testid={`provider-tab-${provider}`}>
        ProviderTabContent-{provider}
      </div>
    ),
  }),
);

import { IntegrationsPage } from "@/modules/integrations/presentation/components/integrations-page";

describe("IntegrationsPage", () => {
  it("Given: the integrations page When: rendering Then: should show the title", () => {
    render(<IntegrationsPage />);

    expect(screen.getByText("title")).toBeInTheDocument();
  });

  it("Given: the integrations page When: rendering Then: should show the description", () => {
    render(<IntegrationsPage />);

    expect(screen.getByText("description")).toBeInTheDocument();
  });

  it("Given: the integrations page When: rendering Then: should show VTEX tab trigger", () => {
    render(<IntegrationsPage />);

    expect(screen.getByText("providers.vtex.name")).toBeInTheDocument();
  });

  it("Given: the integrations page When: rendering Then: should show MercadoLibre tab trigger", () => {
    render(<IntegrationsPage />);

    expect(screen.getByText("providers.mercadolibre.name")).toBeInTheDocument();
  });

  it("Given: the integrations page When: rendering Then: should show provider tab content for VTEX by default", () => {
    render(<IntegrationsPage />);

    expect(screen.getByTestId("provider-tab-VTEX")).toBeInTheDocument();
  });

  it("Given: the integrations page When: clicking MercadoLibre tab Then: should show MercadoLibre ProviderTabContent", () => {
    render(<IntegrationsPage />);

    fireEvent.click(screen.getByText("providers.mercadolibre.name"));

    expect(screen.getByTestId("provider-tab-MERCADOLIBRE")).toBeInTheDocument();
  });

  it("Given: the integrations page When: rendering Then: both tabs use ProviderTabContent (no ComingSoonProviderTab)", () => {
    render(<IntegrationsPage />);

    // VTEX tab is rendered by default
    expect(screen.getByText("ProviderTabContent-VTEX")).toBeInTheDocument();
  });
});
