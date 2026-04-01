import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ContactsSearchSelect } from "@/modules/contacts/presentation/components/shared/contacts-search-select";

// --- Mocks ---

const mockContacts = [
  {
    id: "c1",
    name: "John Doe",
    identification: "123456789",
    type: "INDIVIDUAL",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "c2",
    name: "Jane Smith",
    identification: "987654321",
    type: "INDIVIDUAL",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "c3",
    name: "Acme Corp",
    identification: "555666777",
    type: "COMPANY",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockContactRepository = {
  findAll: vi.fn((filters) => {
    let results = mockContacts;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.identification.toLowerCase().includes(searchLower),
      );
    }

    if (filters.isActive !== undefined) {
      results = results.filter((c) => c.isActive === filters.isActive);
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const start = (page - 1) * limit;
    const paginatedResults = results.slice(start, start + limit);

    return Promise.resolve({
      data: paginatedResults,
      pagination: {
        page,
        limit,
        total: results.length,
        totalPages: Math.ceil(results.length / limit),
      },
    });
  }),
};

vi.mock("@/config/di/container", () => ({
  getContainer: () => ({
    contactRepository: mockContactRepository,
  }),
}));

// --- Tests ---

describe("ContactsSearchSelect", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  function renderWithQuery(component: React.ReactElement) {
    return render(component, {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });
  }

  it("should render trigger button with placeholder when no value selected", () => {
    renderWithQuery(
      <ContactsSearchSelect
        placeholder="Select a contact..."
        searchPlaceholder="Search contacts..."
        emptyMessage="No contacts found"
      />,
    );

    const button = screen.getByRole("combobox");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Select a contact...");
  });

  it("should open dropdown on button click", async () => {
    renderWithQuery(
      <ContactsSearchSelect
        placeholder="Select a contact..."
        searchPlaceholder="Search contacts..."
      />,
    );

    const button = screen.getByRole("combobox");
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Search contacts..."),
      ).toBeInTheDocument();
    });
  });

  it("should display contacts list when opened", async () => {
    renderWithQuery(
      <ContactsSearchSelect
        placeholder="Select a contact..."
        searchPlaceholder="Search contacts..."
      />,
    );

    const button = screen.getByRole("combobox");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });
  });

  it("should display contact identification as description", async () => {
    renderWithQuery(
      <ContactsSearchSelect
        placeholder="Select a contact..."
        searchPlaceholder="Search contacts..."
      />,
    );

    const button = screen.getByRole("combobox");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("123456789")).toBeInTheDocument();
    });
  });

  it("should filter contacts by search term", async () => {
    renderWithQuery(
      <ContactsSearchSelect
        placeholder="Select a contact..."
        searchPlaceholder="Search contacts..."
      />,
    );

    const button = screen.getByRole("combobox");
    fireEvent.click(button);

    const searchInput =
      await screen.findByPlaceholderText("Search contacts...");
    fireEvent.change(searchInput, { target: { value: "John" } });

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
    });
  });

  it("should call onValueChange when contact is selected", async () => {
    const onValueChange = vi.fn();
    renderWithQuery(
      <ContactsSearchSelect
        placeholder="Select a contact..."
        searchPlaceholder="Search contacts..."
        onValueChange={onValueChange}
      />,
    );

    const button = screen.getByRole("combobox");
    fireEvent.click(button);

    const johnDoe = await screen.findByText("John Doe");
    fireEvent.click(johnDoe);

    expect(onValueChange).toHaveBeenCalledWith("c1");
  });

  it("should close dropdown after selection", async () => {
    renderWithQuery(
      <ContactsSearchSelect
        placeholder="Select a contact..."
        searchPlaceholder="Search contacts..."
        onValueChange={() => {}}
      />,
    );

    const button = screen.getByRole("combobox");
    fireEvent.click(button);

    const johnDoe = await screen.findByText("John Doe");
    fireEvent.click(johnDoe);

    await waitFor(() => {
      expect(
        screen.queryByPlaceholderText("Search contacts..."),
      ).not.toBeInTheDocument();
    });
  });

  it("should show selected value in button", async () => {
    const { rerender } = renderWithQuery(
      <ContactsSearchSelect
        value="c1"
        placeholder="Select a contact..."
        searchPlaceholder="Search contacts..."
      />,
    );

    const button = screen.getByRole("combobox");
    fireEvent.click(button);

    await waitFor(() => {
      const selectedOption = screen.getByRole("option", { selected: true });
      expect(selectedOption).toHaveAttribute("aria-selected", "true");
    });
  });

  it("should show checkmark on selected contact", async () => {
    renderWithQuery(
      <ContactsSearchSelect
        value="c2"
        placeholder="Select a contact..."
        searchPlaceholder="Search contacts..."
      />,
    );

    const button = screen.getByRole("combobox");
    fireEvent.click(button);

    await waitFor(() => {
      const janeOption = screen.getByRole("option", { selected: true });
      expect(janeOption).toHaveAttribute("aria-selected", "true");
    });
  });

  it("should close dropdown on escape key", async () => {
    renderWithQuery(
      <ContactsSearchSelect
        placeholder="Select a contact..."
        searchPlaceholder="Search contacts..."
      />,
    );

    const button = screen.getByRole("combobox");
    fireEvent.click(button);

    const searchInput =
      await screen.findByPlaceholderText("Search contacts...");
    fireEvent.keyDown(searchInput, { key: "Escape" });

    await waitFor(() => {
      expect(
        screen.queryByPlaceholderText("Search contacts..."),
      ).not.toBeInTheDocument();
    });
  });

  it("should close dropdown on click outside", async () => {
    const { container } = renderWithQuery(
      <div>
        <ContactsSearchSelect
          placeholder="Select a contact..."
          searchPlaceholder="Search contacts..."
        />
        <button>Outside button</button>
      </div>,
    );

    const triggerButton = screen.getByRole("combobox");
    fireEvent.click(triggerButton);

    await screen.findByPlaceholderText("Search contacts...");

    const outsideButton = screen.getByText("Outside button");
    fireEvent.mouseDown(outsideButton);

    await waitFor(() => {
      expect(
        screen.queryByPlaceholderText("Search contacts..."),
      ).not.toBeInTheDocument();
    });
  });

  it("should show empty message when no results", async () => {
    renderWithQuery(
      <ContactsSearchSelect
        placeholder="Select a contact..."
        searchPlaceholder="Search contacts..."
        emptyMessage="No contacts found"
      />,
    );

    const button = screen.getByRole("combobox");
    fireEvent.click(button);

    const searchInput =
      await screen.findByPlaceholderText("Search contacts...");
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });

    await waitFor(() => {
      expect(screen.getByText("No contacts found")).toBeInTheDocument();
    });
  });

  it("should be disabled when disabled prop is true", () => {
    renderWithQuery(
      <ContactsSearchSelect
        disabled={true}
        placeholder="Select a contact..."
        searchPlaceholder="Search contacts..."
      />,
    );

    const button = screen.getByRole("combobox");
    expect(button).toBeDisabled();
  });

  it("should respect placeholder prop", () => {
    renderWithQuery(
      <ContactsSearchSelect
        placeholder="Choose a contact..."
        searchPlaceholder="Search contacts..."
      />,
    );

    expect(screen.getByRole("combobox")).toHaveTextContent(
      "Choose a contact...",
    );
  });

  it("should respect searchPlaceholder prop", async () => {
    renderWithQuery(
      <ContactsSearchSelect
        placeholder="Select contact..."
        searchPlaceholder="Type to search..."
      />,
    );

    const button = screen.getByRole("combobox");
    fireEvent.click(button);

    await screen.findByPlaceholderText("Type to search...");
  });

  it("should respect emptyMessage prop", async () => {
    renderWithQuery(
      <ContactsSearchSelect
        placeholder="Select contact..."
        searchPlaceholder="Search contacts..."
        emptyMessage="No contacts available"
      />,
    );

    const button = screen.getByRole("combobox");
    fireEvent.click(button);

    const searchInput =
      await screen.findByPlaceholderText("Search contacts...");
    fireEvent.change(searchInput, { target: { value: "xyz" } });

    await waitFor(() => {
      expect(screen.getByText("No contacts available")).toBeInTheDocument();
    });
  });
});
