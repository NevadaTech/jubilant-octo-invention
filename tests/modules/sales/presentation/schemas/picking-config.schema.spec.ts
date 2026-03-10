import { describe, it, expect } from "vitest";
import { pickingConfigSchema } from "@/modules/sales/presentation/schemas/picking-config.schema";

describe("Picking Config Schema", () => {
  it("Given: mode OFF When: validating Then: should pass", () => {
    const result = pickingConfigSchema.safeParse({ mode: "OFF" });
    expect(result.success).toBe(true);
  });

  it("Given: mode OPTIONAL When: validating Then: should pass", () => {
    const result = pickingConfigSchema.safeParse({ mode: "OPTIONAL" });
    expect(result.success).toBe(true);
  });

  it("Given: mode REQUIRED_FULL When: validating Then: should pass", () => {
    const result = pickingConfigSchema.safeParse({ mode: "REQUIRED_FULL" });
    expect(result.success).toBe(true);
  });

  it("Given: mode REQUIRED_PARTIAL When: validating Then: should pass", () => {
    const result = pickingConfigSchema.safeParse({ mode: "REQUIRED_PARTIAL" });
    expect(result.success).toBe(true);
  });

  it("Given: invalid mode string When: validating Then: should fail", () => {
    const result = pickingConfigSchema.safeParse({ mode: "INVALID" });
    expect(result.success).toBe(false);
  });

  it("Given: empty mode When: validating Then: should fail", () => {
    const result = pickingConfigSchema.safeParse({ mode: "" });
    expect(result.success).toBe(false);
  });

  it("Given: missing mode field When: validating Then: should fail", () => {
    const result = pickingConfigSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("Given: mode as number When: validating Then: should fail", () => {
    const result = pickingConfigSchema.safeParse({ mode: 1 });
    expect(result.success).toBe(false);
  });

  it("Given: mode as lowercase off When: validating Then: should fail", () => {
    const result = pickingConfigSchema.safeParse({ mode: "off" });
    expect(result.success).toBe(false);
  });

  it("Given: null mode When: validating Then: should fail", () => {
    const result = pickingConfigSchema.safeParse({ mode: null });
    expect(result.success).toBe(false);
  });

  it("Given: valid mode with extra fields When: validating Then: should pass (extra fields stripped)", () => {
    const result = pickingConfigSchema.safeParse({
      mode: "OFF",
      extraField: "ignored",
    });
    expect(result.success).toBe(true);
  });
});
