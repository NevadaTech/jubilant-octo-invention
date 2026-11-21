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
  "sales-by-client": "SALES_BY_CLIENT",
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

const MONEY_KEYS = [
  "totalValue",
  "stockValue",
  "totalRevenue",
  "revenue",
  "totalAmount",
  "totalCost",
  "grossMargin",
  "totalValueReturned",
] as const;

const QUANTITY_KEYS = [
  "quantity",
  "totalQuantitySold",
  "totalItems",
  "totalQuantityReturned",
] as const;

const ITEM_LABELS = [
  "productName",
  "name",
  "sku",
  "warehouseName",
  "customerName",
  "type",
] as const;

export interface ReportChartPoint {
  label: string;
  value: number;
  share: number;
  isOther?: boolean;
}

export interface ReportChartModel {
  kind: "money" | "quantity";
  points: ReportChartPoint[];
  brandPoints: ReportChartPoint[] | null;
}

function numericValue(value: unknown): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function firstPresentKey(
  rows: Record<string, unknown>[],
  keys: readonly string[],
): string | null {
  return keys.find((key) => rows.some((row) => numericValue(row[key]) !== 0)) ?? null;
}

function toPoints(totals: Map<string, number>): ReportChartPoint[] {
  const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  const total = sorted.reduce((sum, [, value]) => sum + value, 0);
  if (total <= 0) return [];

  return sorted.map(([label, value]) => ({
    label,
    value,
    share: (value / total) * 100,
  }));
}

function aggregate(
  rows: Record<string, unknown>[],
  labelKey: string,
  valueKey: string,
): Map<string, number> {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const rawLabel = row[labelKey];
    const label = typeof rawLabel === "string" ? rawLabel.trim() : "";
    if (!label) continue;
    totals.set(label, (totals.get(label) ?? 0) + numericValue(row[valueKey]));
  }
  return totals;
}

/** Groups report rows into bars with a share of the filtered total. */
export function buildReportChart(
  rows: Record<string, unknown>[],
): ReportChartModel | null {
  if (rows.length === 0) return null;

  const moneyKey = firstPresentKey(rows, MONEY_KEYS);
  const quantityKey = firstPresentKey(rows, QUANTITY_KEYS);
  const valueKey = moneyKey ?? quantityKey;
  if (!valueKey) return null;

  const labelKey = ITEM_LABELS.find((key) =>
    rows.some((row) => typeof row[key] === "string" && String(row[key]).trim()),
  );
  if (!labelKey) return null;

  const points = toPoints(aggregate(rows, labelKey, valueKey));
  if (points.length === 0) return null;

  const brandPoints = moneyKey
    ? toPoints(aggregate(rows, "brandName", moneyKey))
    : [];

  return {
    kind: moneyKey ? "money" : "quantity",
    points,
    brandPoints: brandPoints.length > 1 ? brandPoints : null,
  };
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
