import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ImportStatusBadge } from "@/modules/imports/presentation/components/import-status-badge";
import type { ImportStatus } from "@/modules/imports/domain/entities";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("ImportStatusBadge", () => {
  it("renders PENDING badge", () => {
    render(<ImportStatusBadge status={"PENDING" as ImportStatus} />);
    expect(screen.getByText("PENDING")).toBeDefined();
  });

  it("renders COMPLETED badge with success variant", () => {
    render(<ImportStatusBadge status={"COMPLETED" as ImportStatus} />);
    expect(screen.getByText("COMPLETED")).toBeDefined();
    const badge = screen.getByText("COMPLETED").closest("div");
    expect(badge?.className).toContain("bg-success");
  });

  it("renders FAILED badge with error variant", () => {
    render(<ImportStatusBadge status={"FAILED" as ImportStatus} />);
    expect(screen.getByText("FAILED")).toBeDefined();
    const badge = screen.getByText("FAILED").closest("div");
    expect(badge?.className).toContain("bg-error");
  });

  it("renders PROCESSING badge with info variant", () => {
    render(<ImportStatusBadge status={"PROCESSING" as ImportStatus} />);
    expect(screen.getByText("PROCESSING")).toBeDefined();
    const badge = screen.getByText("PROCESSING").closest("div");
    expect(badge?.className).toContain("bg-info");
  });
});
