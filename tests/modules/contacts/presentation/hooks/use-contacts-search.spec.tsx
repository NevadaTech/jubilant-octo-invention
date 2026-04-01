import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useContactsSearch } from "@/modules/contacts/presentation/hooks/use-contacts-search";
import type { Contact } from "@/modules/contacts/domain/entities/contact.entity";

// --- Mocks ---

const mockContacts: Contact[] = [
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
    // Simulate pagination and search
    let results = mockContacts;

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.identification.toLowerCase().includes(searchLower),
      );
    }

    // Filter by isActive
    if (filters.isActive !== undefined) {
      results = results.filter((c) => c.isActive === filters.isActive);
    }

    // Simulate pagination
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

describe("useContactsSearch", () => {
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

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("should lazy load contacts only when enabled is true", async () => {
    const { rerender } = renderHook((props) => useContactsSearch(props), {
      wrapper,
      initialProps: { enabled: false },
    });

    // Should not call findAll when disabled
    await waitFor(() => {
      expect(mockContactRepository.findAll).not.toHaveBeenCalled();
    });

    // Re-render with enabled: true
    rerender({ enabled: true });

    // Now should call findAll
    await waitFor(() => {
      expect(mockContactRepository.findAll).toHaveBeenCalled();
    });
  });

  it("should return empty array initially", async () => {
    const { result } = renderHook(() => useContactsSearch({ enabled: true }), {
      wrapper,
    });

    expect(result.current.contacts).toEqual([]);
  });

  it("should fetch contacts on first load", async () => {
    const { result } = renderHook(() => useContactsSearch({ enabled: true }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.contacts.length).toBeGreaterThan(0);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("should support search with debounce", async () => {
    const { result, rerender } = renderHook(
      (props) => useContactsSearch(props),
      {
        initialProps: { search: "", enabled: true },
        wrapper,
      },
    );

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.contacts.length).toBe(3);
    });

    const callsBeforeSearch = mockContactRepository.findAll.mock.calls.length;

    // Update search term
    rerender({ search: "John", enabled: true });

    // Debounce should prevent immediate call
    await waitFor(() => {
      expect(mockContactRepository.findAll.mock.calls.length).toBeGreaterThan(
        callsBeforeSearch,
      );
    });

    // Should have filtered results
    expect(result.current.contacts.some((c) => c.name.includes("John"))).toBe(
      true,
    );
  });

  it("should support pagination with hasNextPage", async () => {
    const { result } = renderHook(() => useContactsSearch({ enabled: true }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.contacts.length).toBeGreaterThan(0);
    });

    // With default limit, hasNextPage should be false (only 3 contacts)
    expect(result.current.hasNextPage).toBe(false);
  });

  it("should support fetchNextPage for pagination", async () => {
    // Create many mock contacts to test pagination
    const manyContacts = Array.from({ length: 50 }, (_, i) => ({
      id: `c${i}`,
      name: `Contact ${i}`,
      identification: `id${i}`,
      type: "INDIVIDUAL" as const,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    mockContactRepository.findAll.mockResolvedValueOnce({
      data: manyContacts.slice(0, 20),
      pagination: {
        page: 1,
        limit: 20,
        total: 50,
        totalPages: 3,
      },
    });

    const { result } = renderHook(() => useContactsSearch({ enabled: true }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.contacts.length).toBe(20);
    });

    expect(result.current.hasNextPage).toBe(true);

    // Simulate loading next page
    mockContactRepository.findAll.mockResolvedValueOnce({
      data: manyContacts.slice(20, 40),
      pagination: {
        page: 2,
        limit: 20,
        total: 50,
        totalPages: 3,
      },
    });

    result.current.fetchNextPage();

    await waitFor(() => {
      expect(result.current.isFetchingNextPage).toBe(false);
    });
  });

  it("should filter by isActive", async () => {
    const { result } = renderHook(
      () => useContactsSearch({ isActive: true, enabled: true }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.contacts.length).toBeGreaterThan(0);
    });

    // All results should be active
    result.current.contacts.forEach((c) => {
      expect(c.isActive).toBe(true);
    });
  });

  it("should handle search by name and identification", async () => {
    const { result, rerender } = renderHook(
      (props) => useContactsSearch(props),
      {
        initialProps: { search: "", enabled: true },
        wrapper,
      },
    );

    await waitFor(() => {
      expect(result.current.contacts.length).toBe(3);
    });

    // Search by name
    rerender({ search: "Acme", enabled: true });

    await waitFor(() => {
      expect(result.current.contacts.some((c) => c.name === "Acme Corp")).toBe(
        true,
      );
    });

    // Clear search and search by identification
    rerender({ search: "", enabled: true });

    await waitFor(() => {
      expect(result.current.contacts.length).toBe(3);
    });

    rerender({ search: "123456789", enabled: true });

    await waitFor(() => {
      expect(
        result.current.contacts.some((c) => c.identification === "123456789"),
      ).toBe(true);
    });
  });

  it("should expose isError state", async () => {
    const { result } = renderHook(() => useContactsSearch({ enabled: true }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toBe(false);
  });
});
