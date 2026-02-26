"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { FormField } from "@/ui/components/form-field";
import {
  loginSchema,
  type LoginDto,
} from "@/modules/authentication/application/dto/login.dto";
import { useLogin } from "@/modules/authentication/presentation/hooks/use-login";
import { AuthApiError } from "@/modules/authentication/infrastructure/errors/auth-api.error";

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {tErrors(getAuthErrorKey(error))}
        </div>
      )}

      <FormField error={errors.organizationSlug?.message}>
        <Label htmlFor="organizationSlug">{t("organization")}</Label>
        <Input
          id="organizationSlug"
          type="text"
          placeholder={t("organizationPlaceholder")}
          autoComplete="organization"
          {...register("organizationSlug")}
        />
      </FormField>

      <FormField error={errors.email?.message}>
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          {...register("email")}
        />
      </FormField>

      <FormField error={errors.password?.message}>
        <Label htmlFor="password">{t("password")}</Label>
        <Input
          id="password"
          type="password"
          placeholder={t("passwordPlaceholder")}
          autoComplete="current-password"
          {...register("password")}
        />
      </FormField>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
