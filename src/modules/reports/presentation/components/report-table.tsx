"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/components/table";
import { Badge } from "@/ui/components/badge";
import { cn } from "@/ui/lib/utils";
import type { ReportColumn } from "@/modules/reports/application/dto/report.dto";
import { formatCellValue } from "@/modules/reports/presentation/utils/report-utils";

type SortDir = "asc" | "desc" | null;

function SortIcon({
  colKey,
  sortKey,
  sortDir,
}: {
  colKey: string;
  sortKey: string | null;
  sortDir: SortDir;
}) {
  if (sortKey !== colKey)
    return <ChevronsUpDown className="ml-1 h-3 w-3 opacity-40" />;
  if (sortDir === "asc") return <ChevronUp className="ml-1 h-3 w-3" />;
  return <ChevronDown className="ml-1 h-3 w-3" />;
}

interface ReportTableProps {
  columns: ReportColumn[];
  rows: Record<string, unknown>[];
  locale?: string;
  currency?: string;
  mobileCards?: boolean;
}

interface CellLabels {
  boolYes: string;
  boolNo: string;
  badge: (key: string) => string;
}

function renderCell(
  value: unknown,
  col: ReportColumn,
  locale: string,
  currency?: string,
  labels?: CellLabels,
) {
  if (col.type === "boolean") {
    return (
      <Badge variant={value ? "success" : "secondary"}>
        {value ? (labels?.boolYes ?? "Yes") : (labels?.boolNo ?? "No")}
      </Badge>
    );
  }
  const labelFor = (v: string) => labels?.badge(v) ?? v.replace(/_/g, " ");

  if (col.key === "severity") {
    const v = String(value ?? "");
    return (
      <Badge variant={v === "CRITICAL" ? "destructive" : "warning"}>
        {labelFor(v)}
      </Badge>
    );
  }
  if (col.key === "status") {
    const v = String(value ?? "");
    const STATUS_VARIANTS: Record<
      string,
      "success" | "warning" | "info" | "destructive" | "secondary"
    > = {
      CONFIRMED: "success",
      COMPLETED: "success",
      POSTED: "success",
      RECEIVED: "success",
      ACTIVE: "success",
      PICKING: "warning",
      RETURNED: "warning",
      PARTIAL: "warning",
      PENDING: "warning",
      SHIPPED: "info",
      IN_TRANSIT: "info",
      CANCELLED: "destructive",
      CANCELED: "destructive",
      REJECTED: "destructive",
      VOID: "destructive",
      LOCKED: "destructive",
      DRAFT: "secondary",
      INACTIVE: "secondary",
      FAST_MOVING: "success",
      SLOW_MOVING: "destructive",
    };
    const variant = STATUS_VARIANTS[v] ?? "secondary";
    return <Badge variant={variant}>{labelFor(v)}</Badge>;
  }
  if (col.key === "classification") {
    const v = String(value ?? "");
    const variant =
      v === "FAST_MOVING"
        ? "success"
        : v === "SLOW_MOVING"
          ? "destructive"
          : "warning";
    return <Badge variant={variant}>{labelFor(v)}</Badge>;
  }
  if (col.key === "abcClassification") {
    const v = String(value ?? "");
    const variant =
      v === "A" ? "success" : v === "B" ? "warning" : "destructive";
    return <Badge variant={variant}>{labelFor(v)}</Badge>;
  }
  if (col.key === "riskLevel") {
    const v = String(value ?? "");
    const variant =
      v === "HIGH" ? "destructive" : v === "MEDIUM" ? "warning" : "success";
    return <Badge variant={variant}>{labelFor(v)}</Badge>;
  }
  if (col.key === "type" && String(value ?? "").includes("_")) {
    const v = String(value ?? "");
    return <Badge variant="outline">{labelFor(v)}</Badge>;
  }
  const boolLabels = labels
    ? { yes: labels.boolYes, no: labels.boolNo }
    : undefined;
  return (
    <span
      className={cn(
        col.type === "currency" ||
          col.type === "number" ||
          col.type === "percentage"
          ? "font-mono"
          : "",
      )}
    >
      {formatCellValue(value, col.type, locale, currency, boolLabels)}
    </span>
  );
}

function columnHaystack(col: ReportColumn) {
  return `${col.key} ${col.header}`.toLowerCase();
}

function pickColumn(
  columns: ReportColumn[],
  pattern: RegExp,
  fallback?: ReportColumn,
) {
  return columns.find((col) => pattern.test(columnHaystack(col))) ?? fallback;
}

