import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmDeleteDialog } from "@/ui/components/confirm-delete-dialog";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/ui/components/alert-dialog", () => ({
  AlertDialog: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open: boolean;
  }) => (open ? <div data-testid="alert-dialog">{children}</div> : null),
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-content">{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-header">{children}</div>
  ),
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="alert-dialog-title">{children}</h2>
  ),
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="alert-dialog-description">{children}</p>
  ),
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-footer">{children}</div>
  ),
  AlertDialogCancel: ({
    children,
    disabled,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
  }) => (
    <button data-testid="alert-dialog-cancel" disabled={disabled}>
      {children}
    </button>
  ),
  AlertDialogAction: ({
    children,
    onClick,
    disabled,
    className,
  }: {
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent) => void;
    disabled?: boolean;
    className?: string;
  }) => (
    <button
      data-testid="alert-dialog-action"
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  ),
}));

// --- Tests ---

describe("ConfirmDeleteDialog", () => {
  const mockOnOpenChange = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    mockOnOpenChange.mockClear();
    mockOnConfirm.mockClear();
  });

  it("Given: open is false When: rendering Then: should render nothing", () => {
    const { container } = render(
      <ConfirmDeleteDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />,
    );

    expect(
      container.querySelector("[data-testid='alert-dialog']"),
    ).toBeNull();
  });

  it("Given: open is true and no custom title When: rendering Then: should show default title from i18n", () => {
    render(
      <ConfirmDeleteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />,
    );

    expect(screen.getByTestId("alert-dialog-title")).toHaveTextContent(
      "confirmDelete",
    );
  });

  it("Given: open is true and no custom description When: rendering Then: should show default description from i18n", () => {
    render(
      <ConfirmDeleteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />,
    );

    expect(screen.getByTestId("alert-dialog-description")).toHaveTextContent(
      "confirmDeleteDesc",
    );
  });

  it("Given: custom title and description When: rendering Then: should show the custom text", () => {
    render(
      <ConfirmDeleteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
        title="Remove item?"
        description="This action cannot be undone."
      />,
    );

    expect(screen.getByTestId("alert-dialog-title")).toHaveTextContent(
      "Remove item?",
    );
    expect(screen.getByTestId("alert-dialog-description")).toHaveTextContent(
      "This action cannot be undone.",
    );
  });

  it("Given: open is true and not loading When: rendering Then: should show cancel and delete buttons both enabled", () => {
    render(
      <ConfirmDeleteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />,
    );

    const cancelBtn = screen.getByTestId("alert-dialog-cancel");
    const actionBtn = screen.getByTestId("alert-dialog-action");

    expect(cancelBtn).not.toBeDisabled();
    expect(actionBtn).not.toBeDisabled();
    expect(cancelBtn).toHaveTextContent("cancel");
    expect(actionBtn).toHaveTextContent("delete");
  });

  it("Given: isLoading is true When: rendering Then: should show loading text and disable both buttons", () => {
    render(
      <ConfirmDeleteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
        isLoading={true}
      />,
    );

    const cancelBtn = screen.getByTestId("alert-dialog-cancel");
    const actionBtn = screen.getByTestId("alert-dialog-action");

    expect(cancelBtn).toBeDisabled();
    expect(actionBtn).toBeDisabled();
    expect(actionBtn).toHaveTextContent("loading");
  });

  it("Given: open is true When: clicking the confirm action button Then: should call onConfirm", () => {
    render(
      <ConfirmDeleteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />,
    );

    fireEvent.click(screen.getByTestId("alert-dialog-action"));

    expect(mockOnConfirm).toHaveBeenCalledOnce();
  });
});
