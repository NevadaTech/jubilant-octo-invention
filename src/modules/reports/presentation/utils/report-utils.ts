import type { ReportTypeValue } from "@/modules/reports/application/dto/report.dto";
import { REPORT_CATEGORIES } from "@/modules/reports/application/dto/report.dto";

export function getCategoryForReportType(type: ReportTypeValue): string {
  for (const cat of REPORT_CATEGORIES) {
    if (cat.types.includes(type)) return cat.key;
  }
  return "inventory";
}

export const REPORT_SLUG_MAP: Record<string, ReportTypeValue> = {
  "available-inventory": "AVAILABLE_INVENTORY",
  "movement-history": "MOVEMENT_HISTORY",
  valuation: "VALUATION",
  "low-stock": "LOW_STOCK",
  movements: "MOVEMENTS",
  financial: "FINANCIAL",
  turnover: "TURNOVER",
  sales: "SALES",
  "sales-by-product": "SALES_BY_PRODUCT",
  "sales-by-warehouse": "SALES_BY_WAREHOUSE",
  returns: "RETURNS",
  "returns-by-type": "RETURNS_BY_TYPE",
  "returns-by-product": "RETURNS_BY_PRODUCT",
  "returns-customer": "RETURNS_CUSTOMER",
  "returns-supplier": "RETURNS_SUPPLIER",
  "abc-analysis": "ABC_ANALYSIS",
  "dead-stock": "DEAD_STOCK",
};

export function slugToReportType(slug: string): ReportTypeValue | null {
  return REPORT_SLUG_MAP[slug] ?? null;
}

export function reportTypeToSlug(type: ReportTypeValue): string {
  return type.toLowerCase().replace(/_/g, "-");
}

export function formatCellValue(
  value: unknown,
  type: string,
  locale = "en-US",
  currency?: string,
  boolLabels?: { yes: string; no: string },
): string {
  if (value === null || value === undefined || value === "") return "—";

  switch (type) {
    case "currency": {
      const num = Number(value);
      if (isNaN(num)) return String(value);
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency || "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num);
    }
    case "number": {
      const num = Number(value);
      if (isNaN(num)) return String(value);
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(num);
    }
    case "percentage": {
      const num = Number(value);
      if (isNaN(num)) return String(value);
      return `${new Intl.NumberFormat(locale, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 2,
      }).format(num)}%`;
    }
    case "date": {
      try {
        const date = new Date(String(value));
        if (isNaN(date.getTime())) return String(value);
        return new Intl.DateTimeFormat(locale, {
          year: "numeric",
          month: "short",
          day: "numeric",
        }).format(date);
      } catch {
        return String(value);
      }
    }
    case "boolean":
      return value ? (boolLabels?.yes ?? "Yes") : (boolLabels?.no ?? "No");
    default:
      return String(value);
  }
}

export function formatSummaryKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function sanitizeFilename(filename: string): string {
  // Remove path separators, special filesystem chars, and control characters
  const dangerousCharsPattern = /[/\\:*?"<>|]/g;
  let safe = filename.replace(dangerousCharsPattern, "_");
  // Strip control characters (U+0000 to U+001F)
  safe = safe.replace(
    /[\u0000-\u001f]/g, // eslint-disable-line no-control-regex
    "",
  );
  return safe.replace(/\.{2,}/g, ".").slice(0, 200);
}

export function downloadBlob(blob: Blob, filename: string) {
  const safeFilename = sanitizeFilename(filename);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
