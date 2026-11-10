"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/ui/layout/page-header";
import {
  useDownloadTemplate,
  useImportTypes,
} from "@/modules/imports/presentation/hooks/use-imports";
import type { ImportTypeSchema } from "@/modules/imports/domain/entities";
import { GettingStartedGuide } from "./getting-started-guide";
import { ImportTypeGrid } from "./import-type-grid";
import { ImportWizardDialog } from "./import-wizard-dialog";
import { ImportHistory } from "./import-history";

export function ImportDashboard() {
  const t = useTranslations("imports");
  const tCatalog = useTranslations("imports.catalog");

  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedSchema, setSelectedSchema] =
    useState<ImportTypeSchema | null>(null);

  const typesQuery = useImportTypes();
  const downloadTemplate = useDownloadTemplate();

  const availableTypes = useMemo(
    () => new Set(typesQuery.data?.map((s) => s.type) ?? []),
    [typesQuery.data],
  );

  const handleStartImport = (type: string) => {
    const schema = typesQuery.data?.find((s) => s.type === type);
    if (!schema) return;
    setSelectedSchema(schema);
    setWizardOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />

      {/* Getting started — always visible, steps self-adapt to the
          current backend registry */}
      <GettingStartedGuide
        availableTypes={availableTypes}
        onStartImport={handleStartImport}
      />

      {/* Catalog */}
      <section aria-labelledby="imports-catalog-heading">
        <div className="mb-4 flex flex-col gap-1">
          <h2
            id="imports-catalog-heading"
            className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-50"
          >
            {tCatalog("title")}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {tCatalog("description")}
          </p>
        </div>

        <ImportTypeGrid
          schemas={typesQuery.data}
          isLoading={typesQuery.isLoading}
          isError={typesQuery.isError}
          onImport={handleStartImport}
          onDownloadTemplate={(type, format) =>
            downloadTemplate.mutate({ type, format })
          }
          isDownloading={downloadTemplate.isPending}
        />
      </section>

      {/* Wizard */}
      <ImportWizardDialog
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        schema={selectedSchema}
      />

      {/* History */}
      <ImportHistory />
    </div>
  );
}
