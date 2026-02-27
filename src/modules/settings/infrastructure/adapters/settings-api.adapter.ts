import { apiClient } from "@/shared/infrastructure/http/axios-http-client";
import type { SettingsRepositoryPort } from "../../application/ports/settings.port";
import type {
  UpdateProfileDto,
  ProfileResponseDto,
  UpdateAlertConfigurationDto,
  AlertConfigurationResponseDto,
} from "../../application/dto";

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
}
