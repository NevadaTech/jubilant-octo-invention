"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/ui/components/button";
import { PasswordInput } from "@/ui/components/password-input";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/modules/settings/presentation/schemas/change-password.schema";
import { useChangePassword } from "@/modules/settings/presentation/hooks/use-change-password";
import { TokenService } from "@/modules/authentication/infrastructure/services/token.service";
import {
  AuthField,
  AuthSplit,
  AuthTitle,
  authControlClass,
} from "@/modules/authentication/presentation/components/auth-shell";

export function ForceChangePasswordForm() {
  const t = useTranslations("auth.forceChangePassword");
  const tPassword = useTranslations("settings.password");
  const router = useRouter();
  const { mutate, isPending } = useChangePassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: ChangePasswordFormValues) => {
    mutate(data, {
      onSuccess: () => {
        const user = TokenService.getUser();
        if (user) {
          TokenService.setUser({ ...user, mustChangePassword: false });
        }
        router.push("/dashboard");
      },
    });
  };

  return (
    <AuthSplit>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <AuthTitle>{t("title")}</AuthTitle>

        <p className="rounded-lg bg-warning-100 p-3 text-sm leading-normal text-warning-600">
          {t("warning")}
        </p>

        <AuthField
          id="currentPassword"
          label={tPassword("currentPassword")}
          error={errors.currentPassword?.message}
        >
          <PasswordInput
            id="currentPassword"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.currentPassword)}
            aria-describedby={
              errors.currentPassword ? "currentPassword-error" : undefined
            }
            className={authControlClass(Boolean(errors.currentPassword))}
            {...register("currentPassword")}
          />
        </AuthField>

        <AuthField
          id="newPassword"
          label={tPassword("newPassword")}
          error={errors.newPassword?.message}
        >
          <PasswordInput
            id="newPassword"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.newPassword)}
            aria-describedby={
              errors.newPassword ? "newPassword-error" : undefined
            }
            className={authControlClass(Boolean(errors.newPassword))}
            {...register("newPassword")}
          />
        </AuthField>

        <p className="text-[13px] leading-snug text-muted-foreground">
          {tPassword("requirements")}
        </p>

        <AuthField
          id="confirmPassword"
          label={tPassword("confirmPassword")}
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={
              errors.confirmPassword ? "confirmPassword-error" : undefined
            }
            className={authControlClass(Boolean(errors.confirmPassword))}
            {...register("confirmPassword")}
          />
        </AuthField>

        <Button type="submit" className="w-full rounded-lg" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? t("submitting") : t("submit")}
        </Button>
      </form>
    </AuthSplit>
  );
}
