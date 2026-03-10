import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ComingSoonProviderTab } from "@/modules/integrations/presentation/components/coming-soon-provider-tab";

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

vi.mock("@/ui/components/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  CardContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
}));

describe("ComingSoonProviderTab", () => {
  it("Given: a providerKey When: rendering Then: should show the provider name", () => {
    render(<ComingSoonProviderTab providerKey="mercadolibre" />);

    expect(screen.getByText("mercadolibre.name")).toBeInTheDocument();
  });

  it("Given: a providerKey When: rendering Then: should show coming soon badge", () => {
    render(<ComingSoonProviderTab providerKey="mercadolibre" />);

    expect(screen.getByText("mercadolibre.comingSoon")).toBeInTheDocument();
  });
});
