const integerFormat = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 0,
});

export function formatPanelCount(value: number): string {
  return integerFormat.format(value);
}

export function formatPanelMoney(value: number): string {
  return `$ ${formatPanelCount(value)}`;
}

export const panelMetrics = {
  products: 1248,
  unitsInStock: 18430,
  inventoryValue: 482_900_000,
  lowStockAlerts: 14,
  monthOrders: 86,
} as const;

export interface PanelAttentionItem {
  id: string;
  title: string;
  code?: string;
  detail?: string;
  statusLabel: string;
  statusTone: "pendiente";
}

export const panelAttention: readonly PanelAttentionItem[] = [
  {
    id: "hdmi",
    title: "Cable HDMI 2m",
    detail: "Stock 3 en Bodega Norte. Mínimo 20.",
    statusLabel: "Stock bajo",
    statusTone: "pendiente",
  },
  {
    id: "pulse",
    title: "Audífonos Pulse",
    detail: "Stock 0 en Bodega Centro.",
    statusLabel: "Sin stock",
    statusTone: "pendiente",
  },
  {
    id: "mov-1042",
    title: "Movimiento",
    code: "MOV-1042",
    statusLabel: "Borrador",
    statusTone: "pendiente",
  },
  {
    id: "tr-218",
    title: "Transferencia",
    code: "TR-218",
    statusLabel: "En tránsito",
    statusTone: "pendiente",
  },
];

/** Tope del eje. Ningún día de la maqueta lo alcanza. */
export const panelSalesAxisMax = 2_400_000;

export const panelSalesDays = [
  {
    id: "2026-11-03",
    shortLabel: "Mar 3",
    fullLabel: "Martes 3 de noviembre",
    amount: 980_000,
  },
  {
    id: "2026-11-04",
    shortLabel: "Mié 4",
    fullLabel: "Miércoles 4 de noviembre",
    amount: 1_450_000,
  },
  {
    id: "2026-11-05",
    shortLabel: "Jue 5",
    fullLabel: "Jueves 5 de noviembre",
    amount: 860_000,
  },
  {
    id: "2026-11-06",
    shortLabel: "Vie 6",
    fullLabel: "Viernes 6 de noviembre",
    amount: 2_140_000,
  },
  {
    id: "2026-11-07",
    shortLabel: "Sáb 7",
    fullLabel: "Sábado 7 de noviembre",
    amount: 1_720_000,
  },
  {
    id: "2026-11-08",
    shortLabel: "Dom 8",
    fullLabel: "Domingo 8 de noviembre",
    amount: 540_000,
  },
  {
    id: "2026-11-09",
    shortLabel: "Lun 9",
    fullLabel: "Lunes 9 de noviembre",
    amount: 1_180_000,
  },
] as const;
