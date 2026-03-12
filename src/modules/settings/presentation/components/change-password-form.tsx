"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/ui/components/button";
import { PasswordInput } from "@/ui/components/password-input";
import { Label } from "@/ui/components/label";
import { Card } from "@/ui/components/card";
import { FormField } from "@/ui/components/form-field";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/modules/settings/presentation/schemas/change-password.schema";
import { useChangePassword } from "@/modules/settings/presentation/hooks/use-change-password";

export function ChangePasswordForm() {
  const t = useTranslations("settings.password");
  const { mutate, isPending } = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
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
      onSuccess: () => reset(),
    });
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {t("title")}
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {t("description")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
        <FormField error={errors.currentPassword?.message}>
          <Label htmlFor="currentPassword">{t("currentPassword")}</Label>
          <PasswordInput
            id="currentPassword"
            autoComplete="current-password"
            {...register("currentPassword")}
          />
        </FormField>

        <FormField error={errors.newPassword?.message}>
          <Label htmlFor="newPassword">{t("newPassword")}</Label>
          <PasswordInput
            id="newPassword"
            autoComplete="new-password"
            {...register("newPassword")}
          />
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
            {t("requirements")}
          </p>
        </FormField>

        <FormField error={errors.confirmPassword?.message}>
          <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
        </FormField>

        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("changePassword")}
        </Button>
      </form>
    </Card>
  );
}
