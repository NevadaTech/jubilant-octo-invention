import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePathname: () => "/dashboard/contacts",
}));

vi.mock("@/ui/components/table-pagination", () => ({
  TablePagination: () => <div data-testid="table-pagination" />,
}));

vi.mock("@/ui/components/sortable-header", () => ({
  SortableHeader: ({ label }: { label: string }) => <th>{label}</th>,
}));

const mockContacts = [
  {
    id: "c-1",
    name: "John Doe",
    identification: "12345678",
    type: "CUSTOMER" as const,
    address: "123 Main St",
    notes: null,
    isActive: true,
    salesCount: 5,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-02"),
  },
  {
    id: "c-2",
    name: "Acme Corp",
    identification: "87654321",
    type: "SUPPLIER" as const,
    address: null,
    notes: "Supplier notes",
    isActive: false,
    salesCount: 0,
    createdAt: new Date("2026-02-01"),
    updatedAt: new Date("2026-02-02"),
  },
];

const mockPagination = {
  page: 1,
  limit: 10,
  total: 2,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
};

let mockQueryState: {
  data:
    | { data: typeof mockContacts; pagination: typeof mockPagination }
    | undefined;
  isLoading: boolean;
  isError: boolean;
};

vi.mock("@/modules/contacts/presentation/hooks/use-contacts", () => ({
  useContacts: () => mockQueryState,
  useDeleteContact: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
}));

import { ContactList } from "@/modules/contacts/presentation/components/contact-list";

describe("ContactList", () => {
  beforeEach(() => {
    mockQueryState = {
      data: { data: mockContacts, pagination: mockPagination },
      isLoading: false,
      isError: false,
    };
  });

  it("Given: contacts data When: rendering Then: should show list title", () => {
    render(<ContactList />);

    expect(screen.getByText("list.title")).toBeInTheDocument();
  });

  it("Given: contacts data When: rendering Then: should show contact names", () => {
    render(<ContactList />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  });

  it("Given: contacts data When: rendering Then: should show identifications", () => {
    render(<ContactList />);

    expect(screen.getByText("12345678")).toBeInTheDocument();
    expect(screen.getByText("87654321")).toBeInTheDocument();
  });

  it("Given: contacts data When: rendering Then: should show create button", () => {
    render(<ContactList />);

    expect(screen.getAllByText("actions.new")).toHaveLength(1);
  });

  it("Given: contacts with address When: rendering Then: should show address", () => {
    render(<ContactList />);

    expect(screen.getByText("123 Main St")).toBeInTheDocument();
  });

  it("Given: contacts without address When: rendering Then: should show dash", () => {
    render(<ContactList />);

    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("Given: empty contacts When: rendering Then: should show empty state", () => {
    mockQueryState = {
      data: {
        data: [],
        pagination: { ...mockPagination, total: 0, totalPages: 0 },
      },
      isLoading: false,
      isError: false,
    };

    render(<ContactList />);

    expect(screen.getByText("empty.title")).toBeInTheDocument();
    expect(screen.getByText("empty.description")).toBeInTheDocument();
  });

  it("Given: loading state When: rendering Then: should show skeletons", () => {
    mockQueryState = {
      data: undefined,
      isLoading: true,
      isError: false,
    };

    render(<ContactList />);

    expect(screen.getByText("list.title")).toBeInTheDocument();
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
  });

  it("Given: error state When: rendering Then: should show error message", () => {
    mockQueryState = {
      data: undefined,
      isLoading: false,
      isError: true,
    };

    render(<ContactList />);

    expect(screen.getByText("error.loading")).toBeInTheDocument();
  });
});
