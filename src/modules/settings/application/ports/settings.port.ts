import type {
  UpdateProfileDto,
  ProfileResponseDto,
  UpdateAlertConfigurationDto,
  AlertConfigurationResponseDto,
} from "../dto";

export interface SettingsRepositoryPort {
  getProfile(): Promise<ProfileResponseDto>;
  updateProfile(data: UpdateProfileDto): Promise<ProfileResponseDto>;
  getAlertConfiguration(): Promise<AlertConfigurationResponseDto>;
  updateAlertConfiguration(
    data: UpdateAlertConfigurationDto,
  ): Promise<AlertConfigurationResponseDto>;
}
