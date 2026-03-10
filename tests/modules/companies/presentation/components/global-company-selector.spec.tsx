import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const mockCompanies = [
  { id: "c-1", name: "Acme Corp", code: "ACME" },
  { id: "c-2", name: "Beta Inc", code: "BETA" },
];

let mockSelectedCompanyId: string | null = null;
const mockSetSelectedCompany = vi.fn();
let mockMultiCompanyEnabled = true;
let mockIsLoading = false;

vi.mock("@/modules/companies/presentation/hooks/use-companies", () => ({
  useCompanies: () => ({
    data: { data: mockCompanies },
    isLoading: mockIsLoading,
  }),
}));

vi.mock("@/modules/companies/infrastructure/store/company.store", () => ({
  useCompanyStore: (
    selector: (state: {
      selectedCompanyId: string | null;
      setSelectedCompany: (id: string | null) => void;
    }) => unknown,
  ) =>
    selector({
      selectedCompanyId: mockSelectedCompanyId,
      setSelectedCompany: mockSetSelectedCompany,
    }),
}));

vi.mock("@/shared/presentation/hooks/use-org-settings", () => ({
  useOrgSettings: () => ({ multiCompanyEnabled: mockMultiCompanyEnabled }),
}));

import { GlobalCompanySelector } from "@/modules/companies/presentation/components/global-company-selector";

describe("GlobalCompanySelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectedCompanyId = null;
    mockMultiCompanyEnabled = true;
    mockIsLoading = false;
  });

  it("Given: multiCompanyEnabled is false When: rendering Then: should return null", () => {
    mockMultiCompanyEnabled = false;

    const { container } = render(<GlobalCompanySelector />);

    expect(container.innerHTML).toBe("");
  });

  it("Given: multiCompanyEnabled is true When: rendering Then: should show selector", () => {
    render(<GlobalCompanySelector />);

    expect(screen.getByText("selector.all")).toBeInTheDocument();
  });

  it("Given: no company selected When: rendering Then: should show 'all' label", () => {
    mockSelectedCompanyId = null;

    render(<GlobalCompanySelector />);

    expect(screen.getByRole("button")).toHaveTextContent("selector.all");
  });

  it("Given: company selected When: rendering Then: should show company name", () => {
    mockSelectedCompanyId = "c-1";

    render(<GlobalCompanySelector />);

    expect(screen.getByRole("button")).toHaveTextContent("Acme Corp");
  });

  it("Given: loading state When: rendering Then: should show loading button", () => {
    mockIsLoading = true;

    render(<GlobalCompanySelector />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("selector.loading");
  });

  it("Given: companies loaded When: rendering Then: should render without error", () => {
    const { container } = render(<GlobalCompanySelector />);

    expect(container.innerHTML).not.toBe("");
  });
});
