import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const mockCreateMutateAsync = vi.fn();
const mockUpdateMutateAsync = vi.fn();

let mockCompanyData:
  | { id: string; name: string; code: string; description: string | null }
  | undefined;

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/modules/companies/presentation/hooks/use-companies", () => ({
  useCompany: () => ({ data: mockCompanyData }),
  useCreateCompany: () => ({
    isPending: false,
    mutateAsync: mockCreateMutateAsync,
  }),
  useUpdateCompany: () => ({
    isPending: false,
    mutateAsync: mockUpdateMutateAsync,
  }),
}));

import { CompanyForm } from "@/modules/companies/presentation/components/company-form";

describe("CompanyForm", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    editId: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCompanyData = undefined;
  });

  it("Given: create mode When: rendering Then: should show create title", () => {
    render(<CompanyForm {...defaultProps} />);

    expect(screen.getByText("form.createTitle")).toBeInTheDocument();
  });

  it("Given: edit mode When: rendering Then: should show edit title", () => {
    mockCompanyData = {
      id: "c-1",
      name: "Acme",
      code: "ACME",
      description: "Desc",
    };

    render(<CompanyForm {...defaultProps} editId="c-1" />);

    expect(screen.getByText("form.editTitle")).toBeInTheDocument();
  });

  it("Given: edit mode When: rendering Then: should disable code field", () => {
    mockCompanyData = {
      id: "c-1",
      name: "Acme",
      code: "ACME",
      description: null,
    };

    render(<CompanyForm {...defaultProps} editId="c-1" />);

    const codeInput = screen.getByPlaceholderText("form.codePlaceholder");
    expect(codeInput).toBeDisabled();
  });

  it("Given: create mode When: rendering Then: should not disable code field", () => {
    render(<CompanyForm {...defaultProps} />);

    const codeInput = screen.getByPlaceholderText("form.codePlaceholder");
    expect(codeInput).not.toBeDisabled();
  });

  it("Given: form When: rendering Then: should show name, code, description fields", () => {
    render(<CompanyForm {...defaultProps} />);

    expect(screen.getByText("fields.name")).toBeInTheDocument();
    expect(screen.getByText("fields.code")).toBeInTheDocument();
    expect(screen.getByText("fields.description")).toBeInTheDocument();
  });

  it("Given: create mode When: rendering Then: should show create button", () => {
    render(<CompanyForm {...defaultProps} />);

    expect(screen.getByText("create")).toBeInTheDocument();
  });

  it("Given: edit mode When: rendering Then: should show save button", () => {
    mockCompanyData = {
      id: "c-1",
      name: "Acme",
      code: "ACME",
      description: null,
    };

    render(<CompanyForm {...defaultProps} editId="c-1" />);

    expect(screen.getByText("save")).toBeInTheDocument();
  });

  it("Given: form When: rendering Then: should show cancel button", () => {
    render(<CompanyForm {...defaultProps} />);

    expect(screen.getByText("cancel")).toBeInTheDocument();
  });

  it("Given: closed dialog When: rendering Then: should not be visible", () => {
    render(<CompanyForm {...defaultProps} open={false} />);

    expect(screen.queryByText("form.createTitle")).not.toBeInTheDocument();
  });
});
