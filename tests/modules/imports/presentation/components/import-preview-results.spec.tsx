import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ImportPreview } from "@/modules/imports/domain/entities/import-preview.entity";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

import { ImportPreviewResults } from "@/modules/imports/presentation/components/import-preview-results";

describe("ImportPreviewResults", () => {
  const validPreview = new ImportPreview(80, 80, 0, [], [], []);

  const previewWithErrors = new ImportPreview(
    50,
    30,
    20,
    [{ message: "Missing required column: SKU" }],
    [
      {
        rowNumber: 3,
        column: "price",
        error: "Invalid number",
        severity: "error" as const,
      },
      {
        rowNumber: 7,
        column: "name",
        error: "Too long",
        severity: "warning" as const,
      },
    ],
    [],
  );

  const previewWithWarnings = new ImportPreview(
    60,
    60,
    0,
    [],
    [],
    ["Some rows have optional fields missing", "Duplicate SKUs detected"],
  );

  it("Given: a valid preview When: rendering Then: should show summary section", () => {
    render(<ImportPreviewResults preview={validPreview} />);

    expect(screen.getByText("summary")).toBeInTheDocument();
  });

  it("Given: a valid preview When: rendering Then: should show total rows label", () => {
    render(<ImportPreviewResults preview={validPreview} />);

    expect(screen.getByText("totalRows")).toBeInTheDocument();
  });

  it("Given: a valid preview When: rendering Then: should show valid rows label", () => {
    render(<ImportPreviewResults preview={validPreview} />);

    expect(screen.getByText("validRows")).toBeInTheDocument();
  });

  it("Given: a valid preview When: rendering Then: should show invalid rows label", () => {
    render(<ImportPreviewResults preview={validPreview} />);

    expect(screen.getByText("invalidRows")).toBeInTheDocument();
  });

  it("Given: canBeProcessed is true When: rendering Then: should show can process message", () => {
    render(<ImportPreviewResults preview={validPreview} />);

    expect(screen.getByText("canProcess")).toBeInTheDocument();
    expect(screen.queryByText("cannotProcess")).not.toBeInTheDocument();
  });

  it("Given: canBeProcessed is false When: rendering Then: should show cannot process message", () => {
    render(<ImportPreviewResults preview={previewWithErrors} />);

    expect(screen.getByText("cannotProcess")).toBeInTheDocument();
    expect(screen.queryByText("canProcess")).not.toBeInTheDocument();
  });

  it("Given: structure errors exist When: rendering Then: should show structure errors section", () => {
    render(<ImportPreviewResults preview={previewWithErrors} />);

    expect(screen.getByText("structureErrors")).toBeInTheDocument();
    expect(
      screen.getByText("Missing required column: SKU"),
    ).toBeInTheDocument();
  });

  it("Given: no structure errors When: rendering Then: should not show structure errors section", () => {
    render(<ImportPreviewResults preview={validPreview} />);

    expect(screen.queryByText("structureErrors")).not.toBeInTheDocument();
  });

  it("Given: row errors exist When: rendering Then: should show row errors table", () => {
    render(<ImportPreviewResults preview={previewWithErrors} />);

    expect(screen.getByText("rowErrors")).toBeInTheDocument();
    expect(screen.getByText("Invalid number")).toBeInTheDocument();
    expect(screen.getByText("Too long")).toBeInTheDocument();
  });

  it("Given: row errors with column info When: rendering Then: should show row numbers and columns", () => {
    render(<ImportPreviewResults preview={previewWithErrors} />);

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("price")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("name")).toBeInTheDocument();
  });

  it("Given: no row errors When: rendering Then: should not show row errors section", () => {
    render(<ImportPreviewResults preview={validPreview} />);

    expect(screen.queryByText("rowErrors")).not.toBeInTheDocument();
  });

  it("Given: warnings exist When: rendering Then: should show warnings section", () => {
    render(<ImportPreviewResults preview={previewWithWarnings} />);

    expect(screen.getByText("warnings")).toBeInTheDocument();
    expect(
      screen.getByText("Some rows have optional fields missing"),
    ).toBeInTheDocument();
    expect(screen.getByText("Duplicate SKUs detected")).toBeInTheDocument();
  });

  it("Given: no warnings When: rendering Then: should not show warnings section", () => {
    render(<ImportPreviewResults preview={validPreview} />);

    expect(screen.queryByText("warnings")).not.toBeInTheDocument();
  });

  it("Given: preview with mixed row counts When: rendering Then: should show correct counts", () => {
    render(<ImportPreviewResults preview={previewWithErrors} />);

    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
  });
});
