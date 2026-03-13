"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/ui/components/button";
import { Card, CardContent } from "@/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/components/dropdown-menu";
import {
  Package,
  ArrowRightLeft,
  Warehouse,
  BarChart3,
  Repeat,
  Download,
  Upload,
} from "lucide-react";
import type { ImportType } from "@/modules/imports/domain/entities";
import type { TemplateFormat } from "@/modules/imports/application/dto/import.dto";

const typeIconMap: Record<ImportType, React.ElementType> = {
  PRODUCTS: Package,
  MOVEMENTS: ArrowRightLeft,
  WAREHOUSES: Warehouse,
  STOCK: BarChart3,
  TRANSFERS: Repeat,
};

interface ImportTypeCardProps {
  type: ImportType;
  onImport: (type: ImportType) => void;
  onDownloadTemplate: (type: ImportType, format: TemplateFormat) => void;
  isDownloading?: boolean;
}

export function ImportTypeCard({
  type,
  onImport,
  onDownloadTemplate,
  isDownloading,
}: ImportTypeCardProps) {
  const t = useTranslations("imports");
  const Icon = typeIconMap[type];

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary-50 p-2 dark:bg-primary-950">
            <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {t(`types.${type.toLowerCase()}`)}
            </h3>
            <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
              {t(`typeDescriptions.${type.toLowerCase()}`)}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isDownloading}
                className="flex-1 p-1.5"
              >
                <Download className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                <span className="truncate text-xs">{t("template.title")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onDownloadTemplate(type, "csv")}>
                {t("template.csv")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDownloadTemplate(type, "xlsx")}
              >
                {t("template.xlsx")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="sm"
            onClick={() => onImport(type)}
            className="flex-1 p-1.5"
          >
            <Upload className="mr-1.5 h-3.5 w-3.5 shrink-0" />
            <span className="text-xs">{t("startImport")}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
