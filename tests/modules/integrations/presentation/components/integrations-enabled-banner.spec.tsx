import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { IntegrationsEnabledBanner } from "@/modules/integrations/presentation/components/integrations-enabled-banner";

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

const mockUseOrgSettings = vi.fn();

vi.mock("@/shared/presentation/hooks/use-org-settings", () => ({
  useOrgSettings: () => mockUseOrgSettings(),
}));

describe("IntegrationsEnabledBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Given: integrations enabled When: rendering Then: should show enabled text", () => {
    mockUseOrgSettings.mockReturnValue({ integrationsEnabled: true });

    render(<IntegrationsEnabledBanner />);

    expect(screen.getByText("enabled")).toBeInTheDocument();
  });

  it("Given: integrations disabled When: rendering Then: should show disabled text", () => {
    mockUseOrgSettings.mockReturnValue({ integrationsEnabled: false });

    render(<IntegrationsEnabledBanner />);

    expect(screen.getByText("disabled")).toBeInTheDocument();
  });

  it("Given: any state When: rendering Then: should show settings link", () => {
    mockUseOrgSettings.mockReturnValue({ integrationsEnabled: true });

    render(<IntegrationsEnabledBanner />);

    expect(screen.getByText("goToSettings")).toBeInTheDocument();
    const link = screen.getByText("goToSettings").closest("a");
    expect(link).toHaveAttribute("href", "/dashboard/settings");
  });
});
