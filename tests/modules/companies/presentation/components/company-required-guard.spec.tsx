import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/modules/companies/presentation/hooks/use-companies", () => ({
  useCompanies: () => ({ data: { data: [] }, isLoading: false }),
}));

let mockSelectedCompanyId: string | null = null;

vi.mock("@/modules/companies/infrastructure/store/company.store", () => ({
  useCompanyStore: (
    selector: (state: {
      selectedCompanyId: string | null;
      setSelectedCompany: (id: string | null) => void;
    }) => unknown,
  ) =>
    selector({
      selectedCompanyId: mockSelectedCompanyId,
      setSelectedCompany: vi.fn(),
    }),
}));

import { CompanyRequiredGuard } from "@/modules/companies/presentation/components/company-required-guard";

describe("CompanyRequiredGuard", () => {
  beforeEach(() => {
    mockSelectedCompanyId = null;
  });

  it("Given: selectedCompanyId is null When: rendering Then: should block submit and show required-company copy", () => {
    // Arrange
    mockSelectedCompanyId = null;

    // Act
    render(
      <CompanyRequiredGuard>
        <form>
          <button type="submit">create</button>
        </form>
      </CompanyRequiredGuard>,
    );

    // Assert
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("requiredCompany.title")).toBeInTheDocument();
    expect(screen.getByText("requiredCompany.description")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "create" })).toBeDisabled();
  });

  it("Given: create was blocked for All/null When: a specific company is selected Then: submit becomes available", () => {
    // Arrange — blocked state
    mockSelectedCompanyId = null;
    const { rerender } = render(
      <CompanyRequiredGuard>
        <form>
          <button type="submit">create</button>
        </form>
      </CompanyRequiredGuard>,
    );
    expect(screen.getByRole("button", { name: "create" })).toBeDisabled();
    expect(screen.getByRole("alert")).toBeInTheDocument();

    // Act — global company selected (store reactivity)
    mockSelectedCompanyId = "company-42";
    rerender(
      <CompanyRequiredGuard>
        <form>
          <button type="submit">create</button>
        </form>
      </CompanyRequiredGuard>,
    );

    // Assert
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "create" })).not.toBeDisabled();
  });

  it("Given: non-null selectedCompanyId When: rendering Then: children render without guard alert", () => {
    // Arrange
    mockSelectedCompanyId = "company-alpha";

    // Act
    render(
      <CompanyRequiredGuard>
        <form>
          <button type="submit">create</button>
          <span>form-body</span>
        </form>
      </CompanyRequiredGuard>,
    );

    // Assert
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("form-body")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "create" })).not.toBeDisabled();
  });

  it("Given: active is false When: rendering with null company Then: should skip guard and leave form enabled", () => {
    // Arrange
    mockSelectedCompanyId = null;

    // Act
    render(
      <CompanyRequiredGuard active={false}>
        <form>
          <button type="submit">save</button>
        </form>
      </CompanyRequiredGuard>,
    );

    // Assert
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "save" })).not.toBeDisabled();
  });
});
