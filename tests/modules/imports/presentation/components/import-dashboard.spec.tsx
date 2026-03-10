import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/modules/imports/presentation/components/import-type-grid", () => ({
  ImportTypeGrid: (props: { isDownloading?: boolean }) => (
    <div data-testid="import-type-grid" data-downloading={props.isDownloading}>
      ImportTypeGrid
    </div>
  ),
}));

vi.mock(
  "@/modules/imports/presentation/components/import-wizard-dialog",
  () => ({
    ImportWizardDialog: ({
      open,
      importType,
    }: {
      open: boolean;
      importType: string | null;
    }) => (
      <div
        data-testid="import-wizard-dialog"
        data-open={open}
        data-type={importType}
      >
        ImportWizardDialog
      </div>
    ),
  }),
);

vi.mock("@/modules/imports/presentation/components/import-history", () => ({
  ImportHistory: () => <div data-testid="import-history">ImportHistory</div>,
}));

vi.mock("@/modules/imports/presentation/hooks/use-imports", () => ({
  useDownloadTemplate: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

import { ImportDashboard } from "@/modules/imports/presentation/components/import-dashboard";

describe("ImportDashboard", () => {
  it("Given: the dashboard When: rendering Then: should show page title", () => {
    render(<ImportDashboard />);

    expect(screen.getByText("title")).toBeInTheDocument();
  });

  it("Given: the dashboard When: rendering Then: should show page description", () => {
    render(<ImportDashboard />);

    expect(screen.getByText("description")).toBeInTheDocument();
  });

  it("Given: the dashboard When: rendering Then: should render ImportTypeGrid", () => {
    render(<ImportDashboard />);

    expect(screen.getByTestId("import-type-grid")).toBeInTheDocument();
  });

  it("Given: the dashboard When: rendering Then: should render ImportWizardDialog", () => {
    render(<ImportDashboard />);

    expect(screen.getByTestId("import-wizard-dialog")).toBeInTheDocument();
  });

  it("Given: the dashboard When: rendering Then: should render ImportHistory", () => {
    render(<ImportDashboard />);

    expect(screen.getByTestId("import-history")).toBeInTheDocument();
  });

  it("Given: the dashboard When: rendering Then: wizard should be closed by default", () => {
    render(<ImportDashboard />);

    const wizard = screen.getByTestId("import-wizard-dialog");
    expect(wizard).toHaveAttribute("data-open", "false");
  });
});
