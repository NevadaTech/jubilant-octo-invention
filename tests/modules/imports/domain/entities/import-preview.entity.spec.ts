import { describe, it, expect } from "vitest";
import { ImportPreview } from "@/modules/imports/domain/entities/import-preview.entity";

describe("ImportPreview", () => {
  it("should indicate canBeProcessed when no errors", () => {
    const preview = new ImportPreview(10, 10, 0, [], [], []);
    expect(preview.canBeProcessed).toBe(true);
  });

  it("should not be processable with structure errors", () => {
    const preview = new ImportPreview(
      10,
      10,
      0,
      [{ message: "Missing column" }],
      [],
      [],
    );
    expect(preview.canBeProcessed).toBe(false);
  });

  it("should not be processable with invalid rows", () => {
    const preview = new ImportPreview(10, 8, 2, [], [], []);
    expect(preview.canBeProcessed).toBe(false);
  });

  it("should detect warnings", () => {
    const preview = new ImportPreview(10, 10, 0, [], [], ["Unknown column"]);
    expect(preview.hasWarnings).toBe(true);
  });

  it("should return false for hasWarnings when none", () => {
    const preview = new ImportPreview(10, 10, 0, [], [], []);
    expect(preview.hasWarnings).toBe(false);
  });
});
