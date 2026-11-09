export type PreviewPhotoState = "none" | "ready" | "error";

export type PreviewStatusTone = "hecho" | "pendiente" | "peligro" | "borrador";

export interface PreviewProduct {
  sku: string;
  name: string;
  brand: string;
  category: string;
  stock: number;
  statusLabel: string;
  statusTone: PreviewStatusTone;
  photo: PreviewPhotoState;
}

export const previewCompany = {
  label: "Empresa",
  name: "Nevada Retail",
} as const;

export const previewUser = {
  name: "Ana Pérez",
} as const;

export const previewLocale = {
  label: "Idioma",
  value: "ES",
} as const;

export const previewPhotoCopy = {
  upload: "Subir foto",
  error: "No se pudo subir la foto. La anterior se mantiene.",
} as const;

/** Local stand-in. No network. `photo: "ready"` and the kept photo on `"error"`. */
export const previewPhotoPlaceholder =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' fill='%23f7f8fa'/%3E%3Crect x='46' y='42' width='68' height='50' rx='4' fill='none' stroke='%23808694' stroke-width='3'/%3E%3Ccircle cx='68' cy='58' r='6' fill='%23808694'/%3E%3Cpath d='M52 84l18-16 14 12 10-8 18 18' fill='none' stroke='%23808694' stroke-width='3'/%3E%3C/svg%3E";

export const previewProducts = [
  {
    sku: "NV-HDMI-2M",
    name: "Cable HDMI 2m",
    brand: "Nevada",
    category: "Cables",
    stock: 3,
    statusLabel: "Stock bajo",
    statusTone: "pendiente",
    photo: "none",
  },
  {
    sku: "NV-PULSE",
    name: "Audífonos Pulse",
    brand: "Nevada",
    category: "Audio",
    stock: 128,
    statusLabel: "Activo",
    statusTone: "hecho",
    photo: "ready",
  },
  {
    sku: "NV-COMBO-01",
    name: "Combo Escritorio",
    brand: "Nevada",
    category: "Combos",
    stock: 12,
    statusLabel: "Activo",
    statusTone: "hecho",
    photo: "error",
  },
] as const satisfies readonly PreviewProduct[];

export function getPreviewProduct(sku: string) {
  return previewProducts.find((product) => product.sku === sku);
}
