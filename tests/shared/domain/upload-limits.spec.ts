import { describe, it, expect } from "vitest";
import { MAX_UPLOAD_BYTES } from "@/shared/domain/upload-limits";
import en from "@/lib/messages/en.json";
import es from "@/lib/messages/es.json";

describe("upload limits", () => {
  it("Given: the Vercel function body cap When: reading MAX_UPLOAD_BYTES Then: it is 4 MB", () => {
    expect(MAX_UPLOAD_BYTES).toBe(4 * 1024 * 1024);
  });

  it("Given: the English messages When: reading size errors Then: they state the 4 MB limit", () => {
    expect(en.inventory.products.photo.tooLarge).toBe(
      "The photo cannot be larger than 4 MB.",
    );
    expect(en.imports.upload.maxSize).toBe("Maximum file size: 4MB");
    expect(en.imports.errors.fileTooLarge).toBe("File size exceeds 4MB limit");
  });

  it("Given: the Spanish messages When: reading size errors Then: they state the 4 MB limit", () => {
    expect(es.inventory.products.photo.tooLarge).toBe(
      "La foto no puede pasar de 4 MB.",
    );
    expect(es.imports.upload.maxSize).toBe("Tamano maximo de archivo: 4MB");
    expect(es.imports.errors.fileTooLarge).toBe(
      "El archivo excede el limite de 4MB",
    );
  });
});
