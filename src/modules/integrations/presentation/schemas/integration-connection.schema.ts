import { z } from "zod";
import type {
  CreateIntegrationConnectionDto,
  UpdateIntegrationConnectionDto,
} from "@/modules/integrations/application/dto/integration-connection.dto";

export const vtexConnectionSchema = z.object({
  accountName: z
    .string()
    .min(1, "Account name is required")
    .max(100)
    .regex(
      /^[a-zA-Z0-9-]+$/,
      "Only alphanumeric characters and hyphens are allowed",
    ),
  storeName: z.string().min(1, "Store name is required").max(200),
  appKey: z.string().min(1, "App Key is required"),
  appToken: z.string().min(1, "App Token is required"),
  syncStrategy: z.enum(["WEBHOOK", "POLLING", "BOTH"]),
  syncDirection: z.enum(["INBOUND", "OUTBOUND", "BIDIRECTIONAL"]),
  defaultWarehouseId: z.string().min(1, "Warehouse is required"),
  defaultContactId: z.string().optional(),
  companyId: z.string().optional(),
});

export type VtexConnectionFormData = z.infer<typeof vtexConnectionSchema>;

export function toCreateConnectionDto(
  data: VtexConnectionFormData,
): CreateIntegrationConnectionDto {
  return {
    provider: "VTEX",
    accountName: data.accountName,
    storeName: data.storeName,
    appKey: data.appKey,
    appToken: data.appToken,
    syncStrategy: data.syncStrategy,
    syncDirection: data.syncDirection,
    defaultWarehouseId: data.defaultWarehouseId,
    defaultContactId: data.defaultContactId || undefined,
    companyId: data.companyId || undefined,
  };
}

export const updateConnectionSchema = z.object({
  storeName: z.string().min(1, "Store name is required").max(200),
  appKey: z.string().optional(),
  appToken: z.string().optional(),
  syncStrategy: z.enum(["WEBHOOK", "POLLING", "BOTH"]),
  syncDirection: z.enum(["INBOUND", "OUTBOUND", "BIDIRECTIONAL"]),
  defaultWarehouseId: z.string().min(1, "Warehouse is required"),
  defaultContactId: z.string().optional(),
  companyId: z.string().optional(),
});

export type UpdateConnectionFormData = z.infer<typeof updateConnectionSchema>;

export function toUpdateConnectionDto(
  data: VtexConnectionFormData | UpdateConnectionFormData,
): UpdateIntegrationConnectionDto {
  return {
    storeName: data.storeName,
    appKey: data.appKey || undefined,
    appToken: data.appToken || undefined,
    syncStrategy: data.syncStrategy,
    syncDirection: data.syncDirection,
    defaultWarehouseId: data.defaultWarehouseId,
    defaultContactId: data.defaultContactId || undefined,
    companyId: data.companyId || undefined,
  };
}

export const meliConnectionSchema = z.object({
  storeName: z.string().min(1, "Store name is required").max(200),
  clientId: z.string().min(1, "Client ID (App ID) is required"),
  clientSecret: z.string().min(1, "Client Secret is required"),
  syncStrategy: z.enum(["WEBHOOK", "POLLING", "BOTH"]),
  syncDirection: z.literal("INBOUND"),
  defaultWarehouseId: z.string().min(1, "Warehouse is required"),
  defaultContactId: z.string().optional(),
  companyId: z.string().optional(),
});

export type MeliConnectionFormData = z.infer<typeof meliConnectionSchema>;

export function toMeliCreateConnectionDto(
  data: MeliConnectionFormData,
): CreateIntegrationConnectionDto {
  return {
    provider: "MERCADOLIBRE",
    accountName: `meli-${Date.now()}`,
    storeName: data.storeName,
    appKey: data.clientId,
    appToken: data.clientSecret,
    syncStrategy: data.syncStrategy,
    syncDirection: "INBOUND",
    defaultWarehouseId: data.defaultWarehouseId,
    defaultContactId: data.defaultContactId || undefined,
    companyId: data.companyId || undefined,
  };
}

export const skuMappingSchema = z.object({
  externalSku: z.string().min(1, "External SKU is required"),
  productId: z.string().min(1, "Product is required"),
});

export type SkuMappingFormData = z.infer<typeof skuMappingSchema>;
