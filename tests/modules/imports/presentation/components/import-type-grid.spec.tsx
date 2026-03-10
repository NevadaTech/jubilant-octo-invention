import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

import { ImportTypeGrid } from "@/modules/imports/presentation/components/import-type-grid";

describe("ImportTypeGrid", () => {
  const defaultProps = {
    onImport: vi.fn(),
    onDownloadTemplate: vi.fn(),
    isDownloading: false,
  };

  it("Given: the grid When: rendering Then: should show all five import type cards", () => {
    render(<ImportTypeGrid {...defaultProps} />);

    expect(screen.getByText("types.products")).toBeInTheDocument();
    expect(screen.getByText("types.movements")).toBeInTheDocument();
    expect(screen.getByText("types.warehouses")).toBeInTheDocument();
    expect(screen.getByText("types.stock")).toBeInTheDocument();
    expect(screen.getByText("types.transfers")).toBeInTheDocument();
  });

  it("Given: the grid When: rendering Then: should render five import buttons", () => {
    render(<ImportTypeGrid {...defaultProps} />);

    const importButtons = screen.getAllByText("startImport");
    expect(importButtons).toHaveLength(5);
  });

  it("Given: the grid When: rendering Then: should render five template buttons", () => {
    render(<ImportTypeGrid {...defaultProps} />);

    const templateButtons = screen.getAllByText("template.title");
    expect(templateButtons).toHaveLength(5);
  });

  it("Given: isDownloading is true When: rendering Then: should disable all template buttons", () => {
    render(<ImportTypeGrid {...defaultProps} isDownloading={true} />);

    const templateButtons = screen.getAllByText("template.title");
    templateButtons.forEach((btn) => {
      expect(btn.closest("button")).toBeDisabled();
    });
  });

  it("Given: isDownloading is false When: rendering Then: should enable all template buttons", () => {
    render(<ImportTypeGrid {...defaultProps} isDownloading={false} />);

    const templateButtons = screen.getAllByText("template.title");
    templateButtons.forEach((btn) => {
      expect(btn.closest("button")).not.toBeDisabled();
    });
  });
});
