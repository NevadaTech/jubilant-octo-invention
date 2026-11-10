"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { PasswordInput } from "@/ui/components/password-input";
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
import {
  AuthCentered,
  AuthDescription,
  AuthField,
  AuthSplit,
  AuthTitle,
  authControlClass,
} from "@/modules/authentication/presentation/components/auth-shell";

type Step = "email" | "otp" | "password" | "success";

const OTP_LENGTH = 6;

function messageFrom(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPassword");
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [organizationSlug, setOrganizationSlug] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [digits, setDigits] = useState<string[]>(() =>
    Array.from({ length: OTP_LENGTH }, () => ""),
  );
  const digitRefs = useRef<Array<HTMLInputElement | null>>([]);

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

  const otpForm = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otpCode: "" },
  });

  const applyDigits = (next: string[]) => {
    const normalized = Array.from({ length: OTP_LENGTH }, (_, index) =>
      (next[index] ?? "").replace(/\D/g, "").slice(0, 1),
    );
    setDigits(normalized);
    otpForm.setValue("otpCode", normalized.join(""), {
      shouldDirty: true,
      shouldValidate: normalized.join("").length === OTP_LENGTH,
    });
  };

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
    const requestError = requestReset.error
      ? messageFrom(requestReset.error, t("description"))
      : undefined;

    return (
      <AuthSplit>
        <form
          onSubmit={emailForm.handleSubmit(onEmailSubmit)}
          className="flex flex-col gap-4"
        >
          <AuthTitle>{t("title")}</AuthTitle>
          <AuthDescription>{t("description")}</AuthDescription>

          <AuthField
            id="organizationSlug"
            label={t("organization")}
            error={emailForm.formState.errors.organizationSlug?.message}
          >
            <Input
              id="organizationSlug"
              type="text"
              placeholder={t("organizationPlaceholder")}
              autoComplete="organization"
              aria-invalid={Boolean(
                emailForm.formState.errors.organizationSlug,
              )}
              aria-describedby={
                emailForm.formState.errors.organizationSlug
                  ? "organizationSlug-error"
                  : undefined
              }
              className={authControlClass(
                Boolean(emailForm.formState.errors.organizationSlug),
              )}
              {...emailForm.register("organizationSlug")}
            />
          </AuthField>

          <AuthField
            id="resetEmail"
            label={t("enterEmail")}
            error={emailForm.formState.errors.email?.message ?? requestError}
          >
            <Input
              id="resetEmail"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={Boolean(
                emailForm.formState.errors.email || requestError,
              )}
              aria-describedby={
                emailForm.formState.errors.email || requestError
                  ? "resetEmail-error"
                  : undefined
              }
              className={authControlClass(
                Boolean(emailForm.formState.errors.email || requestError),
              )}
              {...emailForm.register("email")}
            />
          </AuthField>

          <Button
            type="submit"
            className="w-full rounded-lg"
            disabled={requestReset.isPending}
          >
            {requestReset.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {requestReset.isPending ? t("sending") : t("sendCode")}
          </Button>

          <Link
            href="/login"
            className="w-fit text-sm font-semibold text-primary"
          >
            {t("backToLogin")}
          </Link>
        </form>
      </AuthSplit>
    );
  }

  if (step === "otp") {
    const otpError =
      otpForm.formState.errors.otpCode?.message ??
      (verifyOtp.error
        ? messageFrom(verifyOtp.error, t("invalidCode"))
        : undefined);

    return (
      <AuthCentered>
        <form
          onSubmit={otpForm.handleSubmit(onOtpSubmit)}
          className="flex flex-col gap-4"
        >
          <AuthTitle>{t("checkEmail")}</AuthTitle>
          <AuthDescription>
            {t("checkEmailDescription", { email })}
          </AuthDescription>

          <input type="hidden" {...otpForm.register("otpCode")} />

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between gap-2">
              {digits.map((digit, index) => (
                <Input
                  key={index}
                  ref={(node) => {
                    digitRefs.current[index] = node;
                  }}
                  value={digit}
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  aria-label={`${t("enterOtp")} ${index + 1}`}
                  aria-invalid={Boolean(otpError)}
                  className="h-[52px] w-11 rounded-lg bg-card px-0 text-center text-xl font-semibold lg:h-[60px] lg:w-[52px] lg:bg-background lg:text-[22px]"
                  onChange={(event) => {
                    const cleaned = event.target.value.replace(/\D/g, "");
                    if (cleaned.length > 1) {
                      applyDigits(cleaned.split(""));
                      const focusIndex = Math.min(cleaned.length, OTP_LENGTH) - 1;
                      digitRefs.current[Math.max(focusIndex, 0)]?.focus();
                      return;
                    }
                    const next = [...digits];
                    next[index] = cleaned;
                    applyDigits(next);
                    if (cleaned && index < OTP_LENGTH - 1) {
                      digitRefs.current[index + 1]?.focus();
                    }
                  }}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Backspace" &&
                      !digits[index] &&
                      index > 0
                    ) {
                      digitRefs.current[index - 1]?.focus();
                    }
                  }}
                  onPaste={(event) => {
                    const text = event.clipboardData
                      .getData("text")
                      .replace(/\D/g, "")
                      .slice(0, OTP_LENGTH);
                    if (!text) return;
                    event.preventDefault();
                    applyDigits(text.split(""));
                    const focusIndex = Math.min(text.length, OTP_LENGTH) - 1;
                    digitRefs.current[Math.max(focusIndex, 0)]?.focus();
                  }}
                />
              ))}
            </div>
            {otpError ? (
              <p role="alert" className="text-[13px] leading-snug text-destructive">
                {otpError}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            className="w-full rounded-lg"
            disabled={verifyOtp.isPending}
          >
            {verifyOtp.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {verifyOtp.isPending ? t("verifying") : t("verifyCode")}
          </Button>

          <div>
            {cooldown > 0 ? (
              <span className="text-[13px] text-muted-foreground">
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
                className="text-sm font-semibold text-primary disabled:opacity-50"
              >
                {requestReset.isPending ? (
                  <Loader2 className="mr-2 inline h-3 w-3 animate-spin" />
                ) : null}
                {t("requestNew")}
              </button>
            )}
          </div>
        </form>
      </AuthCentered>
    );
  }

  if (step === "password") {
    const resetError = resetPassword.error
      ? messageFrom(resetPassword.error, t("resetPassword"))
      : undefined;

    return (
      <AuthCentered>
        <form
          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
          className="flex flex-col gap-4"
        >
          <AuthTitle>{t("newPassword")}</AuthTitle>

          <AuthField
            id="newPassword"
            label={t("newPassword")}
            error={passwordForm.formState.errors.newPassword?.message}
          >
            <PasswordInput
              id="newPassword"
              autoComplete="new-password"
              aria-invalid={Boolean(
                passwordForm.formState.errors.newPassword,
              )}
              aria-describedby={
                passwordForm.formState.errors.newPassword
                  ? "newPassword-error"
                  : undefined
              }
              className={authControlClass(
                Boolean(passwordForm.formState.errors.newPassword),
              )}
              {...passwordForm.register("newPassword")}
            />
          </AuthField>

          <AuthField
            id="confirmPassword"
            label={t("confirmPassword")}
            error={
              passwordForm.formState.errors.confirmPassword?.message ??
              resetError
            }
          >
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              aria-invalid={Boolean(
                passwordForm.formState.errors.confirmPassword || resetError,
              )}
              aria-describedby={
                passwordForm.formState.errors.confirmPassword || resetError
                  ? "confirmPassword-error"
                  : undefined
              }
              className={authControlClass(
                Boolean(
                  passwordForm.formState.errors.confirmPassword || resetError,
                ),
              )}
              {...passwordForm.register("confirmPassword")}
            />
          </AuthField>

          <p className="text-[13px] leading-snug text-muted-foreground">
            {t("requirements")}
          </p>

          <Button
            type="submit"
            className="w-full rounded-lg"
            disabled={resetPassword.isPending}
          >
            {resetPassword.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {resetPassword.isPending ? t("resetting") : t("resetPassword")}
          </Button>
        </form>
      </AuthCentered>
    );
  }

  return (
    <AuthCentered width="420">
      <div className="flex flex-col gap-3">
        <AuthTitle>{t("success")}</AuthTitle>
        <AuthDescription>{t("successDescription")}</AuthDescription>
        <Button asChild className="w-full rounded-lg">
          <Link href="/login">{t("backToLogin")}</Link>
        </Button>
      </div>
    </AuthCentered>
  );
}
