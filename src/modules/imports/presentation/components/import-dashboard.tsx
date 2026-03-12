"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ImportTypeGrid } from "./import-type-grid";
import { ImportWizardDialog } from "./import-wizard-dialog";
import { ImportHistory } from "./import-history";
import { useDownloadTemplate } from "@/modules/imports/presentation/hooks/use-imports";
import type { ImportType } from "@/modules/imports/domain/entities";

export function ImportDashboard() {
  const t = useTranslations("imports");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ImportType | null>(null);
  const downloadTemplate = useDownloadTemplate();

  const handleImport = (type: ImportType) => {
    setSelectedType(type);
    setWizardOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          {t("title")}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          {t("description")}
        </p>
      </div>

      <ImportTypeGrid
        onImport={handleImport}
        onDownloadTemplate={(type, format) =>
          downloadTemplate.mutate({ type, format })
        }
        isDownloading={downloadTemplate.isPending}
      />

      <ImportWizardDialog
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        importType={selectedType}
      />

      <ImportHistory />
    </div>
  );
}