export function ReportTable({
  columns,
  rows,
  locale = "en-US",
  currency,
  mobileCards = false,
}: ReportTableProps) {
  const t = useTranslations("reports");
  const cellLabels: CellLabels = {
    boolYes: t("boolean.yes"),
    boolNo: t("boolean.no"),
    badge: (key: string) => {
      const i18nKey = `badgeLabels.${key}`;
      return t.has(i18nKey) ? t(i18nKey) : key.replace(/_/g, " ");
    },
  };
  const translateHeader = (header: string): string => {
    const i18nKey = `columnHeaders.${header}`;
    return t.has(i18nKey) ? t(i18nKey) : header;
  };
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === "asc") {
        setSortDir("desc");
      } else if (sortDir === "desc") {
        setSortKey(null);
        setSortDir(null);
      } else {
        setSortDir("asc");
      }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedRows = useMemo(() => {
    if (!sortKey || !sortDir) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sortKey] as string | number | null | undefined;
      const bv = b[sortKey] as string | number | null | undefined;
      if (av === bv) return 0;
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      const cmp = av < bv ? -1 : 1;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rows, sortKey, sortDir]);

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p className="text-sm">{t("noRecordsFound")}</p>
      </div>
    );
  }

  const textColumns = columns.filter(
    (col) => col.type === "string" || col.type === "date",
  );
  const titleColumn = pickColumn(
    columns,
    /product|name|sku/,
    textColumns[0],
  );
  const subtitleColumn = pickColumn(
    columns,
    /warehouse|almac/,
    textColumns.find((col) => col.key !== titleColumn?.key),
  );
  const quantityColumn = pickColumn(columns, /quantity|qty|cantidad/);
  const valueColumn =
    columns.find((col) => col.type === "currency") ??
    columns.find(
      (col) => col.type === "number" && col.key !== quantityColumn?.key,
    );

  return (
    <div className="space-y-3">
      {mobileCards ? (
        <div className="space-y-3 md:hidden">
          {sortedRows.map((row, index) => {
            const title = titleColumn
              ? formatCellValue(row[titleColumn.key], titleColumn.type, locale, currency)
              : "";
            const subtitle = subtitleColumn
              ? formatCellValue(
                  row[subtitleColumn.key],
                  subtitleColumn.type,
                  locale,
                  currency,
                )
              : "";
            const quantity = quantityColumn
              ? formatCellValue(
                  row[quantityColumn.key],
                  quantityColumn.type,
                  locale,
                  currency,
                )
              : "";
            const value = valueColumn
              ? formatCellValue(
                  row[valueColumn.key],
                  valueColumn.type,
                  locale,
                  currency,
                )
              : "";
            const visible = (text: string) =>
              text && text !== "—" ? text : "";
            const amount = [visible(quantity), visible(value)]
              .filter(Boolean)
              .join(" · ");

            return (
              <div
                // eslint-disable-next-line @eslint-react/no-array-index-key
                key={index}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-foreground">
                    {title}
                  </p>
                  {subtitle ? (
                    <p className="truncate text-[13px] text-muted-foreground">
                      {subtitle}
                    </p>
                  ) : null}
                </div>
                {amount ? (
                  <p className="shrink-0 text-sm font-semibold text-foreground">
                    {amount}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      <div
        className={cn(
          "relative overflow-x-auto rounded-xl border border-border",
          mobileCards && "hidden md:block",
        )}
      >
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {columns.map((col) => {
              const isSortable = col.sortable !== false;
              return (
                <TableHead
                  key={col.key}
                  className={cn(
                    "whitespace-nowrap text-xs font-semibold uppercase tracking-wide",
                    col.align === "right" ||
                      col.type === "currency" ||
                      col.type === "number"
                      ? "text-right"
                      : col.align === "center"
                        ? "text-center"
                        : "text-left",
                    isSortable && "cursor-pointer select-none hover:bg-muted",
                  )}
                  style={{ width: col.width }}
                  onClick={() => isSortable && handleSort(col.key)}
                >
                  <span className="flex items-center gap-0.5">
                    {translateHeader(col.header)}
                    {isSortable && (
                      <SortIcon
                        colKey={col.key}
                        sortKey={sortKey}
                        sortDir={sortDir}
                      />
                    )}
                  </span>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRows.map((row, i) => (
            // eslint-disable-next-line @eslint-react/no-array-index-key
            <TableRow key={i} className="hover:bg-muted/30">
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  className={cn(
                    "py-2 text-sm",
                    col.align === "right" ||
                      col.type === "currency" ||
                      col.type === "number"
                      ? "text-right"
                      : col.align === "center"
                        ? "text-center"
                        : "",
                  )}
                >
                  {renderCell(row[col.key], col, locale, currency, cellLabels)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
