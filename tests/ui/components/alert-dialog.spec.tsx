import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/ui/components/alert-dialog";

describe("AlertDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Branch: controlled open ---
  it("Given: open is true When: rendering Then: should show content", () => {
    render(
      <AlertDialog open={true}>
        <AlertDialogContent>
          <AlertDialogTitle>Test Title</AlertDialogTitle>
          <AlertDialogDescription>Test Description</AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>,
    );
    expect(screen.getByText("Test Title")).toBeDefined();
    expect(screen.getByText("Test Description")).toBeDefined();
  });

  it("Given: open is false When: rendering Then: should not show content", () => {
    render(
      <AlertDialog open={false}>
        <AlertDialogContent>
          <AlertDialogTitle>Hidden Title</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>,
    );
    expect(screen.queryByText("Hidden Title")).toBeNull();
  });

  // --- Branch: uncontrolled (defaultOpen) ---
  it("Given: defaultOpen is true When: rendering Then: should show content", () => {
    render(
      <AlertDialog defaultOpen={true}>
        <AlertDialogContent>
          <AlertDialogTitle>Default Open</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>,
    );
    expect(screen.getByText("Default Open")).toBeDefined();
  });

  it("Given: defaultOpen is false When: rendering Then: should not show content", () => {
    render(
      <AlertDialog defaultOpen={false}>
        <AlertDialogContent>
          <AlertDialogTitle>Not Shown</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>,
    );
    expect(screen.queryByText("Not Shown")).toBeNull();
  });

  // --- Branch: trigger opens dialog (uncontrolled) ---
  it("Given: uncontrolled dialog When: clicking trigger Then: should open dialog", () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Triggered Dialog</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>,
    );
    expect(screen.queryByText("Triggered Dialog")).toBeNull();
    fireEvent.click(screen.getByText("Open"));
    expect(screen.getByText("Triggered Dialog")).toBeDefined();
  });

  // --- Branch: controlled dialog with onOpenChange ---
  it("Given: controlled dialog When: clicking trigger Then: should call onOpenChange", () => {
    const onOpenChange = vi.fn();
    render(
      <AlertDialog open={false} onOpenChange={onOpenChange}>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Controlled</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>,
    );
    fireEvent.click(screen.getByText("Open"));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  // --- Branch: Escape key closes dialog ---
  it("Given: open dialog When: pressing Escape Then: should call onOpenChange with false", () => {
    const onOpenChange = vi.fn();
    render(
      <AlertDialog open={true} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogTitle>Escapable</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  // --- Branch: non-Escape key does not close ---
  it("Given: open dialog When: pressing non-Escape key Then: should not close", () => {
    const onOpenChange = vi.fn();
    render(
      <AlertDialog open={true} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogTitle>Stay Open</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>,
    );
    fireEvent.keyDown(document, { key: "Enter" });
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  // --- Branch: Action button closes dialog ---
  it("Given: open dialog When: clicking action Then: should call onOpenChange with false", () => {
    const onOpenChange = vi.fn();
    const onClick = vi.fn();
    render(
      <AlertDialog open={true} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogAction onClick={onClick}>Confirm</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>,
    );
    fireEvent.click(screen.getByText("Confirm"));
    expect(onClick).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  // --- Branch: Action button without onClick ---
  it("Given: open dialog When: clicking action without onClick handler Then: should still close", () => {
    const onOpenChange = vi.fn();
    render(
      <AlertDialog open={true} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogAction>OK</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>,
    );
    fireEvent.click(screen.getByText("OK"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  // --- Branch: Cancel button closes dialog ---
  it("Given: open dialog When: clicking cancel Then: should call onOpenChange with false", () => {
    const onOpenChange = vi.fn();
    const onClick = vi.fn();
    render(
      <AlertDialog open={true} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogCancel onClick={onClick}>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>,
    );
    fireEvent.click(screen.getByText("Cancel"));
    expect(onClick).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  // --- Branch: Cancel button without onClick ---
  it("Given: open dialog When: clicking cancel without onClick handler Then: should still close", () => {
    const onOpenChange = vi.fn();
    render(
      <AlertDialog open={true} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogCancel>Dismiss</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>,
    );
    fireEvent.click(screen.getByText("Dismiss"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  // --- Branch: trigger onClick passthrough ---
  it("Given: trigger with onClick When: clicking Then: should call both onClick and onOpenChange", () => {
    const triggerClick = vi.fn();
    render(
      <AlertDialog>
        <AlertDialogTrigger onClick={triggerClick}>Click Me</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Content</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>,
    );
    fireEvent.click(screen.getByText("Click Me"));
    expect(triggerClick).toHaveBeenCalled();
  });

  // --- Branch: trigger without onClick ---
  it("Given: trigger without onClick When: clicking Then: should open without error", () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>No Handler</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Opened</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>,
    );
    fireEvent.click(screen.getByText("No Handler"));
    expect(screen.getByText("Opened")).toBeDefined();
  });

  // --- Branch: trigger asChild ---
  it("Given: trigger with asChild When: rendering Then: should use child element", () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <span data-testid="custom-trigger">Custom Trigger</span>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>AsChild Content</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>,
    );
    fireEvent.click(screen.getByTestId("custom-trigger"));
    expect(screen.getByText("AsChild Content")).toBeDefined();
  });

  // --- Header and Footer render ---
  it("Given: dialog with header and footer When: rendering Then: should show both", () => {
    render(
      <AlertDialog open={true}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Header Title</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );
    expect(screen.getByText("Header Title")).toBeDefined();
    expect(screen.getByText("OK")).toBeDefined();
  });

  // --- Branch: uncontrolled dialog close via cancel ---
  it("Given: uncontrolled dialog opened via trigger When: clicking cancel Then: should close", () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Closable</AlertDialogTitle>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>,
    );
    fireEvent.click(screen.getByText("Open"));
    expect(screen.getByText("Closable")).toBeDefined();
    fireEvent.click(screen.getByText("Close"));
    expect(screen.queryByText("Closable")).toBeNull();
  });
});
