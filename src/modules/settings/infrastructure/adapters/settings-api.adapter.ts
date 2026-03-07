import { apiClient } from "@/shared/infrastructure/http/axios-http-client";
import type {
  SettingsRepositoryPort,
  PickingConfigDto,
} from "../../application/ports/settings.port";
import type {
  UpdateProfileDto,
  ProfileResponseDto,
  UpdateAlertConfigurationDto,
  AlertConfigurationResponseDto,
} from "../../application/dto";
import type {
  ChangePasswordDto,
  ChangePasswordResponseDto,
} from "../../application/dto/change-password.dto";

export class SettingsApiAdapter implements SettingsRepositoryPort {
  async getProfile(): Promise<ProfileResponseDto> {
    const response = await apiClient.get<ProfileResponseDto>("/users/me");
    return response.data;
  }

  async updateProfile(data: UpdateProfileDto): Promise<ProfileResponseDto> {
    const response = await apiClient.put<ProfileResponseDto>("/users/me", data);
    return response.data;
  }

  async getAlertConfiguration(): Promise<AlertConfigurationResponseDto> {
    const response =
      await apiClient.get<AlertConfigurationResponseDto>("/settings/alerts");
    return response.data;
  }

  async updateAlertConfiguration(
    data: UpdateAlertConfigurationDto,
  ): Promise<AlertConfigurationResponseDto> {
    const response = await apiClient.put<AlertConfigurationResponseDto>(
      "/settings/alerts",
      data,
    );
    return response.data;
  }

  async changePassword(
    data: ChangePasswordDto,
  ): Promise<ChangePasswordResponseDto> {
    const response = await apiClient.put<ChangePasswordResponseDto>(
      "/users/me/password",
      data,
    );
    return response.data;
  }

  async toggleMultiCompany(enabled: boolean): Promise<void> {
    const orgId = (
      await import("@/modules/authentication/infrastructure/services/token.service")
    ).TokenService.getOrganizationId();
    if (!orgId) throw new Error("Organization ID not found");
    await apiClient.patch(`/organizations/${orgId}/settings/multi-company`, {
      enabled,
    });
  }

  async getPickingConfig(): Promise<PickingConfigDto> {
    const response = await apiClient.get<{ data: PickingConfigDto }>(
      "/settings/picking",
    );
    return response.data.data;
  }

  async updatePickingConfig(data: {
    pickingMode?: string;
    pickingEnabled?: boolean;
  }): Promise<PickingConfigDto> {
    const response = await apiClient.put<{ data: PickingConfigDto }>(
      "/settings/picking",
      data,
    );
    return response.data.data;
  }
}
