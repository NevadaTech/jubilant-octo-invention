import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
} from "@/ui/components/dropdown-menu";

// Radix DropdownMenu requires a trigger + open to render content.
// We test the wrapper components' class logic and prop forwarding.

describe("DropdownMenu", () => {
  // Helper to render an open dropdown menu
  function renderOpenMenu(content: React.ReactNode) {
    return render(
      <DropdownMenu open>
        <DropdownMenuTrigger asChild>
          <button data-testid="trigger">Open</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>{content}</DropdownMenuContent>
      </DropdownMenu>,
    );
  }

  // --- DropdownMenuItem ---

  it("Given: DropdownMenuItem without inset When: rendering Then: should NOT have pl-8 class", () => {
    renderOpenMenu(
      <DropdownMenuItem data-testid="item">Item 1</DropdownMenuItem>,
    );

    const item = screen.getByTestId("item");
    expect(item).toBeInTheDocument();
    expect(item.className).not.toContain("pl-8");
  });

  it("Given: DropdownMenuItem with inset When: rendering Then: should have pl-8 class", () => {
    renderOpenMenu(
      <DropdownMenuItem inset data-testid="item-inset">
        Inset Item
      </DropdownMenuItem>,
    );

    const item = screen.getByTestId("item-inset");
    expect(item).toBeInTheDocument();
    expect(item.className).toContain("pl-8");
  });

  it("Given: DropdownMenuItem with custom className When: rendering Then: should merge classes", () => {
    renderOpenMenu(
      <DropdownMenuItem className="custom-class" data-testid="item-custom">
        Custom
      </DropdownMenuItem>,
    );

    const item = screen.getByTestId("item-custom");
    expect(item.className).toContain("custom-class");
  });

  // --- DropdownMenuLabel ---

  it("Given: DropdownMenuLabel without inset When: rendering Then: should NOT have pl-8 class", () => {
    renderOpenMenu(
      <DropdownMenuLabel data-testid="label">Label</DropdownMenuLabel>,
    );

    const label = screen.getByTestId("label");
    expect(label).toBeInTheDocument();
    expect(label.className).not.toContain("pl-8");
    expect(label.className).toContain("font-semibold");
  });

  it("Given: DropdownMenuLabel with inset When: rendering Then: should have pl-8 class", () => {
    renderOpenMenu(
      <DropdownMenuLabel inset data-testid="label-inset">
        Inset Label
      </DropdownMenuLabel>,
    );

    const label = screen.getByTestId("label-inset");
    expect(label.className).toContain("pl-8");
  });

  // --- DropdownMenuSeparator ---

  it("Given: DropdownMenuSeparator When: rendering Then: should render with separator styles", () => {
    renderOpenMenu(
      <>
        <DropdownMenuItem>Item 1</DropdownMenuItem>
        <DropdownMenuSeparator data-testid="separator" />
        <DropdownMenuItem>Item 2</DropdownMenuItem>
      </>,
    );

    const separator = screen.getByTestId("separator");
    expect(separator).toBeInTheDocument();
    expect(separator.className).toContain("bg-muted");
  });

  it("Given: DropdownMenuSeparator with custom className When: rendering Then: should merge classes", () => {
    renderOpenMenu(
      <DropdownMenuSeparator
        data-testid="sep-custom"
        className="my-custom-sep"
      />,
    );

    const separator = screen.getByTestId("sep-custom");
    expect(separator.className).toContain("my-custom-sep");
  });

  // --- DropdownMenuShortcut ---

  it("Given: DropdownMenuShortcut When: rendering Then: should render shortcut text", () => {
    renderOpenMenu(
      <DropdownMenuItem>
        Copy{" "}
        <DropdownMenuShortcut data-testid="shortcut">
          Ctrl+C
        </DropdownMenuShortcut>
      </DropdownMenuItem>,
    );

    const shortcut = screen.getByTestId("shortcut");
    expect(shortcut.textContent).toBe("Ctrl+C");
    expect(shortcut.className).toContain("ml-auto");
    expect(shortcut.className).toContain("text-xs");
  });

  it("Given: DropdownMenuShortcut with custom className When: rendering Then: should merge classes", () => {
    renderOpenMenu(
      <DropdownMenuItem>
        Paste{" "}
        <DropdownMenuShortcut className="extra-cls" data-testid="short-custom">
          Ctrl+V
        </DropdownMenuShortcut>
      </DropdownMenuItem>,
    );

    const shortcut = screen.getByTestId("short-custom");
    expect(shortcut.className).toContain("extra-cls");
    expect(shortcut.className).toContain("ml-auto");
  });

  // --- DropdownMenuCheckboxItem ---

  it("Given: DropdownMenuCheckboxItem checked When: rendering Then: should render check icon", () => {
    renderOpenMenu(
      <DropdownMenuCheckboxItem checked data-testid="checkbox-item">
        Show Toolbar
      </DropdownMenuCheckboxItem>,
    );

    const item = screen.getByTestId("checkbox-item");
    expect(item).toBeInTheDocument();
    expect(item.textContent).toContain("Show Toolbar");
  });

  it("Given: DropdownMenuCheckboxItem unchecked When: rendering Then: should render without check", () => {
    renderOpenMenu(
      <DropdownMenuCheckboxItem
        checked={false}
        data-testid="checkbox-unchecked"
      >
        Hidden
      </DropdownMenuCheckboxItem>,
    );

    const item = screen.getByTestId("checkbox-unchecked");
    expect(item).toBeInTheDocument();
  });

  // --- DropdownMenuGroup ---

  it("Given: DropdownMenuGroup When: rendering Then: should group items", () => {
    renderOpenMenu(
      <DropdownMenuGroup>
        <DropdownMenuItem data-testid="grouped-item">Grouped</DropdownMenuItem>
      </DropdownMenuGroup>,
    );

    expect(screen.getByTestId("grouped-item")).toBeInTheDocument();
  });

  // --- DropdownMenuContent className ---

  it("Given: DropdownMenuContent with custom className When: rendering Then: should merge classes", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger asChild>
          <button>Open</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="custom-content" data-testid="content">
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const content = screen.getByTestId("content");
    expect(content.className).toContain("custom-content");
  });

  // --- DropdownMenuSubTrigger ---

  it("Given: DropdownMenuSubTrigger without inset When: rendering Then: should NOT have pl-8", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger asChild>
          <button>Open</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub open>
            <DropdownMenuSubTrigger data-testid="sub-trigger">
              More
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Sub item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const subTrigger = screen.getByTestId("sub-trigger");
    expect(subTrigger).toBeInTheDocument();
    expect(subTrigger.className).not.toContain("pl-8");
  });

  it("Given: DropdownMenuSubTrigger with inset When: rendering Then: should have pl-8", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger asChild>
          <button>Open</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub open>
            <DropdownMenuSubTrigger inset data-testid="sub-trigger-inset">
              More
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Sub item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const subTrigger = screen.getByTestId("sub-trigger-inset");
    expect(subTrigger.className).toContain("pl-8");
  });

  // --- DropdownMenuSubContent ---

  it("Given: DropdownMenuSubContent with className When: rendering Then: should merge classes", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger asChild>
          <button>Open</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub open>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent
              className="sub-custom"
              data-testid="sub-content"
            >
              <DropdownMenuItem>Sub item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const subContent = screen.getByTestId("sub-content");
    expect(subContent.className).toContain("sub-custom");
  });

  // --- DropdownMenuRadioGroup + RadioItem ---

  it("Given: DropdownMenuRadioGroup with RadioItems When: rendering Then: should render radio items", () => {
    renderOpenMenu(
      <DropdownMenuRadioGroup value="light">
        <DropdownMenuRadioItem value="light" data-testid="radio-light">
          Light
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="dark" data-testid="radio-dark">
          Dark
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>,
    );

    expect(screen.getByTestId("radio-light")).toBeInTheDocument();
    expect(screen.getByTestId("radio-dark")).toBeInTheDocument();
  });

  it("Given: DropdownMenuRadioItem with custom className When: rendering Then: should merge classes", () => {
    renderOpenMenu(
      <DropdownMenuRadioGroup value="a">
        <DropdownMenuRadioItem
          value="a"
          className="radio-custom"
          data-testid="radio-custom"
        >
          A
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>,
    );

    const radioItem = screen.getByTestId("radio-custom");
    expect(radioItem.className).toContain("radio-custom");
  });
});
