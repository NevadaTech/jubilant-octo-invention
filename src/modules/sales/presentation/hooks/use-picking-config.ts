"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContainer } from "@/config/di/container";

export type PickingMode =
  | "OFF"
  | "OPTIONAL"
  | "REQUIRED_FULL"
  | "REQUIRED_PARTIAL";

export interface PickingConfig {
  mode: PickingMode;
}

const pickingKeys = {
  config: ["settings", "picking"] as const,
};

export function usePickingConfig() {
  const queryClient = useQueryClient();
  const settingsAdapter = getContainer().settingsRepository;

  const { data, isLoading } = useQuery({
    queryKey: pickingKeys.config,
    queryFn: () => settingsAdapter.getPickingConfig(),
    staleTime: 5 * 60 * 1000,
  });

  const config: PickingConfig = {
    mode: (data?.pickingMode as PickingMode) ?? "OFF",
  };

  const pickingEnabled = data?.pickingEnabled ?? false;

  const mutation = useMutation({
    mutationFn: (updates: { pickingMode?: string; pickingEnabled?: boolean }) =>
      settingsAdapter.updatePickingConfig(updates),
    onSuccess: (result) => {
      queryClient.setQueryData(pickingKeys.config, result);
    },
  });

  const setConfig = (newConfig: PickingConfig) => {
    mutation.mutate({ pickingMode: newConfig.mode });
  };

  const setPickingEnabled = (enabled: boolean) => {
    mutation.mutate({ pickingEnabled: enabled });
  };

  return {
    config,
    setConfig,
    pickingEnabled,
    setPickingEnabled,
    isLoading,
    isSaving: mutation.isPending,
  };
}
