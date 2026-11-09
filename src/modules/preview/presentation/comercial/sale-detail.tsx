"use client";

import { useState, type ReactNode } from "react";
import { Button, Card } from "@/ui/components";
import { cn } from "@/ui/lib/utils";
import {
  PageHeader,
  PreviewSku,
  StatusChip,
  previewPhotoPlaceholder,
  previewScreens,
} from "@/modules/preview";
import {
  getPreviewSale,
  previewSaleLines,
  previewSaleSteps,
  previewSaleTotal,
  type PreviewDocument,
  type PreviewSaleStep,
} from "./data";
import { PreviewTextLink } from "./text-link";

export function SaleDetail({ id }: { id: string }) {
  const sale = getPreviewSale(id);

  if (!sale) {
    return <UnknownSale id={id} />;
  }

  if (sale.number === "VTA-320") {
    return <PickingSale />;
  }

  return <SaleSummary sale={sale} />;
}

function PickingSale() {
  const [currentStep, setCurrentStep] = useState<PreviewSaleStep>("Picking");
  const sent = currentStep === "Enviada";

  return (
    <div className="space-y-4" data-slot="preview-sale">
      <PageHeader
        title="Venta"
        action={
          <Button
            type="button"
            onClick={() => setCurrentStep("Enviada")}
            disabled={sent}
          >
            Marcar enviada
          </Button>
        }
      />
      <Card className="shadow-none">
        <div className="space-y-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Readout label="Número">
              <PreviewSku>VTA-320</PreviewSku>
            </Readout>
            <Readout label="Contacto">Taller Andino</Readout>
          </div>
          <SaleSteps current={currentStep} />
          <SaleLines />
          <div className="flex items-baseline justify-between gap-4 border-t border-border pt-4">
            <p className="text-xs font-semibold text-muted-foreground">Total</p>
            <p className="text-sm font-semibold text-foreground">
              {previewSaleTotal}
            </p>
          </div>
        </div>
      </Card>
      <BackLink />
    </div>
  );
}

function SaleSummary({ sale }: { sale: PreviewDocument }) {
  return (
    <div className="space-y-4" data-slot="preview-sale">
      <PageHeader title="Venta" />
      <Card className="shadow-none">
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <Readout label="Número">
            <PreviewSku>{sale.number}</PreviewSku>
          </Readout>
          <Readout label="Contacto">{sale.contact}</Readout>
          <Readout label="Estado">
            <StatusChip tone={sale.statusTone}>{sale.statusLabel}</StatusChip>
          </Readout>
          <Readout label="Total">{sale.total}</Readout>
        </div>
      </Card>
      <BackLink />
    </div>
  );
}

function UnknownSale({ id }: { id: string }) {
  return (
    <div className="space-y-4" data-slot="preview-sale">
      <PageHeader title="Venta" />
      <Card className="shadow-none">
        <div className="space-y-2 p-6">
          <PreviewSku className="break-all">{id}</PreviewSku>
          <p className="text-sm text-foreground">
            La venta no está en la maqueta.
          </p>
        </div>
      </Card>
      <BackLink />
    </div>
  );
}

function SaleSteps({ current }: { current: PreviewSaleStep }) {
  const currentIndex = previewSaleSteps.indexOf(current);

  return (
    <div className="space-y-2">
      <h2 className="text-xs font-semibold text-muted-foreground">Pasos</h2>
      <ol
        aria-label="Pasos"
        aria-live="polite"
        className="flex flex-wrap items-center gap-x-3 gap-y-2"
      >
        {previewSaleSteps.map((step, index) => {
          const position =
            index < currentIndex
              ? "done"
              : index === currentIndex
                ? "current"
                : "upcoming";
          return (
            <li key={step} className="flex items-center gap-3">
              <span
                aria-current={position === "current" ? "step" : undefined}
                className={cn("text-sm", stepClassName(position))}
              >
                {position === "current" ? `${step} (actual)` : step}
              </span>
              {index < previewSaleSteps.length - 1 ? (
                <span aria-hidden="true" className="h-px w-4 bg-border" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function stepClassName(position: "done" | "current" | "upcoming") {
  if (position === "current") {
    return "rounded-md bg-primary-100 px-2 py-1 font-semibold text-primary-700";
  }
  if (position === "done") {
    return "text-success-700";
  }
  return "text-muted-foreground";
}

function SaleLines() {
  return (
    <div className="space-y-2">
      <h2 className="text-xs font-semibold text-muted-foreground">Líneas</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-label="Líneas">
          <thead>
            <tr className="border-b border-border text-left text-xs font-semibold text-muted-foreground">
              <th className="py-3 pr-4 font-semibold" scope="col">
                Producto
              </th>
              <th className="px-4 py-3 text-right font-semibold" scope="col">
                Cantidad
              </th>
              <th className="py-3 pl-4 text-right font-semibold" scope="col">
                Importe
              </th>
            </tr>
          </thead>
          <tbody>
            {previewSaleLines.map((line) => (
              <tr key={line.sku} className="border-b border-border">
                <td className="py-3 pr-4">
                  <div className="flex items-start gap-3">
                    {line.photo ? (
                      <div
                        role="img"
                        aria-label={`Foto de ${line.name}`}
                        className="h-10 w-10 shrink-0 rounded-md border border-border bg-cover"
                        style={{
                          backgroundImage: `url("${previewPhotoPlaceholder}")`,
                        }}
                      />
                    ) : null}
                    <div className="min-w-0 space-y-1">
                      <p className="font-semibold text-foreground">
                        {line.name}
                      </p>
                      <p className="text-sm text-foreground">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Código{" "}
                        </span>
                        <PreviewSku>{line.sku}</PreviewSku>
                      </p>
                      {line.note ? (
                        <p className="text-sm text-muted-foreground">
                          {line.note}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-foreground">
                  {line.quantity}
                </td>
                <td className="py-3 pl-4 text-right whitespace-nowrap text-foreground">
                  {line.amount ?? (
                    <span className="text-muted-foreground">Sin importe</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Readout({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

function BackLink() {
  return (
    <PreviewTextLink href={previewScreens.ventas.href}>
      Volver a ventas
    </PreviewTextLink>
  );
}
