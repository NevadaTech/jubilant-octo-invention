import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuditActionBadge } from "@/modules/audit/presentation/components/audit-action-badge";

describe("AuditActionBadge", () => {
  it("Given: CREATE action When: rendering Then: should display CREATE text with success variant", () => {
    // Arrange & Act
    render(<AuditActionBadge action="CREATE" />);

    // Assert
    expect(screen.getByText("CREATE")).toBeDefined();
    const badge = screen.getByText("CREATE").closest("div");
    expect(badge?.className).toContain("bg-success");
  });

  it("Given: UPDATE action When: rendering Then: should display UPDATE text with info variant", () => {
    // Arrange & Act
    render(<AuditActionBadge action="UPDATE" />);

    // Assert
    expect(screen.getByText("UPDATE")).toBeDefined();
    const badge = screen.getByText("UPDATE").closest("div");
    expect(badge?.className).toContain("bg-info");
  });

  it("Given: DELETE action When: rendering Then: should display DELETE text with destructive variant", () => {
    // Arrange & Act
    render(<AuditActionBadge action="DELETE" />);

    // Assert
    expect(screen.getByText("DELETE")).toBeDefined();
    const badge = screen.getByText("DELETE").closest("div");
    expect(badge?.className).toContain("bg-destructive");
  });

  it("Given: STATUS_CHANGE action When: rendering Then: should display STATUS_CHANGE text with warning variant", () => {
    // Arrange & Act
    render(<AuditActionBadge action="STATUS_CHANGE" />);

    // Assert
    expect(screen.getByText("STATUS_CHANGE")).toBeDefined();
    const badge = screen.getByText("STATUS_CHANGE").closest("div");
    expect(badge?.className).toContain("bg-warning");
  });

  it("Given: unknown action When: rendering Then: should display action text with secondary fallback variant", () => {
    // Arrange & Act
    render(<AuditActionBadge action="UNKNOWN_ACTION" />);

    // Assert
    expect(screen.getByText("UNKNOWN_ACTION")).toBeDefined();
    const badge = screen.getByText("UNKNOWN_ACTION").closest("div");
    expect(badge?.className).toContain("bg-secondary");
  });
});
