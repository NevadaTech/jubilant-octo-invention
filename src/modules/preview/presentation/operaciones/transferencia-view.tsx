"use client";

import { useState } from "react";
import {
  PageHeader,
  PreviewSku,
  StatusChip,
  previewProducts,
} from "@/modules/preview";
import { Button, Card } from "@/ui/components";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/components/table";

const cable = previewProducts.find((product) => product.sku === "NV-HDMI-2M");

export function TransferView() {
  const [received, setReceived] = useState(false);

  return (
    <section
      data-slot="operaciones-transferencia"
      className="flex flex-col gap-4"
    >
      <div className="flex flex-wrap items-center gap-3">
        <PageHeader title="TR-218" />
        <div aria-live="polite">
          <StatusChip tone={received ? "hecho" : "pendiente"}>
            {received ? "Recibido" : "En tránsito"}
          </StatusChip>
        </div>
      </div>
      <Card className="shadow-none p-6">
        <div className="flex flex-col gap-4">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <dt className="text-sm font-semibold text-foreground">Origen</dt>
              <dd className="text-sm">Bodega Norte</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-sm font-semibold text-foreground">Destino</dt>
              <dd className="text-sm">Bodega Centro</dd>
            </div>
          </dl>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold text-foreground">
                  Producto
                </TableHead>
                <TableHead className="text-right font-semibold text-foreground">
                  Cantidad
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {cable ? <PreviewSku>{cable.sku}</PreviewSku> : null}
                    <span className="font-semibold text-foreground">
                      Cable HDMI 2m
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">20</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <p className="text-sm text-muted-foreground">
            Estados del flujo: Borrador, En tránsito, Recibido.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" onClick={() => setReceived(true)}>
              Marcar recibida
            </Button>
            <Button type="button" variant="outline">
              Anular
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}
