export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponseDto {
  success: boolean;
  message: string;
  data: { userId: string };
  timestamp: string;
}
