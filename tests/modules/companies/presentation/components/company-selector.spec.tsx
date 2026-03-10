import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const mockCompanies = [
  { id: "c-1", name: "Acme Corp", code: "ACME" },
  { id: "c-2", name: "Beta Inc", code: "BETA" },
];

let mockIsLoading = false;

vi.mock("@/modules/companies/presentation/hooks/use-companies", () => ({
  useCompanies: () => ({
    data: { data: mockCompanies },
    isLoading: mockIsLoading,
  }),
}));

import { CompanySelector } from "@/modules/companies/presentation/components/company-selector";

describe("CompanySelector", () => {
  const defaultProps = {
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading = false;
  });

  it("Given: companies data When: rendering Then: should render select trigger", () => {
    render(<CompanySelector {...defaultProps} />);

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("Given: loading state When: rendering Then: should disable the select", () => {
    mockIsLoading = true;

    render(<CompanySelector {...defaultProps} />);

    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("Given: disabled prop When: rendering Then: should disable the select", () => {
    render(<CompanySelector {...defaultProps} disabled />);

    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("Given: custom placeholder When: rendering Then: should show placeholder", () => {
    render(<CompanySelector {...defaultProps} placeholder="Pick one" />);

    expect(screen.getByText("Pick one")).toBeInTheDocument();
  });

  it("Given: no placeholder When: rendering Then: should show default placeholder", () => {
    render(<CompanySelector {...defaultProps} />);

    expect(screen.getByText("selector.placeholder")).toBeInTheDocument();
  });
});
