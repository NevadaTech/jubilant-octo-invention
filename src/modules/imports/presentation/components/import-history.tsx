"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/ui/components/card";
import { Skeleton } from "@/ui/components/skeleton";
import { ImportStatusBadge } from "./import-status-badge";
import { ImportDetailSheet } from "./import-detail";
import { useImports } from "@/modules/imports/presentation/hooks/use-imports";
import type { ImportFilters } from "@/modules/imports/application/dto/import.dto";

export function ImportHistory() {
  const t = useTranslations("imports");
  const [filters, setFilters] = useState<ImportFilters>({
    page: 1,
    limit: 10,
  });
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  const { data, isLoading } = useImports(filters);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, i) => `skeleton-${i}`).map(
              (key) => (
                <Skeleton key={key} className="h-12 w-full" />
              ),
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const batches = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 text-lg font-semibold">{t("history.title")}</h3>

          {batches.length === 0 ? (
            <p className="py-8 text-center text-neutral-500">
              {t("history.empty")}
            </p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-neutral-500">
                    <th className="pb-3 pr-4 font-medium">
                      {t("history.columns.type")}
                    </th>
                    <th className="pb-3 pr-4 font-medium">
                      {t("history.columns.fileName")}
                    </th>
                    <th className="pb-3 pr-4 font-medium">
                      {t("history.columns.status")}
                    </th>
                    <th className="pb-3 pr-4 font-medium">
                      {t("history.columns.rows")}
                    </th>
                    <th className="pb-3 font-medium">
                      {t("history.columns.date")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((batch) => (
                    <tr
                      key={batch.id}
                      onClick={() => setSelectedBatchId(batch.id)}
                      className="cursor-pointer border-b last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                    >
                      <td className="py-3 pr-4">
                        {t(`types.${batch.type.toLowerCase()}`)}
                      </td>
                      <td
                        className="max-w-[200px] truncate py-3 pr-4"
                        title={batch.fileName}
                      >
                        {batch.fileName}
                      </td>
                      <td className="py-3 pr-4">
                        <ImportStatusBadge status={batch.status} />
                      </td>
                      <td className="py-3 pr-4">
                        {batch.validRows}/{batch.totalRows}
                      </td>
                      <td className="py-3 text-neutral-500">
                        {new Date(batch.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-neutral-500">
                {pagination.page} / {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))
                  }
                  disabled={pagination.page <= 1}
                  className="rounded border px-3 py-1 text-sm disabled:opacity-50"
                >
                  &lt;
                </button>
                <button
                  onClick={() =>
                    setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))
                  }
                  disabled={pagination.page >= pagination.totalPages}
                  className="rounded border px-3 py-1 text-sm disabled:opacity-50"
                >
                  &gt;
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ImportDetailSheet
        batchId={selectedBatchId}
        onClose={() => setSelectedBatchId(null)}
      />
    </>
  );
}
