import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/ui/components/table-pagination", () => ({
  TablePagination: () => <div data-testid="table-pagination" />,
}));

vi.mock("@/ui/components/sortable-header", () => ({
  SortableHeader: ({ label }: { label: string }) => <th>{label}</th>,
}));

const mockCompanies = [
  {
    id: "c-1",
    name: "Acme Corp",
    code: "ACME",
    description: "Main company",
    isActive: true,
    productCount: 10,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-02"),
  },
  {
    id: "c-2",
    name: "Beta Inc",
    code: "BETA",
    description: null,
    isActive: false,
    productCount: 0,
    createdAt: new Date("2026-02-01"),
    updatedAt: new Date("2026-02-02"),
  },
];

const mockPagination = {
  page: 1,
  limit: 10,
  total: 2,
  totalPages: 1,
};

let mockQueryState: {
  data:
    | { data: typeof mockCompanies; pagination: typeof mockPagination }
    | undefined;
  isLoading: boolean;
  isError: boolean;
};

vi.mock("@/modules/companies/presentation/hooks/use-companies", () => ({
  useCompanies: () => mockQueryState,
  useCompany: () => ({ data: undefined }),
  useCreateCompany: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useUpdateCompany: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useDeleteCompany: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
}));

import { CompanyList } from "@/modules/companies/presentation/components/company-list";

describe("CompanyList", () => {
  beforeEach(() => {
    mockQueryState = {
      data: { data: mockCompanies, pagination: mockPagination },
      isLoading: false,
      isError: false,
    };
  });

  it("Given: companies data When: rendering Then: should show list title", () => {
    render(<CompanyList />);

    expect(screen.getByText("list.title")).toBeInTheDocument();
  });

  it("Given: companies data When: rendering Then: should show company names", () => {
    render(<CompanyList />);

    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Beta Inc")).toBeInTheDocument();
  });

  it("Given: companies data When: rendering Then: should show company codes", () => {
    render(<CompanyList />);

    expect(screen.getByText("ACME")).toBeInTheDocument();
    expect(screen.getByText("BETA")).toBeInTheDocument();
  });

  it("Given: company with description When: rendering Then: should show description", () => {
    render(<CompanyList />);

    expect(screen.getByText("Main company")).toBeInTheDocument();
  });

  it("Given: company without description When: rendering Then: should not show description", () => {
    mockQueryState = {
      data: {
        data: [mockCompanies[1]],
        pagination: { ...mockPagination, total: 1 },
      },
      isLoading: false,
      isError: false,
    };

    render(<CompanyList />);

    expect(screen.getByText("Beta Inc")).toBeInTheDocument();
  });

  it("Given: companies data When: rendering Then: should show create button", () => {
    render(<CompanyList />);

    expect(screen.getByText("actions.new")).toBeInTheDocument();
  });

  it("Given: companies data When: rendering Then: should show product counts", () => {
    render(<CompanyList />);

    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("Given: active company When: rendering Then: should show active badge", () => {
    render(<CompanyList />);

    expect(screen.getByText("status.active")).toBeInTheDocument();
  });

  it("Given: inactive company When: rendering Then: should show inactive badge", () => {
    render(<CompanyList />);

    expect(screen.getByText("status.inactive")).toBeInTheDocument();
  });

  it("Given: empty companies When: rendering Then: should show empty state", () => {
    mockQueryState = {
      data: {
        data: [],
        pagination: { ...mockPagination, total: 0, totalPages: 0 },
      },
      isLoading: false,
      isError: false,
    };

    render(<CompanyList />);

    expect(screen.getByText("empty.title")).toBeInTheDocument();
    expect(screen.getByText("empty.description")).toBeInTheDocument();
  });

  it("Given: loading state When: rendering Then: should show skeletons", () => {
    mockQueryState = {
      data: undefined,
      isLoading: true,
      isError: false,
    };

    render(<CompanyList />);

    expect(screen.getByText("list.title")).toBeInTheDocument();
    expect(screen.queryByText("Acme Corp")).not.toBeInTheDocument();
  });

  it("Given: error state When: rendering Then: should show error message", () => {
    mockQueryState = {
      data: undefined,
      isLoading: false,
      isError: true,
    };

    render(<CompanyList />);

    expect(screen.getByText("error.loading")).toBeInTheDocument();
  });
});
