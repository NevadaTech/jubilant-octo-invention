import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductReferencePhoto } from "@/modules/inventory/presentation/components/products/product-reference-photo";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/modules/authentication/presentation/hooks/use-permissions", () => ({
  usePermissions: () => ({ hasPermission: () => true }),
}));

const mockUploadMutate = vi.fn();

vi.mock("@/modules/inventory/presentation/hooks/use-products", () => ({
  useProductImage: () => ({ data: undefined, isError: false }),
  useUploadProductImage: () => ({ mutate: mockUploadMutate, isPending: false }),
  useDeleteProductImage: () => ({ mutate: vi.fn(), isPending: false }),
}));

const FOUR_MB = 4 * 1024 * 1024;

function pickFile(file: File) {
  const input = document.querySelector(
    'input[type="file"]',
  ) as HTMLInputElement;
  fireEvent.change(input, { target: { files: [file] } });
}

function sizedImage(size: number, name = "photo.png"): File {
  return new File([new Uint8Array(size)], name, { type: "image/png" });
}

describe("ProductReferencePhoto upload size limit", () => {
  beforeEach(() => {
    mockUploadMutate.mockReset();
  });

  it("Given: an image of 4 MB + 1 byte When: choosing it Then: shows tooLarge and does not upload", () => {
    render(
      <ProductReferencePhoto
        productId="p-1"
        productName="Widget"
        imageUrl={null}
      />,
    );

    pickFile(sizedImage(FOUR_MB + 1));

    expect(screen.getByRole("alert").textContent).toBe("tooLarge");
    expect(mockUploadMutate).not.toHaveBeenCalled();
  });

  it("Given: an image of exactly 4 MB When: choosing it Then: uploads it without error", () => {
    render(
      <ProductReferencePhoto
        productId="p-1"
        productName="Widget"
        imageUrl={null}
      />,
    );

    const file = sizedImage(FOUR_MB);
    pickFile(file);

    expect(screen.queryByRole("alert")).toBeNull();
    expect(mockUploadMutate).toHaveBeenCalledTimes(1);
    expect(mockUploadMutate.mock.calls[0][0]).toEqual({
      productId: "p-1",
      file,
    });
  });

  it("Given: a small valid image When: choosing it Then: uploads it without error", () => {
    render(
      <ProductReferencePhoto
        productId="p-1"
        productName="Widget"
        imageUrl={null}
      />,
    );

    const file = new File(["png"], "small.png", { type: "image/png" });
    pickFile(file);

    expect(screen.queryByRole("alert")).toBeNull();
    expect(mockUploadMutate).toHaveBeenCalledTimes(1);
    expect(mockUploadMutate.mock.calls[0][0]).toEqual({
      productId: "p-1",
      file,
    });
  });
});
