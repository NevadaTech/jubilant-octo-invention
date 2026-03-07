"use client";

import type { ImportType } from "../../domain/entities";
import type { TemplateFormat } from "../../application/dto/import.dto";
import { ImportTypeCard } from "./import-type-card";

const IMPORT_TYPES: ImportType[] = [
  "PRODUCTS",
  "MOVEMENTS",
  "WAREHOUSES",
  "STOCK",
  "TRANSFERS",
];

interface ImportTypeGridProps {
  onImport: (type: ImportType) => void;
  onDownloadTemplate: (type: ImportType, format: TemplateFormat) => void;
  isDownloading?: boolean;
}

export function ImportTypeGrid({
  onImport,
  onDownloadTemplate,
  isDownloading,
}: ImportTypeGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {IMPORT_TYPES.map((type) => (
        <ImportTypeCard
          key={type}
          type={type}
          onImport={onImport}
          onDownloadTemplate={onDownloadTemplate}
          isDownloading={isDownloading}
        />
      ))}
    </div>
  );
}
