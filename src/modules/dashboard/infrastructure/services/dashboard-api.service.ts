import { apiClient } from "@/shared/infrastructure/http";
import type {
  DashboardMetricsDto,
  DashboardMetricsApiResponse,
} from "@/modules/dashboard/application/dto/metrics.dto";

/**
 * Dashboard API Service
 * Single call to dedicated endpoint instead of 3 separate report calls
 */
export class DashboardApiService {
  async getMetrics(): Promise<DashboardMetricsDto> {
    const response =
      await apiClient.get<DashboardMetricsApiResponse>("/dashboard/metrics");
    return response.data.data;
  }
}

export const dashboardApiService = new DashboardApiService();
