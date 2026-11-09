import type { PreviewStatusTone } from "@/modules/preview";

export interface PreviewDocument {
  number: string;
  contact: string;
  statusLabel: string;
  statusTone: PreviewStatusTone;
  total: string;
}

export const previewSales: readonly PreviewDocument[] = [
  {
    number: "VTA-320",
    contact: "Taller Andino",
    statusLabel: "Picking",
    statusTone: "pendiente",
    total: "$ 1.240.000",
  },
  {
    number: "VTA-319",
    contact: "Distribuidora Sol",
    statusLabel: "Confirmada",
    statusTone: "hecho",
    total: "$ 860.000",
  },
  {
    number: "VTA-318",
    contact: "Cliente Mostrador",
    statusLabel: "Borrador",
    statusTone: "borrador",
    total: "$ 95.000",
  },
  {
    number: "VTA-310",
    contact: "Ferretería Luna",
    statusLabel: "Completada",
    statusTone: "hecho",
    total: "$ 2.100.000",
  },
];

export const previewSaleStatusOptions = [
  "Borrador",
  "Confirmada",
  "Picking",
  "Completada",
] as const;

export const previewReturns: readonly PreviewDocument[] = [
  {
    number: "DEV-088",
    contact: "Taller Andino",
    statusLabel: "Pendiente",
    statusTone: "pendiente",
    total: "$ 180.000",
  },
  {
    number: "DEV-074",
    contact: "Ferretería Luna",
    statusLabel: "Confirmada",
    statusTone: "hecho",
    total: "$ 95.000",
  },
];

export const previewReturnStatusOptions = ["Pendiente", "Confirmada"] as const;

export const previewSaleSteps = [
  "Borrador",
  "Confirmada",
  "Picking",
  "Enviada",
  "Completada",
] as const;

export type PreviewSaleStep = (typeof previewSaleSteps)[number];

export interface PreviewSaleLine {
  sku: string;
  name: string;
  quantity: number;
  amount: string | null;
  photo: boolean;
  note?: string;
}

export const previewSaleLines: readonly PreviewSaleLine[] = [
  {
    sku: "NV-PULSE",
    name: "Audífonos Pulse",
    quantity: 4,
    amount: "$ 320.000",
    photo: true,
  },
  {
    sku: "NV-HDMI-2M",
    name: "Cable HDMI 2m",
    quantity: 10,
    amount: null,
    photo: false,
    note: "La foto no confirma la línea. El código sí.",
  },
];

export const previewSaleTotal = "$ 1.240.000";

export const previewContacts = [
  { name: "Taller Andino", type: "Cliente" },
  { name: "Distribuidora Sol", type: "Ambos" },
  { name: "Bodega Sur SAS", type: "Proveedor" },
] as const;

export const previewContactTypes = ["Cliente", "Proveedor", "Ambos"] as const;

export type PreviewContactType = (typeof previewContactTypes)[number];

export function getPreviewSale(id: string) {
  return previewSales.find((sale) => sale.number === id);
}

export function showingLabel(
  visible: number,
  filtered: boolean,
  listed: number,
  total: number,
): string {
  if (!filtered) return `Mostrando 1 a ${listed} de ${total}`;
  if (visible === 0) return `Mostrando 0 de ${total}`;
  return `Mostrando 1 a ${visible} de ${visible}`;
}
