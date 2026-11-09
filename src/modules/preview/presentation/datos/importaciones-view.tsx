"use client";

import { useRef, useState } from "react";
import { PageHeader, PreviewSku } from "@/modules/preview";
import { Button } from "@/ui/components/button";
import { Card } from "@/ui/components/card";
import { Label } from "@/ui/components/label";
import { cn } from "@/ui/lib/utils";

const defaultFileName = "productos.xlsx";

const previewRows = [
  { sku: "NV-HDMI-2M", name: "Cable HDMI 2m", price: "$ 45.000" },
  { sku: "NV-PULSE", name: "Audífonos Pulse", price: "$ 89.000" },
  { sku: "NV-COMBO-01", name: "Combo Escritorio", price: "doce" },
] as const;

export function ImportacionesView() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState(defaultFileName);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  function takeFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setFileName(file.name);
    setNotice(null);
  }

  function cancel() {
    setFileName(defaultFileName);
    setNotice(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div data-slot="datos-importaciones" className="space-y-6">
      <PageHeader title="Importaciones" />

      <p className="text-sm text-foreground">Carga masiva desde Excel o CSV</p>

      <div className="space-y-2">
        <Label htmlFor="archivo-importacion">Soltar archivo</Label>
        <label
          htmlFor="archivo-importacion"
          onDragEnter={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            takeFile(event.dataTransfer.files);
          }}
          className={cn(
            "flex cursor-pointer rounded-lg border border-dashed border-border bg-card px-6 py-8",
            dragging && "border-primary",
          )}
        >
          <span className="text-sm font-semibold text-foreground">
            {fileName}
          </span>
        </label>
        <input
          ref={fileInputRef}
          id="archivo-importacion"
          type="file"
          accept=".xlsx,.xls,.csv"
          className="sr-only"
          onChange={(event) => takeFile(event.target.files)}
        />
      </div>

      <Card className="shadow-none">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th
                scope="col"
                className="px-6 py-3 font-semibold text-foreground"
              >
                SKU
              </th>
              <th
                scope="col"
                className="px-6 py-3 font-semibold text-foreground"
              >
                Nombre
              </th>
              <th
                scope="col"
                className="px-6 py-3 font-semibold text-foreground"
              >
                Precio
              </th>
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row, index) => {
              const invalid = index === 2;
              return (
                <tr
                  key={row.sku}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="px-6 py-3 text-foreground">
                    <PreviewSku>{row.sku}</PreviewSku>
                  </td>
                  <td className="px-6 py-3 text-foreground">{row.name}</td>
                  <td className="px-6 py-3">
                    <span
                      className={
                        invalid ? "text-destructive" : "text-foreground"
                      }
                    >
                      {row.price}
                    </span>
                    {invalid ? (
                      <p className="mt-1 text-destructive">
                        Fila 3, el precio no es un número
                      </p>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={cancel}>
          Cancelar
        </Button>
        <Button type="button" onClick={() => setNotice("2 filas listas")}>
          Importar filas válidas
        </Button>
      </div>

      {notice ? (
        <p role="status" className="text-right text-sm text-foreground">
          {notice}
        </p>
      ) : null}
    </div>
  );
}
