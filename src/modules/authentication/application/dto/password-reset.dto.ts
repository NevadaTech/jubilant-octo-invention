export interface RequestPasswordResetDto {
  email: string;
  organizationSlug: string;
}

export interface RequestPasswordResetResponseDto {
  success: boolean;
  message: string;
  data: {
    email: string;
    expiresInMinutes: number;
    maxAttempts: number;
  };
  timestamp: string;
}

export interface VerifyOtpDto {
  email: string;
  otpCode: string;
  organizationSlug: string;
}

export interface VerifyOtpResponseDto {
  success: boolean;
  message: string;
  data: {
    email: string;
    verified: boolean;
  };
  timestamp: string;
}

export interface ResetPasswordDto {
  email: string;
  otpCode: string;
  newPassword: string;
  confirmPassword: string;
  organizationSlug: string;
}

export interface ResetPasswordResponseDto {
  success: boolean;
  message: string;
  data: {
    email: string;
  };
  timestamp: string;
}
