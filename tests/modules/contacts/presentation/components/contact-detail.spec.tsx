import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({ push: vi.fn() }),
}));

const mockContactData = {
  id: "c-1",
  name: "John Doe",
  identification: "12345678-9",
  type: "CUSTOMER" as const,
  address: "123 Main St, Bogotá",
  notes: "Important client",
  isActive: true,
  salesCount: 5,
  createdAt: new Date("2026-01-15T10:00:00.000Z"),
  updatedAt: new Date("2026-03-01T12:00:00.000Z"),
};

let mockContactQuery: {
  data: typeof mockContactData | null;
  isLoading: boolean;
};

vi.mock("@/modules/contacts/presentation/hooks/use-contacts", () => ({
  useContact: () => mockContactQuery,
  useDeleteContact: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
}));

import { ContactDetail } from "@/modules/contacts/presentation/components/contact-detail";

describe("ContactDetail", () => {
  beforeEach(() => {
    mockContactQuery = { data: mockContactData, isLoading: false };
  });

  it("Given: contact data When: rendering Then: should show contact name", () => {
    render(<ContactDetail contactId="c-1" />);

    const elements = screen.getAllByText("John Doe");
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  it("Given: contact data When: rendering Then: should show identification", () => {
    render(<ContactDetail contactId="c-1" />);

    const elements = screen.getAllByText("12345678-9");
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  it("Given: contact data When: rendering Then: should show address", () => {
    render(<ContactDetail contactId="c-1" />);

    expect(screen.getByText("123 Main St, Bogotá")).toBeInTheDocument();
  });

  it("Given: contact data When: rendering Then: should show notes", () => {
    render(<ContactDetail contactId="c-1" />);

    expect(screen.getByText("Important client")).toBeInTheDocument();
  });

  it("Given: loading state When: rendering Then: should show loading skeleton", () => {
    mockContactQuery = { data: null, isLoading: true };

    render(<ContactDetail contactId="c-1" />);

    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
  });

  it("Given: not found When: rendering Then: should show not found message", () => {
    mockContactQuery = { data: null, isLoading: false };

    render(<ContactDetail contactId="c-1" />);

    expect(screen.getByText("detail.notFound")).toBeInTheDocument();
  });

  it("Given: contact with edit link When: rendering Then: should have edit link", () => {
    render(<ContactDetail contactId="c-1" />);

    const editLink = screen.getByText("actions.edit");
    expect(editLink.closest("a")).toHaveAttribute(
      "href",
      "/dashboard/contacts/c-1/edit",
    );
  });
});
