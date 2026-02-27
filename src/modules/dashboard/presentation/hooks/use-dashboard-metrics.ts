"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApiService } from "@/modules/dashboard/infrastructure/services/dashboard-api.service";
import type { DashboardMetricsDto } from "@/modules/dashboard/application/dto/metrics.dto";
import { useAuthStore } from "@/modules/authentication/presentation/store/auth.store";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const REFETCH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useDashboardMetrics() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const canFetch = isHydrated && isAuthenticated;

  const query = useQuery<DashboardMetricsDto, Error>({
    queryKey: ["dashboard", "metrics"],
    queryFn: () => dashboardApiService.getMetrics(),
    enabled: canFetch,
    staleTime: STALE_TIME,
    refetchInterval: canFetch ? REFETCH_INTERVAL : false,
    retry: 1,
  });

  return {
    metrics: query.data,
    // Fix: In TanStack Query v5, isPending is true when enabled=false.
    // Use !canFetch || query.isLoading to avoid perpetual skeleton.
    isLoading: !canFetch ? false : query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
