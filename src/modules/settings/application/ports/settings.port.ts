import type {
  UpdateProfileDto,
  ProfileResponseDto,
  UpdateAlertConfigurationDto,
  AlertConfigurationResponseDto,
} from "../dto";
import type {
  ChangePasswordDto,
  ChangePasswordResponseDto,
} from "../dto/change-password.dto";

export interface SettingsRepositoryPort {
  getProfile(): Promise<ProfileResponseDto>;
  updateProfile(data: UpdateProfileDto): Promise<ProfileResponseDto>;
  getAlertConfiguration(): Promise<AlertConfigurationResponseDto>;
  updateAlertConfiguration(
    data: UpdateAlertConfigurationDto,
  ): Promise<AlertConfigurationResponseDto>;
  changePassword(data: ChangePasswordDto): Promise<ChangePasswordResponseDto>;
}
