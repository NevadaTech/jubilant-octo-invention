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

vi.mock(
  "@/modules/integrations/presentation/components/provider-tab-content",
  () => ({
    ProviderTabContent: () => <div data-testid="provider-tab" />,
  }),
);

vi.mock(
  "@/modules/integrations/presentation/components/coming-soon-provider-tab",
  () => ({
    ComingSoonProviderTab: () => <div data-testid="coming-soon" />,
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

  it("Given: the integrations page When: rendering Then: should show provider tab content for VTEX", () => {
    render(<IntegrationsPage />);

    expect(screen.getByTestId("provider-tab")).toBeInTheDocument();
  });
});
