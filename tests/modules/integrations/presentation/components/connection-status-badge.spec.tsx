import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConnectionStatusBadge } from "@/modules/integrations/presentation/components/connection-status-badge";

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

describe("ConnectionStatusBadge", () => {
  it("Given: CONNECTED status When: rendering Then: should show CONNECTED text", () => {
    render(<ConnectionStatusBadge status="CONNECTED" />);

    expect(screen.getByText("CONNECTED")).toBeInTheDocument();
  });

  it("Given: ERROR status When: rendering Then: should show ERROR text", () => {
    render(<ConnectionStatusBadge status="ERROR" />);

    expect(screen.getByText("ERROR")).toBeInTheDocument();
  });

  it("Given: DISCONNECTED status When: rendering Then: should show DISCONNECTED text", () => {
    render(<ConnectionStatusBadge status="DISCONNECTED" />);

    expect(screen.getByText("DISCONNECTED")).toBeInTheDocument();
  });
});
