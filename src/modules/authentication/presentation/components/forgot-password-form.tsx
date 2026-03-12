"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2, ArrowLeft, CheckCircle2, Timer } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { PasswordInput } from "@/ui/components/password-input";
import { Label } from "@/ui/components/label";
import { FormField } from "@/ui/components/form-field";
import {
  requestResetSchema,
  verifyOtpSchema,
  newPasswordSchema,
  type RequestResetFormValues,
  type VerifyOtpFormValues,
  type NewPasswordFormValues,
} from "@/modules/authentication/presentation/schemas/password-reset.schema";
import {
  useRequestPasswordReset,
  useVerifyOtp,
  useResetPassword,
} from "@/modules/authentication/presentation/hooks/use-password-reset";

type Step = "email" | "otp" | "password" | "success";

export function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPassword");
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [organizationSlug, setOrganizationSlug] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = useCallback(() => {
    setCooldown(180);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          cooldownRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const requestReset = useRequestPasswordReset();
  const verifyOtp = useVerifyOtp();
  const resetPassword = useResetPassword();

  // Step 1: Email form
  const emailForm = useForm<RequestResetFormValues>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: { organizationSlug: "", email: "" },
  });

  const onEmailSubmit = (data: RequestResetFormValues) => {
    requestReset.mutate(data, {
      onSuccess: () => {
        setEmail(data.email);
        setOrganizationSlug(data.organizationSlug);
        setStep("otp");
        startCooldown();
      },
    });
  };

  // Step 2: OTP form
  const otpForm = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otpCode: "" },
  });

  const onOtpSubmit = (data: VerifyOtpFormValues) => {
    verifyOtp.mutate(
      { email, otpCode: data.otpCode, organizationSlug },
      {
        onSuccess: () => {
          setOtpCode(data.otpCode);
          setStep("password");
        },
      },
    );
  };

  // Step 3: New password form
  const passwordForm = useForm<NewPasswordFormValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onPasswordSubmit = (data: NewPasswordFormValues) => {
    resetPassword.mutate(
      {
        email,
        otpCode,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
        organizationSlug,
      },
      {
        onSuccess: () => setStep("success"),
      },
    );
  };

  if (step === "email") {
    return (
      <form
        onSubmit={emailForm.handleSubmit(onEmailSubmit)}
        className="space-y-4"
      >
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            {t("title")}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {t("description")}
          </p>
        </div>

        {requestReset.error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {requestReset.error instanceof Error
              ? requestReset.error.message
              : t("description")}
          </div>
        )}

        <FormField error={emailForm.formState.errors.organizationSlug?.message}>
          <Label htmlFor="organizationSlug">{t("organization")}</Label>
          <Input
            id="organizationSlug"
            type="text"
            placeholder={t("organizationPlaceholder")}
            {...emailForm.register("organizationSlug")}
          />
        </FormField>

        <FormField error={emailForm.formState.errors.email?.message}>
          <Label htmlFor="resetEmail">{t("enterEmail")}</Label>
          <Input
            id="resetEmail"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...emailForm.register("email")}
          />
        </FormField>

        <Button
          type="submit"
          className="w-full"
          disabled={requestReset.isPending}
        >
          {requestReset.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {requestReset.isPending ? t("sending") : t("sendCode")}
        </Button>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" />
            {t("backToLogin")}
          </Link>
        </div>
      </form>
    );
  }

  if (step === "otp") {
    return (
      <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            {t("checkEmail")}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {t("checkEmailDescription")}
          </p>
        </div>

        {verifyOtp.error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {verifyOtp.error instanceof Error
              ? verifyOtp.error.message
              : t("invalidCode")}
          </div>
        )}

        <FormField error={otpForm.formState.errors.otpCode?.message}>
          <Label htmlFor="otpCode">{t("enterOtp")}</Label>
          <Input
            id="otpCode"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder={t("otpPlaceholder")}
            autoComplete="one-time-code"
            className="text-center text-lg tracking-widest"
            {...otpForm.register("otpCode")}
          />
        </FormField>

        <Button type="submit" className="w-full" disabled={verifyOtp.isPending}>
          {verifyOtp.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {verifyOtp.isPending ? t("verifying") : t("verifyCode")}
        </Button>

        <div className="text-center">
          {cooldown > 0 ? (
            <span className="text-sm text-neutral-400 dark:text-neutral-500 inline-flex items-center gap-1.5">
              <Timer className="h-3 w-3" />
              {t("resendIn", {
                minutes: String(Math.floor(cooldown / 60)).padStart(2, "0"),
                seconds: String(cooldown % 60).padStart(2, "0"),
              })}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => {
                requestReset.mutate(
                  { email, organizationSlug },
                  { onSuccess: () => startCooldown() },
                );
              }}
              disabled={requestReset.isPending}
              className="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 inline-flex items-center gap-1"
            >
              {requestReset.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <ArrowLeft className="h-3 w-3" />
              )}
              {t("requestNew")}
            </button>
          )}
        </div>
      </form>
    );
  }

  if (step === "password") {
    return (
      <form
        onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
        className="space-y-4"
      >
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            {t("resetPassword")}
          </h2>
        </div>

        {resetPassword.error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {resetPassword.error instanceof Error
              ? resetPassword.error.message
              : t("resetPassword")}
          </div>
        )}

        <FormField error={passwordForm.formState.errors.newPassword?.message}>
          <Label htmlFor="newPassword">{t("newPassword")}</Label>
          <PasswordInput
            id="newPassword"
            autoComplete="new-password"
            {...passwordForm.register("newPassword")}
          />
        </FormField>

        <FormField
          error={passwordForm.formState.errors.confirmPassword?.message}
        >
          <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            {...passwordForm.register("confirmPassword")}
          />
        </FormField>

        <Button
          type="submit"
          className="w-full"
          disabled={resetPassword.isPending}
        >
          {resetPassword.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {resetPassword.isPending ? t("resetting") : t("resetPassword")}
        </Button>
      </form>
    );
  }

  // Success step
  return (
    <div className="text-center space-y-4">
      <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
      <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        {t("success")}
      </h2>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        {t("successDescription")}
      </p>
      <Link href="/login">
        <Button className="w-full">{t("backToLogin")}</Button>
      </Link>
    </div>
  );
}
