"use client";

import { Card, CardContent, CardHeader } from "@/ui/components/card";
import {
  PageHeader,
  PreviewSku,
  StatusChip,
  previewCompany,
} from "@/modules/preview";
import {
  formatPanelCount,
  formatPanelMoney,
  panelAttention,
  panelMetrics,
  panelSalesAxisMax,
  panelSalesDays,
} from "./panel-data";

const salesColumnClass =
  "grid grid-cols-[4.5rem_minmax(0,1fr)_7rem] items-center gap-x-3";

export function PanelView() {
  return (
    <div data-slot="panel-view" className="space-y-4">
      <header data-slot="panel-heading" className="space-y-1">
        <PageHeader title="Panel de control" />
        <p data-slot="panel-scope" className="text-sm text-foreground">
          <span className="text-xs font-semibold text-muted-foreground">
            {previewCompany.label}
          </span>{" "}
          <span className="font-semibold">{previewCompany.name}</span>
        </p>
      </header>

      <Metrics />

      <div className="grid items-start gap-4 xl:grid-cols-2">
        <AttentionQueue />
        <SalesTrend />
      </div>
    </div>
  );
}

function Metrics() {
  const figures = [
    {
      id: "products",
      label: "Total de productos",
      value: formatPanelCount(panelMetrics.products),
      detail: `${formatPanelCount(panelMetrics.unitsInStock)} unidades en stock`,
    },
    {
      id: "value",
      label: "Valor del inventario",
      value: formatPanelMoney(panelMetrics.inventoryValue),
    },
    {
      id: "alerts",
      label: "Alertas de stock bajo",
      value: formatPanelCount(panelMetrics.lowStockAlerts),
    },
    {
      id: "sales",
      label: "Ventas del mes",
      value: formatPanelCount(panelMetrics.monthOrders),
      detail: "pedidos",
    },
  ];

  return (
    <section data-slot="panel-metrics" aria-label="Cifras">
      <dl className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {figures.map((figure) => (
          <Card key={figure.id} className="h-full shadow-none">
            <div className="space-y-1 p-6">
              <dt className="text-sm font-semibold text-foreground">
                {figure.label}
              </dt>
              <dd className="text-2xl font-bold leading-tight tabular-nums text-foreground">
                {figure.value}
              </dd>
              {figure.detail ? (
                <dd className="text-sm text-muted-foreground">{figure.detail}</dd>
              ) : null}
            </div>
          </Card>
        ))}
      </dl>
    </section>
  );
}

function AttentionQueue() {
  return (
    <Card data-slot="panel-attention" className="shadow-none">
      <CardHeader className="pb-3">
        <h2 className="text-sm font-semibold text-foreground">
          Requieren atención
        </h2>
      </CardHeader>
      <CardContent className="pt-0">
        <ul>
          {panelAttention.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0"
            >
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {item.title}
                  {item.code ? (
                    <>
                      {" "}
                      <PreviewSku>{item.code}</PreviewSku>
                    </>
                  ) : null}
                </p>
                {item.detail ? (
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                ) : null}
              </div>
              <StatusChip tone={item.statusTone} className="shrink-0">
                {item.statusLabel}
              </StatusChip>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function SalesTrend() {
  const axisMid = panelSalesAxisMax / 2;

  return (
    <Card data-slot="panel-sales" className="shadow-none">
      <CardHeader className="space-y-1 pb-3">
        <h2 className="text-sm font-semibold text-foreground">
          Tendencia de ventas
        </h2>
        <p className="text-sm text-muted-foreground">
          Ingresos de los últimos 7 días
        </p>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className={salesColumnClass}>
          <span className="text-xs font-semibold text-muted-foreground">
            Día
          </span>
          <div className="grid grid-cols-3 text-xs font-semibold tabular-nums text-muted-foreground">
            <span>{formatPanelMoney(0)}</span>
            <span className="text-center">{formatPanelMoney(axisMid)}</span>
            <span className="text-right">
              {formatPanelMoney(panelSalesAxisMax)}
            </span>
          </div>
          <span className="text-right text-xs font-semibold text-muted-foreground">
            Ingresos
          </span>
        </div>
        <ol className="space-y-3">
          {panelSalesDays.map((day) => (
            <li key={day.id} className={salesColumnClass}>
              <span className="text-sm font-semibold text-foreground">
                <span className="sr-only">{day.fullLabel}</span>
                <span aria-hidden="true">{day.shortLabel}</span>
              </span>
              <div className="relative h-5 overflow-hidden rounded-sm border border-border bg-background">
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-1/2 w-px bg-border"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 bg-primary"
                  style={{
                    width: `${(day.amount / panelSalesAxisMax) * 100}%`,
                  }}
                />
              </div>
              <span className="text-right text-sm tabular-nums whitespace-nowrap text-foreground">
                {formatPanelMoney(day.amount)}
              </span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
