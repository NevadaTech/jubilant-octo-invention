"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { PasswordInput } from "@/ui/components/password-input";
import { Label } from "@/ui/components/label";
import { FormField } from "@/ui/components/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
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
    onOpenChange(false);
    reset();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("form.createTitle")}</CardTitle>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset disabled={createUser.isPending} className="space-y-4">
              {createUser.isError && (
                <div className="rounded-md bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  {t("form.error")}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField error={errors.firstName?.message}>
                  <Label>{t("fields.firstName")} *</Label>
                  <Input placeholder="John" {...register("firstName")} />
                </FormField>
                <FormField error={errors.lastName?.message}>
                  <Label>{t("fields.lastName")} *</Label>
                  <Input placeholder="Doe" {...register("lastName")} />
                </FormField>
              </div>

              <FormField error={errors.email?.message}>
                <Label>{t("fields.email")} *</Label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  {...register("email")}
                />
              </FormField>

              <FormField error={errors.username?.message}>
                <Label>{t("fields.username")} *</Label>
                <Input placeholder="johndoe" {...register("username")} />
              </FormField>

              <FormField error={errors.password?.message}>
                <Label>{t("fields.password")} *</Label>
                <PasswordInput
                  placeholder="********"
                  autoComplete="new-password"
                  {...register("password")}
                />
              </FormField>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleClose}>
                  {tCommon("cancel")}
                </Button>
                <Button type="submit" disabled={createUser.isPending}>
                  {createUser.isPending
                    ? tCommon("loading")
                    : tCommon("create")}
                </Button>
              </div>
            </fieldset>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
