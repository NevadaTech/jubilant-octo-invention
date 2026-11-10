"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { PasswordInput } from "@/ui/components/password-input";
import { Label } from "@/ui/components/label";
import { FormField } from "@/ui/components/form-field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/ui/components/dialog";
import {
  createUserSchema,
  toCreateUserDto,
  type CreateUserFormData,
} from "@/modules/users/presentation/schemas/user.schema";
import { useCreateUser } from "@/modules/users/presentation/hooks/use-users";

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserForm({ open, onOpenChange }: UserFormProps) {
  const t = useTranslations("users");
  const tCommon = useTranslations("common");
  const createUser = useCreateUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      const dto = toCreateUserDto(data);
      await createUser.mutateAsync(dto);
      onOpenChange(false);
      reset();
    } catch {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    if (createUser.isPending) return;
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="max-w-[500px] gap-2.5 rounded-2xl p-5 shadow-none sm:rounded-2xl">
        <p className="text-xs font-semibold text-primary">{t("title")}</p>
        <DialogTitle className="text-lg font-semibold text-foreground">
          {t("form.createTitle")}
        </DialogTitle>
        <DialogDescription>{t("form.consequence")}</DialogDescription>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-1">
          <fieldset disabled={createUser.isPending} className="space-y-3">
            {createUser.isError ? (
              <p className="rounded-lg bg-error-100 px-3 py-2 text-sm text-destructive">
                {t("form.error")}
              </p>
            ) : null}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField error={errors.firstName?.message}>
                <Label>{t("fields.firstName")}</Label>
                <Input placeholder="John" {...register("firstName")} />
              </FormField>
              <FormField error={errors.lastName?.message}>
                <Label>{t("fields.lastName")}</Label>
                <Input placeholder="Doe" {...register("lastName")} />
              </FormField>
            </div>

            <FormField error={errors.email?.message}>
              <Label>{t("fields.email")}</Label>
              <Input
                type="email"
                placeholder="john@example.com"
                {...register("email")}
              />
            </FormField>

            <FormField error={errors.username?.message}>
              <Label>{t("fields.username")}</Label>
              <Input placeholder="johndoe" {...register("username")} />
            </FormField>

            <FormField error={errors.password?.message}>
              <Label>{t("fields.password")}</Label>
              <PasswordInput
                placeholder="********"
                autoComplete="new-password"
                {...register("password")}
              />
            </FormField>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={createUser.isPending}
              >
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={createUser.isPending}>
                {createUser.isPending ? tCommon("loading") : tCommon("create")}
              </Button>
            </div>
          </fieldset>
        </form>
      </DialogContent>
    </Dialog>
  );
}
