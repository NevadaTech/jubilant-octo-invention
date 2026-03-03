"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2, ShieldAlert } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/ui/components/button";
import { PasswordInput } from "@/ui/components/password-input";
import { Label } from "@/ui/components/label";
import { FormField } from "@/ui/components/form-field";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/modules/settings/presentation/schemas/change-password.schema";
import { useChangePassword } from "@/modules/settings/presentation/hooks/use-change-password";
import { TokenService } from "@/modules/authentication/infrastructure/services/token.service";

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-start gap-3 rounded-md bg-amber-50 p-3 dark:bg-amber-950/30">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-sm text-amber-800 dark:text-amber-200">
          {t("warning")}
        </p>
      </div>

      <FormField error={errors.currentPassword?.message}>
        <Label htmlFor="currentPassword">{tPassword("currentPassword")}</Label>
        <PasswordInput
          id="currentPassword"
          autoComplete="current-password"
          {...register("currentPassword")}
        />
      </FormField>

      <FormField error={errors.newPassword?.message}>
        <Label htmlFor="newPassword">{tPassword("newPassword")}</Label>
        <PasswordInput
          id="newPassword"
          autoComplete="new-password"
          {...register("newPassword")}
        />
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
          {tPassword("requirements")}
        </p>
      </FormField>

      <FormField error={errors.confirmPassword?.message}>
        <Label htmlFor="confirmPassword">{tPassword("confirmPassword")}</Label>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          {...register("confirmPassword")}
        />
      </FormField>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
