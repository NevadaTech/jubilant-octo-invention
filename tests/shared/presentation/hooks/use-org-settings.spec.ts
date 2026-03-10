import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";

const mockUseAuth = vi.fn();

vi.mock("@/modules/authentication/presentation/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth(),
}));

import { useOrgSettings } from "@/shared/presentation/hooks/use-org-settings";

describe("useOrgSettings", () => {
  it("Given: user has multiCompanyEnabled true When: hook is called Then: multiCompanyEnabled should be true", () => {
    // Arrange
    mockUseAuth.mockReturnValue({
      user: {
        orgSettings: { multiCompanyEnabled: true, integrationsEnabled: false },
      },
    });

    // Act
    const { result } = renderHook(() => useOrgSettings());

    // Assert
    expect(result.current.multiCompanyEnabled).toBe(true);
  });

  it("Given: user has integrationsEnabled true When: hook is called Then: integrationsEnabled should be true", () => {
    // Arrange
    mockUseAuth.mockReturnValue({
      user: {
        orgSettings: { multiCompanyEnabled: false, integrationsEnabled: true },
      },
    });

    // Act
    const { result } = renderHook(() => useOrgSettings());

    // Assert
    expect(result.current.integrationsEnabled).toBe(true);
  });

  it("Given: user has no orgSettings When: hook is called Then: both settings should default to false", () => {
    // Arrange
    mockUseAuth.mockReturnValue({
      user: { orgSettings: undefined },
    });

    // Act
    const { result } = renderHook(() => useOrgSettings());

    // Assert
    expect(result.current.multiCompanyEnabled).toBe(false);
    expect(result.current.integrationsEnabled).toBe(false);
  });

  it("Given: user is null When: hook is called Then: both settings should default to false", () => {
    // Arrange
    mockUseAuth.mockReturnValue({
      user: null,
    });

    // Act
    const { result } = renderHook(() => useOrgSettings());

    // Assert
    expect(result.current.multiCompanyEnabled).toBe(false);
    expect(result.current.integrationsEnabled).toBe(false);
  });

  it("Given: orgSettings has multiCompanyEnabled as null When: hook is called Then: multiCompanyEnabled should be false via ?? operator", () => {
    // Arrange
    mockUseAuth.mockReturnValue({
      user: {
        orgSettings: { multiCompanyEnabled: null, integrationsEnabled: null },
      },
    });

    // Act
    const { result } = renderHook(() => useOrgSettings());

    // Assert
    expect(result.current.multiCompanyEnabled).toBe(false);
    expect(result.current.integrationsEnabled).toBe(false);
  });

  it("Given: both settings are true When: hook is called Then: both should return true", () => {
    // Arrange
    mockUseAuth.mockReturnValue({
      user: {
        orgSettings: { multiCompanyEnabled: true, integrationsEnabled: true },
      },
    });

    // Act
    const { result } = renderHook(() => useOrgSettings());

    // Assert
    expect(result.current.multiCompanyEnabled).toBe(true);
    expect(result.current.integrationsEnabled).toBe(true);
  });
});
