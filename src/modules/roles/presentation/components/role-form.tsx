"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { FormField } from "@/ui/components/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Textarea } from "@/ui/components/textarea";
import {
  createRoleSchema,
  toCreateRoleDto,
  type CreateRoleFormData,
} from "@/modules/roles/presentation/schemas/role.schema";
import { useCreateRole } from "@/modules/roles/presentation/hooks/use-roles";

interface RoleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoleForm({ open, onOpenChange }: RoleFormProps) {
  const t = useTranslations("roles");
  const tCommon = useTranslations("common");
  const createRole = useCreateRole();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: CreateRoleFormData) => {
    try {
      const dto = toCreateRoleDto(data);
      await createRole.mutateAsync(dto);
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
            <fieldset disabled={createRole.isPending} className="space-y-4">
              {createRole.isError && (
                <div className="rounded-md bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  {t("form.error")}
                </div>
              )}

              <FormField error={errors.name?.message}>
                <Label>{t("fields.name")} *</Label>
                <Input
                  placeholder={t("fields.namePlaceholder")}
                  {...register("name")}
                />
              </FormField>

              <FormField error={errors.description?.message}>
                <Label>{t("fields.description")}</Label>
                <Textarea
                  placeholder={t("fields.descriptionPlaceholder")}
                  {...register("description")}
                />
              </FormField>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleClose}>
                  {tCommon("cancel")}
                </Button>
                <Button type="submit" disabled={createRole.isPending}>
                  {createRole.isPending
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
