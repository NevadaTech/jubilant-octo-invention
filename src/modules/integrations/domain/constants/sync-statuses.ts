import type { IntegrationProvider } from "@/modules/integrations/domain/entities/integration-connection.entity";

export interface SyncStatusOption {
  value: string;
  safe: boolean;
}

export const VTEX_SYNC_STATUSES: SyncStatusOption[] = [
  { value: "payment-approved", safe: true },
  { value: "ready-for-handling", safe: true },
  { value: "handling", safe: true },
  { value: "invoiced", safe: false },
  { value: "payment-pending", safe: false },
  { value: "canceled", safe: false },
];

export const MELI_SYNC_STATUSES: SyncStatusOption[] = [
  { value: "paid", safe: true },
  { value: "confirmed", safe: true },
  { value: "payment_required", safe: false },
  { value: "partially_paid", safe: false },
  { value: "cancelled", safe: false },
];

export function getSyncStatusesForProvider(
  provider: IntegrationProvider,
): SyncStatusOption[] {
  return provider === "VTEX" ? VTEX_SYNC_STATUSES : MELI_SYNC_STATUSES;
}

export function getDefaultSelectedStatuses(
  provider: IntegrationProvider,
): string[] {
  return getSyncStatusesForProvider(provider)
    .filter((s) => s.safe)
    .map((s) => s.value);
}

export function getProviderKey(provider: IntegrationProvider): "vtex" | "meli" {
  return provider === "VTEX" ? "vtex" : "meli";
}
