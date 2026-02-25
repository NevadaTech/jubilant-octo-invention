"use client";

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface SortableHeaderProps {
  label: string;
  field: string;
  currentSortBy?: string;
  currentSortOrder?: "asc" | "desc";
  onSort: (field: string, order: "asc" | "desc" | undefined) => void;
  className?: string;
}

export function SortableHeader({
  label,
  field,
  currentSortBy,
  currentSortOrder,
  onSort,
  className = "",
}: SortableHeaderProps) {
  const isActive = currentSortBy === field;

  const handleClick = () => {
    if (!isActive) {
      onSort(field, "asc");
    } else if (currentSortOrder === "asc") {
      onSort(field, "desc");
    } else {
      onSort(field, undefined);
    }
  };

  return (
    <th
      className={`pb-3 pr-4 cursor-pointer select-none hover:text-foreground transition-colors ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-1">
        {label}
        {isActive && currentSortOrder === "asc" ? (
          <ArrowUp className="h-3.5 w-3.5 text-foreground" />
        ) : isActive && currentSortOrder === "desc" ? (
          <ArrowDown className="h-3.5 w-3.5 text-foreground" />
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
        )}
      </div>
    </th>
  );
}
