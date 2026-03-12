import type {
  UpdateProfileDto,
  ProfileResponseDto,
  UpdateAlertConfigurationDto,
  AlertConfigurationResponseDto,
} from "@/modules/settings/application/dto";
import type {
  ChangePasswordDto,
  ChangePasswordResponseDto,
} from "@/modules/settings/application/dto/change-password.dto";

export interface PickingConfigDto {
  pickingMode: string;
  pickingEnabled: boolean;
}

export interface SettingsRepositoryPort {
  getProfile(): Promise<ProfileResponseDto>;
  updateProfile(data: UpdateProfileDto): Promise<ProfileResponseDto>;
  getAlertConfiguration(): Promise<AlertConfigurationResponseDto>;
  updateAlertConfiguration(
    data: UpdateAlertConfigurationDto,
  ): Promise<AlertConfigurationResponseDto>;
  changePassword(data: ChangePasswordDto): Promise<ChangePasswordResponseDto>;
  getPickingConfig(): Promise<PickingConfigDto>;
  updatePickingConfig(data: {
    pickingMode?: string;
    pickingEnabled?: boolean;
  }): Promise<PickingConfigDto>;
}
