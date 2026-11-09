"use client";

import { useState } from "react";
import {
  PageHeader,
  PreviewSku,
  StatusChip,
  previewUser,
} from "@/modules/preview";
import { Button, Card, Input, Label } from "@/ui/components";

interface ActivityRow {
  id: string;
  label: string;
  day: string;
  action: string;
  entity: string;
  code: string | null;
  actor: string;
}

const ACTIVITY: ActivityRow[] = [
  {
    id: "mov-1041",
    label: "6 nov 2026 09:14",
    day: "2026-11-06",
    action: "Publicar",
    entity: "Movimiento",
    code: "MOV-1041",
    actor: "Luis Gómez",
  },
  {
    id: "vta-319",
    label: "6 nov 2026 09:02",
    day: "2026-11-06",
    action: "Confirmar",
    entity: "Venta",
    code: "VTA-319",
    actor: "Marta Ríos",
  },
  {
    id: "sesion-ana",
    label: "5 nov 2026 18:40",
    day: "2026-11-05",
    action: "Iniciar sesión",
    entity: "Sesión",
    code: null,
    actor: previewUser.name,
  },
];

const ENTITY_OPTIONS = ["Todas", "Movimiento", "Venta", "Sesión"] as const;

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function AuditoriaPreview() {
  const [entity, setEntity] =
    useState<(typeof ENTITY_OPTIONS)[number]>("Todas");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const rows = ACTIVITY.filter((row) => {
    if (entity !== "Todas" && row.entity !== entity) return false;
    if (from && row.day < from) return false;
    if (to && row.day > to) return false;
    return true;
  });

  return (
    <div data-slot="admin-auditoria" className="space-y-4">
      <PageHeader title="Registro de actividad" />

      <div className="flex flex-wrap items-end gap-4">
        <div className="w-56 space-y-2">
          <Label htmlFor="auditoria-entidad">Tipo de entidad</Label>
          <select
            id="auditoria-entidad"
            className={selectClassName}
            value={entity}
            onChange={(event) =>
              setEntity(event.target.value as (typeof ENTITY_OPTIONS)[number])
            }
          >
            {ENTITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium leading-none text-foreground">
            Rango de fechas
          </legend>
          <div className="flex flex-wrap gap-2">
            <div className="space-y-2">
              <Label htmlFor="auditoria-desde">Desde</Label>
              <Input
                id="auditoria-desde"
                type="date"
                className="w-40"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auditoria-hasta">Hasta</Label>
              <Input
                id="auditoria-hasta"
                type="date"
                className="w-40"
                value={to}
                onChange={(event) => setTo(event.target.value)}
              />
            </div>
          </div>
        </fieldset>

        <Button type="button" variant="outline" className="ml-auto">
          Exportar
        </Button>
      </div>

      <Card className="shadow-none">
        <div className="overflow-x-auto">
          <table aria-label="Registro de actividad" className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-sm font-medium text-muted-foreground">
                <th className="px-4 py-3 font-medium" scope="col">
                  Fecha/hora
                </th>
                <th className="px-4 py-3 font-medium" scope="col">
                  Acción
                </th>
                <th className="px-4 py-3 font-medium" scope="col">
                  Entidad
                </th>
                <th className="px-4 py-3 font-medium" scope="col">
                  Realizado por
                </th>
                <th className="px-4 py-3 font-medium" scope="col">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-sm text-muted-foreground"
                  >
                    No hay registros con estos filtros.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-foreground">
                      {row.label}
                    </td>
                    <td className="px-4 py-3 text-foreground">{row.action}</td>
                    <td className="px-4 py-3 text-foreground">
                      {row.entity}
                      {row.code ? (
                        <>
                          {" "}
                          <PreviewSku>{row.code}</PreviewSku>
                        </>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-foreground">{row.actor}</td>
                    <td className="px-4 py-3">
                      <StatusChip tone="hecho">Correcto</StatusChip>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
