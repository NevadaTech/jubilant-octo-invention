"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { PasswordInput } from "@/ui/components/password-input";
import {
  loginSchema,
  type LoginDto,
} from "@/modules/authentication/application/dto/login.dto";
import { useLogin } from "@/modules/authentication/presentation/hooks/use-login";
import { AuthApiError } from "@/modules/authentication/infrastructure/errors/auth-api.error";
import {
  AuthDescription,
  AuthField,
  AuthSplit,
  AuthTitle,
  authControlClass,
} from "@/modules/authentication/presentation/components/auth-shell";

const AUTH_ERROR_KEYS = [
  "unauthorized",
  "forbidden",
  "serverError",
  "generic",
] as const;

type AuthErrorKey = (typeof AUTH_ERROR_KEYS)[number];

function getAuthErrorKey(error: unknown): AuthErrorKey {
  if (
    error instanceof AuthApiError &&
    AUTH_ERROR_KEYS.includes(error.code as AuthErrorKey)
  ) {
    return error.code as AuthErrorKey;
  }
  return "generic";
}

export function LoginForm() {
  const t = useTranslations("auth.login");
  const tErrors = useTranslations("auth.errors");
  const { login, isLoading, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      organizationSlug: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginDto) => {
    login(data);
  };

  const authError = error ? tErrors(getAuthErrorKey(error)) : undefined;
  const passwordError = errors.password?.message ?? authError;

  return (
    <AuthSplit>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <AuthTitle>{t("title")}</AuthTitle>
        <AuthDescription>{t("description")}</AuthDescription>

        <AuthField
          id="organizationSlug"
          label={t("organization")}
          error={errors.organizationSlug?.message}
        >
          <Input
            id="organizationSlug"
            type="text"
            placeholder={t("organizationPlaceholder")}
            autoComplete="organization"
            aria-invalid={Boolean(errors.organizationSlug)}
            aria-describedby={
              errors.organizationSlug ? "organizationSlug-error" : undefined
            }
            className={authControlClass(Boolean(errors.organizationSlug))}
            {...register("organizationSlug")}
          />
        </AuthField>

        <AuthField id="email" label={t("email")} error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            placeholder={t("emailPlaceholder")}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={authControlClass(Boolean(errors.email))}
            {...register("email")}
          />
        </AuthField>

        <AuthField id="password" label={t("password")} error={passwordError}>
          <PasswordInput
            id="password"
            placeholder={t("passwordPlaceholder")}
            autoComplete="current-password"
            aria-invalid={Boolean(passwordError)}
            aria-describedby={passwordError ? "password-error" : undefined}
            className={authControlClass(Boolean(passwordError))}
            {...register("password")}
          />
        </AuthField>

        <Button
          type="submit"
          className="w-full rounded-lg"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? t("submitting") : t("submit")}
        </Button>

        <Link
          href="/forgot-password"
          className="w-fit text-sm font-semibold text-primary"
        >
          {t("forgotPassword")}
        </Link>
      </form>
    </AuthSplit>
  );
}
