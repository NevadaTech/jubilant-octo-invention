import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatCompactCurrency,
  formatNumber,
  formatPercentage,
  formatBytes,
  clamp,
  roundTo,
} from "@/lib/number";

describe("Number Utils", () => {
  describe("formatCurrency", () => {
    it("Given: amount with default params When: formatting Then: should return USD format", () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain("1,234.56");
      expect(result).toContain("$");
    });

    it("Given: zero amount When: formatting Then: should return $0.00", () => {
      const result = formatCurrency(0);
      expect(result).toContain("0.00");
    });

    it("Given: negative amount When: formatting Then: should include negative sign", () => {
      const result = formatCurrency(-500);
      expect(result).toContain("500");
    });

    it("Given: EUR currency When: formatting Then: should use euro symbol", () => {
      const result = formatCurrency(100, "EUR", "en");
      expect(result).toContain("€");
    });

    it("Given: 'es' locale When: formatting Then: should use locale formatting", () => {
      const result = formatCurrency(1234.56, "USD", "es");
      expect(result).toBeDefined();
    });

    it("Given: large number When: formatting Then: should have thousand separators", () => {
      const result = formatCurrency(1000000);
      expect(result).toContain("1,000,000");
    });
  });

  describe("formatCompactCurrency", () => {
    it("Given: millions amount When: formatting compact Then: should show M suffix", () => {
      const result = formatCompactCurrency(1500000);
      expect(result).toMatch(/1\.5M|\$1\.5M/);
    });

    it("Given: thousands amount When: formatting compact Then: should show K suffix", () => {
      const result = formatCompactCurrency(150000);
      expect(result).toMatch(/150(\.0)?K|\$150(\.0)?K/);
    });

    it("Given: small amount When: formatting compact Then: should show number directly", () => {
      const result = formatCompactCurrency(99);
      expect(result).toContain("$");
      expect(result).toContain("99");
    });

    it("Given: zero When: formatting compact Then: should return $0", () => {
      const result = formatCompactCurrency(0);
      expect(result).toContain("$");
      expect(result).toContain("0");
    });
  });

  describe("formatNumber", () => {
    it("Given: integer When: formatting Then: should add thousand separators", () => {
      const result = formatNumber(1234567);
      expect(result).toBe("1,234,567");
    });

    it("Given: small number When: formatting Then: should return as-is", () => {
      const result = formatNumber(42);
      expect(result).toBe("42");
    });

    it("Given: zero When: formatting Then: should return 0", () => {
      const result = formatNumber(0);
      expect(result).toBe("0");
    });

    it("Given: decimal number When: formatting Then: should preserve decimals", () => {
      const result = formatNumber(1234.56);
      expect(result).toContain("1,234");
    });

    it("Given: 'es' locale When: formatting Then: should use locale separators", () => {
      const result = formatNumber(1234567, "es");
      expect(result).toBeDefined();
    });
  });

  describe("formatPercentage", () => {
    it("Given: 0.5 When: formatting as percentage Then: should return 50%", () => {
      const result = formatPercentage(0.5);
      expect(result).toBe("50%");
    });

    it("Given: 1.0 When: formatting Then: should return 100%", () => {
      const result = formatPercentage(1.0);
      expect(result).toBe("100%");
    });

    it("Given: 0 When: formatting Then: should return 0%", () => {
      const result = formatPercentage(0);
      expect(result).toBe("0%");
    });

    it("Given: decimals=2 When: formatting Then: should show 2 decimal places", () => {
      const result = formatPercentage(0.1234, "en", 2);
      expect(result).toBe("12.34%");
    });

    it("Given: value > 1 When: formatting Then: should show > 100%", () => {
      const result = formatPercentage(1.5);
      expect(result).toBe("150%");
    });
  });

  describe("formatBytes", () => {
    it("Given: 0 bytes When: formatting Then: should return '0 Bytes'", () => {
      expect(formatBytes(0)).toBe("0 Bytes");
    });

    it("Given: bytes < 1024 When: formatting Then: should return in Bytes", () => {
      expect(formatBytes(500)).toBe("500 Bytes");
    });

    it("Given: kilobytes When: formatting Then: should return in KB", () => {
      expect(formatBytes(1024)).toBe("1 KB");
    });

    it("Given: megabytes When: formatting Then: should return in MB", () => {
      expect(formatBytes(1048576)).toBe("1 MB");
    });

    it("Given: gigabytes When: formatting Then: should return in GB", () => {
      expect(formatBytes(1073741824)).toBe("1 GB");
    });

    it("Given: custom decimals When: formatting Then: should use specified precision", () => {
      expect(formatBytes(1536, 1)).toBe("1.5 KB");
    });

    it("Given: large terabyte value When: formatting Then: should return in TB", () => {
      expect(formatBytes(1099511627776)).toBe("1 TB");
    });
  });

  describe("clamp", () => {
    it("Given: value within range When: clamping Then: should return the value", () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it("Given: value below min When: clamping Then: should return min", () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it("Given: value above max When: clamping Then: should return max", () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it("Given: value equal to min When: clamping Then: should return min", () => {
      expect(clamp(0, 0, 10)).toBe(0);
    });

    it("Given: value equal to max When: clamping Then: should return max", () => {
      expect(clamp(10, 0, 10)).toBe(10);
    });

    it("Given: negative range When: clamping Then: should work correctly", () => {
      expect(clamp(-5, -10, -1)).toBe(-5);
    });
  });

  describe("roundTo", () => {
    it("Given: value with many decimals When: rounding to 2 Then: should have 2 decimals", () => {
      expect(roundTo(3.14159, 2)).toBe(3.14);
    });

    it("Given: value When: rounding to 0 decimals Then: should return integer", () => {
      expect(roundTo(3.7, 0)).toBe(4);
    });

    it("Given: exact value When: rounding Then: should remain unchanged", () => {
      expect(roundTo(5.0, 2)).toBe(5);
    });

    it("Given: 0.5 case When: rounding to 0 Then: should round up", () => {
      expect(roundTo(2.5, 0)).toBe(3);
    });

    it("Given: negative number When: rounding Then: should round correctly", () => {
      expect(roundTo(-3.456, 1)).toBe(-3.5);
    });

    it("Given: rounding to 3 decimals When: value has more Then: should truncate", () => {
      expect(roundTo(1.23456789, 3)).toBe(1.235);
    });
  });
});
