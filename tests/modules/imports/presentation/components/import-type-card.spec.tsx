import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

import { ImportTypeCard } from "@/modules/imports/presentation/components/import-type-card";

describe("ImportTypeCard", () => {
  const defaultProps = {
    type: "PRODUCTS" as const,
    onImport: vi.fn(),
    onDownloadTemplate: vi.fn(),
    isDownloading: false,
  };

  it("Given: a PRODUCTS type When: rendering Then: should show the translated type name", () => {
    render(<ImportTypeCard {...defaultProps} />);

    expect(screen.getByText("types.products")).toBeInTheDocument();
  });

  it("Given: a PRODUCTS type When: rendering Then: should show the type description", () => {
    render(<ImportTypeCard {...defaultProps} />);

    expect(screen.getByText("typeDescriptions.products")).toBeInTheDocument();
  });

  it("Given: a MOVEMENTS type When: rendering Then: should show movements label", () => {
    render(<ImportTypeCard {...defaultProps} type="MOVEMENTS" />);

    expect(screen.getByText("types.movements")).toBeInTheDocument();
  });

  it("Given: a WAREHOUSES type When: rendering Then: should show warehouses label", () => {
    render(<ImportTypeCard {...defaultProps} type="WAREHOUSES" />);

    expect(screen.getByText("types.warehouses")).toBeInTheDocument();
  });

  it("Given: the card When: rendering Then: should show template download button", () => {
    render(<ImportTypeCard {...defaultProps} />);

    expect(screen.getByText("template.title")).toBeInTheDocument();
  });

  it("Given: the card When: rendering Then: should show start import button", () => {
    render(<ImportTypeCard {...defaultProps} />);

    expect(screen.getByText("startImport")).toBeInTheDocument();
  });

  it("Given: the import button When: clicking Then: should call onImport with the type", () => {
    const onImport = vi.fn();
    render(<ImportTypeCard {...defaultProps} onImport={onImport} />);

    fireEvent.click(screen.getByText("startImport"));

    expect(onImport).toHaveBeenCalledWith("PRODUCTS");
  });

  it("Given: isDownloading is true When: rendering Then: should disable the template button", () => {
    render(<ImportTypeCard {...defaultProps} isDownloading={true} />);

    const templateButton = screen.getByText("template.title").closest("button");
    expect(templateButton).toBeDisabled();
  });

  it("Given: isDownloading is false When: rendering Then: should enable the template button", () => {
    render(<ImportTypeCard {...defaultProps} isDownloading={false} />);

    const templateButton = screen.getByText("template.title").closest("button");
    expect(templateButton).not.toBeDisabled();
  });
});
