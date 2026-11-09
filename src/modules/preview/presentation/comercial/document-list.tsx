"use client";

import { useState } from "react";
import { Button, Card } from "@/ui/components";
import { PageHeader, PreviewSku, StatusChip } from "@/modules/preview";
import { showingLabel, type PreviewDocument } from "./data";
import { LabeledSearch, LabeledSelect } from "./fields";
import { previewSalePath } from "./routes";
import { PreviewTextLink } from "./text-link";

interface DocumentListProps {
  title: string;
  rows: readonly PreviewDocument[];
  catalogTotal: number;
  actionLabel: string;
  draftTitle: string;
  draftNote: string;
  searchId: string;
  statusId: string;
  draftId: string;
  emptyLabel: string;
  statusOptions: readonly string[];
  linkToSale?: boolean;
}

export function DocumentList({
  title,
  rows,
  catalogTotal,
  actionLabel,
  draftTitle,
  draftNote,
  searchId,
  statusId,
  draftId,
  emptyLabel,
  statusOptions,
  linkToSale = false,
}: DocumentListProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [draftOpen, setDraftOpen] = useState(false);
  const normalized = query.trim().toLowerCase();
  const filtered = rows.filter((row) => {
    const matchesQuery =
      normalized.length === 0 ||
      row.number.toLowerCase().includes(normalized) ||
      row.contact.toLowerCase().includes(normalized);
    const matchesStatus = status.length === 0 || row.statusLabel === status;
    return matchesQuery && matchesStatus;
  });
  const isFiltered = normalized.length > 0 || status.length > 0;
  const columnCount = linkToSale ? 5 : 4;

  return (
    <div className="space-y-4" data-slot="preview-document-list">
      <PageHeader
        title={title}
        action={
          <Button
            type="button"
            aria-expanded={draftOpen}
            aria-controls={draftId}
            onClick={() => setDraftOpen(true)}
          >
            {actionLabel}
          </Button>
        }
      />

      <div className="flex flex-wrap items-end gap-4">
        <LabeledSearch
          id={searchId}
          label="Buscar"
          value={query}
          onChange={setQuery}
          placeholder="Número o contacto"
        />
        <LabeledSelect
          id={statusId}
          label="Estado"
          value={status}
          onChange={setStatus}
        >
          <option value="">Todos</option>
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </LabeledSelect>
      </div>

      <Card className="shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label={title}>
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold text-muted-foreground">
                <th className="px-4 py-3 font-semibold" scope="col">
                  Número
                </th>
                <th className="px-4 py-3 font-semibold" scope="col">
                  Contacto
                </th>
                <th className="px-4 py-3 font-semibold" scope="col">
                  Estado
                </th>
                <th className="px-4 py-3 text-right font-semibold" scope="col">
                  Total
                </th>
                {linkToSale ? (
                  <th
                    className="px-4 py-3 text-right font-semibold"
                    scope="col"
                  >
                    Acciones
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={row.number}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <PreviewSku>{row.number}</PreviewSku>
                  </td>
                  <td className="px-4 py-3 text-foreground">{row.contact}</td>
                  <td className="px-4 py-3">
                    <StatusChip tone={row.statusTone}>
                      {row.statusLabel}
                    </StatusChip>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap text-foreground">
                    {row.total}
                  </td>
                  {linkToSale ? (
                    <td className="px-4 py-3 text-right">
                      <PreviewTextLink href={previewSalePath(row.number)}>
                        Ver
                      </PreviewTextLink>
                    </td>
                  ) : null}
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={columnCount}
                    className="px-4 py-6 text-muted-foreground"
                  >
                    {emptyLabel}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <p className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
          {showingLabel(filtered.length, isFiltered, rows.length, catalogTotal)}
        </p>
      </Card>

      {draftOpen ? (
        <Card id={draftId} className="shadow-none">
          <div className="space-y-3 p-6">
            <h2 className="text-sm font-semibold text-foreground">
              {draftTitle}
            </h2>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">
                Estado
              </p>
              <StatusChip tone="borrador">Borrador</StatusChip>
            </div>
            <p className="text-sm text-muted-foreground">{draftNote}</p>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
