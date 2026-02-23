"use client";

import { useState, useMemo } from "react";
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
import type { ReportColumn } from "../../application/dto/report.dto";
import { formatCellValue } from "../utils/report-utils";

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
}

function renderCell(value: unknown, col: ReportColumn, locale: string) {
  if (col.type === "boolean") {
    return (
      <Badge variant={value ? "success" : "secondary"}>
        {value ? "Yes" : "No"}
      </Badge>
    );
  }
  if (col.key === "severity") {
    const v = String(value ?? "");
    return (
      <Badge variant={v === "CRITICAL" ? "destructive" : "warning"}>{v}</Badge>
    );
  }
  if (col.key === "status") {
    const v = String(value ?? "");
    const variant =
      v === "CONFIRMED" || v === "FAST_MOVING"
        ? "success"
        : v === "CANCELLED" || v === "SLOW_MOVING"
          ? "destructive"
          : "secondary";
    return <Badge variant={variant}>{v}</Badge>;
  }
  if (col.key === "classification") {
    const v = String(value ?? "");
    const variant =
      v === "FAST_MOVING"
        ? "success"
        : v === "SLOW_MOVING"
          ? "destructive"
          : "warning";
    return <Badge variant={variant}>{v.replace(/_/g, " ")}</Badge>;
  }
  if (col.key === "type" && String(value ?? "").includes("_")) {
    return (
      <Badge variant="outline">{String(value ?? "").replace(/_/g, " ")}</Badge>
    );
  }
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
      {formatCellValue(value, col.type, locale)}
    </span>
  );
}

export function ReportTable({
  columns,
  rows,
  locale = "en-US",
}: ReportTableProps) {
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
        <p className="text-sm">No records found</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {columns.map((col) => (
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
                  col.sortable && "cursor-pointer select-none hover:bg-muted",
                )}
                style={{ width: col.width }}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <span className="flex items-center gap-0.5">
                  {col.header}
                  {col.sortable && (
                    <SortIcon
                      colKey={col.key}
                      sortKey={sortKey}
                      sortDir={sortDir}
                    />
                  )}
                </span>
              </TableHead>
            ))}
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
                  {renderCell(row[col.key], col, locale)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
