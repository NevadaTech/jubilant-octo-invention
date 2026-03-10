import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/ui/components/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="dialog-title">{children}</h2>
  ),
}));

vi.mock("@/modules/imports/presentation/components/file-dropzone", () => ({
  FileDropzone: () => <div data-testid="file-dropzone">FileDropzone</div>,
}));

vi.mock(
  "@/modules/imports/presentation/components/import-preview-results",
  () => ({
    ImportPreviewResults: () => (
      <div data-testid="preview-results">PreviewResults</div>
    ),
  }),
);

vi.mock("@/modules/imports/presentation/components/import-progress", () => ({
  ImportProgress: () => <div data-testid="import-progress">ImportProgress</div>,
}));

const mockPreviewMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
};

const mockExecuteMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
};

vi.mock("@/modules/imports/presentation/hooks/use-imports", () => ({
  usePreviewImport: () => mockPreviewMutation,
  useExecuteImport: () => mockExecuteMutation,
}));

import { ImportWizardDialog } from "@/modules/imports/presentation/components/import-wizard-dialog";

describe("ImportWizardDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    importType: "PRODUCTS" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Given: open is true and importType is PRODUCTS When: rendering Then: should show dialog", () => {
    render(<ImportWizardDialog {...defaultProps} />);

    expect(screen.getByTestId("dialog")).toBeInTheDocument();
  });

  it("Given: open is true When: rendering Then: should show dialog title", () => {
    render(<ImportWizardDialog {...defaultProps} />);

    expect(screen.getByTestId("dialog-title")).toBeInTheDocument();
  });

  it("Given: importType is null When: rendering Then: should not render dialog", () => {
    render(<ImportWizardDialog {...defaultProps} importType={null} />);

    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });

  it("Given: open is false When: rendering Then: should not render dialog", () => {
    render(<ImportWizardDialog {...defaultProps} open={false} />);

    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });

  it("Given: the wizard on upload step When: rendering Then: should show file dropzone", () => {
    render(<ImportWizardDialog {...defaultProps} />);

    expect(screen.getByTestId("file-dropzone")).toBeInTheDocument();
  });

  it("Given: the wizard on upload step When: rendering Then: should show validate button", () => {
    render(<ImportWizardDialog {...defaultProps} />);

    expect(screen.getByText("wizard.validate")).toBeInTheDocument();
  });

  it("Given: the wizard When: rendering Then: should show all three step labels", () => {
    render(<ImportWizardDialog {...defaultProps} />);

    expect(screen.getByText("wizard.step1")).toBeInTheDocument();
    expect(screen.getByText("wizard.step2")).toBeInTheDocument();
    expect(screen.getByText("wizard.step3")).toBeInTheDocument();
  });

  it("Given: the wizard When: rendering Then: should show step numbers 1, 2, 3", () => {
    render(<ImportWizardDialog {...defaultProps} />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
