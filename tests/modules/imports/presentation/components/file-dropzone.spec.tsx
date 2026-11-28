import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FileDropzone } from "@/modules/imports/presentation/components/file-dropzone";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, _values?: Record<string, unknown>) =>
    key,
}));

describe("FileDropzone", () => {
  it("renders dropzone with drag-drop instructions", () => {
    render(<FileDropzone onFileSelect={vi.fn()} />);
    expect(screen.getByText("dragDrop")).toBeDefined();
  });

  it("accepts a valid file via input", () => {
    const onSelect = vi.fn();
    render(<FileDropzone onFileSelect={onSelect} />);

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["content"], "test.csv", { type: "text/csv" });

    fireEvent.change(input, { target: { files: [file] } });

    expect(onSelect).toHaveBeenCalledWith(file);
  });

  it("shows selected file info after selection", () => {
    render(<FileDropzone onFileSelect={vi.fn()} />);

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["content"], "products.csv", { type: "text/csv" });

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText("products.csv")).toBeDefined();
  });

  it("rejects a file of 4MB + 1 byte with the maxSize error", () => {
    const onSelect = vi.fn();
    render(<FileDropzone onFileSelect={onSelect} />);

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File([new Uint8Array(4 * 1024 * 1024 + 1)], "big.csv", {
      type: "text/csv",
    });

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByRole("alert").textContent).toBe("maxSize");
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("accepts a file of exactly 4MB", () => {
    const onSelect = vi.fn();
    render(<FileDropzone onFileSelect={onSelect} />);

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File([new Uint8Array(4 * 1024 * 1024)], "limit.csv", {
      type: "text/csv",
    });

    fireEvent.change(input, { target: { files: [file] } });

    expect(onSelect).toHaveBeenCalledWith(file);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows the supports hint text", () => {
    render(<FileDropzone onFileSelect={vi.fn()} />);
    // The dropzone uses imports.wizardFlow.supports now.
    expect(screen.getByText("supports")).toBeDefined();
  });
});
