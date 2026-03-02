import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { User } from "@/modules/authentication/domain/entities/user";

let mockStoreState: {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  clearError: () => void;
};

const mockClearError = vi.fn();

vi.mock("@/modules/authentication/presentation/store/auth.store", () => ({
  useAuthStore: (selector: (state: typeof mockStoreState) => unknown) =>
    selector(mockStoreState),
}));

import { useAuth } from "@/modules/authentication/presentation/hooks/use-auth";

function createUser(): User {
  return User.create({
    id: "user-1",
    email: "john@test.com",
    username: "johndoe",
    firstName: "John",
    lastName: "Doe",
    roles: ["ADMIN"],
    permissions: ["PRODUCTS:READ"],
  });
}

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: true,
      error: null,
      clearError: mockClearError,
    };
  });

  it("Given: no authenticated user When: calling useAuth Then: should return null user and isAuthenticated false", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("Given: an authenticated user When: calling useAuth Then: should return the user entity and isAuthenticated true", () => {
    const user = createUser();
    mockStoreState = { ...mockStoreState, user, isAuthenticated: true };
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBe(user);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe("john@test.com");
  });

  it("Given: store is loading When: calling useAuth Then: should return isLoading true", () => {
    mockStoreState = { ...mockStoreState, isLoading: true };
    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoading).toBe(true);
  });

  it("Given: store has an error When: calling useAuth Then: should return the error message", () => {
    mockStoreState = { ...mockStoreState, error: "Invalid credentials" };
    const { result } = renderHook(() => useAuth());
    expect(result.current.error).toBe("Invalid credentials");
  });

  it("Given: an error exists When: calling clearError Then: should invoke the store clearError action", () => {
    mockStoreState = {
      ...mockStoreState,
      error: "Some error",
      clearError: mockClearError,
    };
    const { result } = renderHook(() => useAuth());
    result.current.clearError();
    expect(mockClearError).toHaveBeenCalledOnce();
  });

  it("Given: store is not yet hydrated When: calling useAuth Then: should return isHydrated false", () => {
    mockStoreState = { ...mockStoreState, isHydrated: false };
    const { result } = renderHook(() => useAuth());
    expect(result.current.isHydrated).toBe(false);
  });
});
