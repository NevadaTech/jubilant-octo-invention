import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const mockPush = vi.fn();

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({ push: mockPush }),
}));

const mockCreateContact = {
  mutateAsync: vi.fn(),
  isPending: false,
  isError: false,
};

const mockUpdateContact = {
  mutateAsync: vi.fn(),
  isPending: false,
  isError: false,
};

const mockContactData = {
  id: "c-1",
  name: "John Doe",
  identification: "12345678",
  type: "CUSTOMER" as const,
  address: "123 Main St",
  notes: "Some notes",
  isActive: true,
  salesCount: 3,
  createdAt: new Date(),
  updatedAt: new Date(),
};

let mockContactQuery: {
  data: typeof mockContactData | null;
  isLoading: boolean;
};

vi.mock("@/modules/contacts/presentation/hooks/use-contacts", () => ({
  useContact: () => mockContactQuery,
  useCreateContact: () => mockCreateContact,
  useUpdateContact: () => mockUpdateContact,
}));

import { ContactFormPage } from "@/modules/contacts/presentation/components/contact-form-page";

describe("ContactFormPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockContactQuery = { data: null, isLoading: false };
    mockCreateContact.mutateAsync.mockResolvedValue({ id: "c-new" });
    mockUpdateContact.mutateAsync.mockResolvedValue({ id: "c-1" });
  });

  describe("create mode", () => {
    it("Given: create mode When: rendering Then: should show create title", () => {
      render(<ContactFormPage mode="create" />);

      expect(screen.getByText("form.createTitle")).toBeInTheDocument();
      expect(screen.getByText("form.createDescription")).toBeInTheDocument();
    });

    it("Given: create mode When: rendering Then: should show form fields", () => {
      render(<ContactFormPage mode="create" />);

      expect(screen.getByLabelText(/fields.name/)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/fields.identification/),
      ).toBeInTheDocument();
    });

    it("Given: create mode When: rendering Then: should NOT show isActive toggle", () => {
      render(<ContactFormPage mode="create" />);

      expect(
        screen.queryByLabelText("fields.isActive"),
      ).not.toBeInTheDocument();
    });

    it("Given: valid form data When: submitting Then: should call createContact and navigate", async () => {
      render(<ContactFormPage mode="create" />);

      fireEvent.change(screen.getByLabelText(/fields.name/), {
        target: { value: "New Contact" },
      });
      fireEvent.change(screen.getByLabelText(/fields.identification/), {
        target: { value: "99999999" },
      });

      const submitButton = screen.getByRole("button", {
        name: "create",
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateContact.mutateAsync).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard/contacts");
      });
    });
  });

  describe("edit mode", () => {
    it("Given: edit mode with loading contact When: rendering Then: should show skeleton", () => {
      mockContactQuery = { data: null, isLoading: true };

      render(<ContactFormPage mode="edit" contactId="c-1" />);

      expect(screen.queryByText("form.editTitle")).not.toBeInTheDocument();
    });

    it("Given: edit mode with contact data When: rendering Then: should show edit title", () => {
      mockContactQuery = { data: mockContactData, isLoading: false };

      render(<ContactFormPage mode="edit" contactId="c-1" />);

      expect(screen.getByText("form.editTitle")).toBeInTheDocument();
    });

    it("Given: edit mode with contact data When: rendering Then: should populate form fields", async () => {
      mockContactQuery = { data: mockContactData, isLoading: false };

      render(<ContactFormPage mode="edit" contactId="c-1" />);

      await waitFor(() => {
        expect(screen.getByLabelText(/fields.name/)).toHaveValue("John Doe");
        expect(screen.getByLabelText(/fields.identification/)).toHaveValue(
          "12345678",
        );
      });
    });

    it("Given: edit mode When: rendering Then: should show isActive toggle", () => {
      mockContactQuery = { data: mockContactData, isLoading: false };

      render(<ContactFormPage mode="edit" contactId="c-1" />);

      expect(screen.getByLabelText("fields.isActive")).toBeInTheDocument();
    });
  });
});
