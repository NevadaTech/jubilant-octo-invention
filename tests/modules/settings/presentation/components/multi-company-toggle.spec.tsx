import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

let mockMultiCompanyEnabled: boolean;

vi.mock("@/shared/presentation/hooks/use-org-settings", () => ({
  useOrgSettings: () => ({
    multiCompanyEnabled: mockMultiCompanyEnabled,
    integrationsEnabled: false,
  }),
}));

import { MultiCompanyToggle } from "@/modules/settings/presentation/components/multi-company-toggle";

describe("MultiCompanyToggle", () => {
  beforeEach(() => {
    mockMultiCompanyEnabled = false;
  });

  // ── Shared rendering ────────────────────────────────────────────────

  it("Given: component renders When: viewing Then: should show the multi-company title", () => {
    render(<MultiCompanyToggle />);
    expect(screen.getByText("multiCompany.title")).toBeInTheDocument();
  });

  it("Given: component renders When: viewing Then: should show the multi-company description", () => {
    render(<MultiCompanyToggle />);
    expect(screen.getByText("multiCompany.description")).toBeInTheDocument();
  });

  // ── Enabled state ───────────────────────────────────────────────────

  it("Given: multi-company is enabled When: rendering Then: should show enabled badge text", () => {
    mockMultiCompanyEnabled = true;
    render(<MultiCompanyToggle />);
    expect(screen.getByText("multiCompany.enabled")).toBeInTheDocument();
  });

  it("Given: multi-company is enabled When: rendering Then: should not show disabled badge text", () => {
    mockMultiCompanyEnabled = true;
    render(<MultiCompanyToggle />);
    expect(screen.queryByText("multiCompany.disabled")).not.toBeInTheDocument();
  });

  // ── Disabled state ──────────────────────────────────────────────────

  it("Given: multi-company is disabled When: rendering Then: should show disabled badge text", () => {
    mockMultiCompanyEnabled = false;
    render(<MultiCompanyToggle />);
    expect(screen.getByText("multiCompany.disabled")).toBeInTheDocument();
  });

  it("Given: multi-company is disabled When: rendering Then: should not show enabled badge text", () => {
    mockMultiCompanyEnabled = false;
    render(<MultiCompanyToggle />);
    expect(screen.queryByText("multiCompany.enabled")).not.toBeInTheDocument();
  });

  // ── Card structure ──────────────────────────────────────────────────

  it("Given: component renders When: viewing Then: should render inside a card structure", () => {
    const { container } = render(<MultiCompanyToggle />);
    expect(container.firstChild).not.toBeNull();
  });
});
