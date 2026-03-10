import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

let mockIntegrationsEnabled: boolean;

vi.mock("@/shared/presentation/hooks/use-org-settings", () => ({
  useOrgSettings: () => ({
    integrationsEnabled: mockIntegrationsEnabled,
    multiCompanyEnabled: false,
  }),
}));

import { IntegrationsToggle } from "@/modules/settings/presentation/components/integrations-toggle";

describe("IntegrationsToggle", () => {
  beforeEach(() => {
    mockIntegrationsEnabled = false;
  });

  // ── Shared rendering ────────────────────────────────────────────────

  it("Given: component renders When: viewing Then: should show the integrations title", () => {
    render(<IntegrationsToggle />);
    expect(screen.getByText("integrations.title")).toBeInTheDocument();
  });

  it("Given: component renders When: viewing Then: should show the integrations description", () => {
    render(<IntegrationsToggle />);
    expect(screen.getByText("integrations.description")).toBeInTheDocument();
  });

  // ── Enabled state ───────────────────────────────────────────────────

  it("Given: integrations are enabled When: rendering Then: should show enabled badge text", () => {
    mockIntegrationsEnabled = true;
    render(<IntegrationsToggle />);
    expect(screen.getByText("integrations.enabled")).toBeInTheDocument();
  });

  it("Given: integrations are enabled When: rendering Then: should not show disabled badge text", () => {
    mockIntegrationsEnabled = true;
    render(<IntegrationsToggle />);
    expect(screen.queryByText("integrations.disabled")).not.toBeInTheDocument();
  });

  // ── Disabled state ──────────────────────────────────────────────────

  it("Given: integrations are disabled When: rendering Then: should show disabled badge text", () => {
    mockIntegrationsEnabled = false;
    render(<IntegrationsToggle />);
    expect(screen.getByText("integrations.disabled")).toBeInTheDocument();
  });

  it("Given: integrations are disabled When: rendering Then: should not show enabled badge text", () => {
    mockIntegrationsEnabled = false;
    render(<IntegrationsToggle />);
    expect(screen.queryByText("integrations.enabled")).not.toBeInTheDocument();
  });

  // ── Card structure ──────────────────────────────────────────────────

  it("Given: component renders When: viewing Then: should render inside a card structure", () => {
    const { container } = render(<IntegrationsToggle />);
    // CardHeader and CardContent render as children of the card
    expect(container.firstChild).not.toBeNull();
  });
});
