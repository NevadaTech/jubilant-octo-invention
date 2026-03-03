"use client";

import { useMutation } from "@tanstack/react-query";
import { getContainer } from "@/config/di/container";
import type {
  RequestPasswordResetDto,
  VerifyOtpDto,
  ResetPasswordDto,
} from "../../application/dto/password-reset.dto";

const authRepository = getContainer().authRepository;

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (data: RequestPasswordResetDto) =>
      authRepository.requestPasswordReset(data),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: (data: VerifyOtpDto) => authRepository.verifyOtp(data),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordDto) => authRepository.resetPassword(data),
  });
}
