import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
} from "@/ui/components/sheet";

describe("Sheet", () => {
  it("Given: SheetContent used outside Sheet When: rendering Then: should throw error", () => {
    // Suppress console.error for expected error
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() =>
      render(
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Title</SheetTitle>
          </SheetHeader>
        </SheetContent>,
      ),
    ).toThrow("Sheet components must be used within a Sheet");

    spy.mockRestore();
  });

  it("Given: open is true without onOpenChange When: rendering Then: should still render correctly", () => {
    render(
      <Sheet open={true}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>No Handler</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );

    expect(screen.getByText("No Handler")).toBeInTheDocument();
  });

  it("Given: open is true without onOpenChange When: clicking close Then: should not throw", () => {
    render(
      <Sheet open={true}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>No Handler</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );

    const closeButton = screen.getByText("Close").closest("button")!;
    expect(() => fireEvent.click(closeButton)).not.toThrow();
  });

  it("Given: open is false When: rendering Then: should not display content", () => {
    // Arrange & Act
    render(
      <Sheet open={false}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>My Sheet</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );

    // Assert
    expect(screen.queryByText("My Sheet")).not.toBeInTheDocument();
  });

  it("Given: open is true When: rendering Then: should display the sheet title", () => {
    // Arrange & Act
    render(
      <Sheet open={true}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>My Sheet</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );

    // Assert
    expect(screen.getByText("My Sheet")).toBeInTheDocument();
  });

  it("Given: open is true When: rendering Then: should display description and body content", () => {
    // Arrange & Act
    render(
      <Sheet open={true}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Title</SheetTitle>
            <SheetDescription>A description</SheetDescription>
          </SheetHeader>
          <SheetBody>Body content here</SheetBody>
        </SheetContent>
      </Sheet>,
    );

    // Assert
    expect(screen.getByText("A description")).toBeInTheDocument();
    expect(screen.getByText("Body content here")).toBeInTheDocument();
  });

  it("Given: open is true When: close button is clicked Then: onOpenChange should be called with false", () => {
    // Arrange
    const onOpenChange = vi.fn();
    render(
      <Sheet open={true} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Title</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );

    // Act
    const closeButton = screen.getByText("Close").closest("button")!;
    fireEvent.click(closeButton);

    // Assert
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("Given: open is true When: Escape key is pressed Then: onOpenChange should be called with false", () => {
    // Arrange
    const onOpenChange = vi.fn();
    render(
      <Sheet open={true} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Title</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );

    // Act
    fireEvent.keyDown(document, { key: "Escape" });

    // Assert
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("Given: open is true When: overlay is clicked Then: onOpenChange should be called with false", () => {
    // Arrange
    const onOpenChange = vi.fn();
    render(
      <Sheet open={true} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Title</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );

    // Act — the overlay is the fixed backdrop element
    const overlay = document.querySelector(".fixed.inset-0") as HTMLElement;
    fireEvent.click(overlay);

    // Assert
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("Given: SheetTitle When: rendering Then: should render as h2 element", () => {
    // Arrange & Act
    render(
      <Sheet open={true}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Heading</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );

    // Assert
    const title = screen.getByText("Heading");
    expect(title.tagName).toBe("H2");
  });

  it("Given: custom classNames on subcomponents When: rendering Then: should merge with default classes", () => {
    // Arrange & Act
    render(
      <Sheet open={true}>
        <SheetContent className="custom-content">
          <SheetHeader className="custom-header">
            <SheetTitle className="custom-title">Title</SheetTitle>
            <SheetDescription className="custom-desc">Desc</SheetDescription>
          </SheetHeader>
          <SheetBody className="custom-body">Body</SheetBody>
        </SheetContent>
      </Sheet>,
    );

    // Assert
    expect(screen.getByText("Title").className).toContain("custom-title");
    expect(screen.getByText("Desc").className).toContain("custom-desc");

    const bodyText = screen.getByText("Body");
    expect(bodyText.className).toContain("custom-body");
  });
});
