"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { TokenService } from "@/modules/authentication/infrastructure/services/token.service";

export type PickingMode =
  | "OFF"
  | "OPTIONAL"
  | "REQUIRED_FULL"
  | "REQUIRED_PARTIAL";

export interface PickingConfig {
  mode: PickingMode;
}

const DEFAULT_CONFIG: PickingConfig = { mode: "OFF" };

export function usePickingConfig() {
  const orgSlug = TokenService.getOrganizationSlug() ?? "default";
  const [config, setConfig] = useLocalStorage<PickingConfig>(
    `nevada-picking-config-${orgSlug}`,
    DEFAULT_CONFIG,
  );

  return { config, setConfig };
}
