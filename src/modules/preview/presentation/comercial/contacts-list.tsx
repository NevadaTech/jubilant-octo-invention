"use client";

import { useState } from "react";
import { Button, Card } from "@/ui/components";
import { PageHeader } from "@/modules/preview";
import {
  previewContactTypes,
  previewContacts,
  showingLabel,
  type PreviewContactType,
} from "./data";
import { LabeledSelect } from "./fields";

export function ContactsList() {
  const [type, setType] = useState("");
  const [openName, setOpenName] = useState<string | null>(null);
  const [draftOpen, setDraftOpen] = useState(false);
  const filtered = previewContacts.filter(
    (contact) => type.length === 0 || contact.type === type,
  );
  const isFiltered = type.length > 0;

  return (
    <div className="space-y-4" data-slot="preview-contacts">
      <PageHeader
        title="Contactos"
        action={
          <Button
            type="button"
            aria-expanded={draftOpen}
            aria-controls="nuevo-contacto"
            onClick={() => setDraftOpen(true)}
          >
            Nuevo contacto
          </Button>
        }
      />

      <LabeledSelect
        id="contactos-tipo"
        label="Tipo"
        value={type}
        onChange={setType}
      >
        <option value="">Todos</option>
        {previewContactTypes.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </LabeledSelect>

      <Card className="shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Contactos">
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold text-muted-foreground">
                <th className="px-4 py-3 font-semibold" scope="col">
                  Nombre
                </th>
                <th className="px-4 py-3 font-semibold" scope="col">
                  Tipo
                </th>
                <th className="px-4 py-3 text-right font-semibold" scope="col">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((contact) => {
                const open = openName === contact.name;
                const detailId = `contacto-${contact.name.replace(/\s+/g, "-").toLowerCase()}`;
                return (
                  <ContactRows
                    key={contact.name}
                    name={contact.name}
                    type={contact.type}
                    open={open}
                    detailId={detailId}
                    onToggle={() =>
                      setOpenName((current) =>
                        current === contact.name ? null : contact.name,
                      )
                    }
                  />
                );
              })}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-muted-foreground">
                    Ningún contacto coincide.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <p className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
          {showingLabel(
            filtered.length,
            isFiltered,
            previewContacts.length,
            previewContacts.length,
          )}
        </p>
      </Card>

      {draftOpen ? (
        <Card id="nuevo-contacto" className="shadow-none">
          <div className="space-y-3 p-6">
            <h2 className="text-sm font-semibold text-foreground">
              Nuevo contacto
            </h2>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">
                Tipo
              </p>
              <p className="text-sm text-foreground">Cliente</p>
            </div>
            <p className="text-sm text-muted-foreground">
              La maqueta no crea el contacto.
            </p>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function ContactRows({
  name,
  type,
  open,
  detailId,
  onToggle,
}: {
  name: string;
  type: PreviewContactType;
  open: boolean;
  detailId: string;
  onToggle: () => void;
}) {
  return (
    <>
      <tr className="border-b border-border">
        <td className="px-4 py-3 font-semibold text-foreground">{name}</td>
        <td className="px-4 py-3 text-foreground">{type}</td>
        <td className="px-4 py-3 text-right">
          <Button
            type="button"
            variant="link"
            className="h-auto px-0 text-sm font-semibold text-primary-600"
            aria-expanded={open}
            aria-controls={detailId}
            onClick={onToggle}
          >
            {open ? "Ocultar" : "Ver"}
          </Button>
        </td>
      </tr>
      {open ? (
        <tr className="border-b border-border last:border-b-0">
          <td id={detailId} colSpan={3} className="bg-muted/40 px-4 py-3">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <dt className="text-xs font-semibold text-muted-foreground">
                  Nombre
                </dt>
                <dd className="text-sm text-foreground">{name}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-semibold text-muted-foreground">
                  Tipo
                </dt>
                <dd className="text-sm text-foreground">{type}</dd>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <dt className="text-xs font-semibold text-muted-foreground">
                  Nota
                </dt>
                <dd className="text-sm text-muted-foreground">
                  Dato de maqueta. No es un cliente real.
                </dd>
              </div>
            </dl>
          </td>
        </tr>
      ) : null}
    </>
  );
}
