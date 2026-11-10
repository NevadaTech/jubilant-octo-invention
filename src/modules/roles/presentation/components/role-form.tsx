"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { FormField } from "@/ui/components/form-field";
import { Textarea } from "@/ui/components/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/ui/components/dialog";
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
    if (createRole.isPending) return;
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
        <DialogDescription>{t("description")}</DialogDescription>

        <form onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={createRole.isPending} className="space-y-3">
            {createRole.isError ? (
              <p className="rounded-lg bg-error-100 px-3 py-2 text-sm text-destructive">
                {t("form.error")}
              </p>
            ) : null}

            <FormField error={errors.name?.message}>
              <Label>{t("fields.name")}</Label>
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

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={createRole.isPending}
              >
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={createRole.isPending}>
                {createRole.isPending ? tCommon("loading") : tCommon("create")}
              </Button>
            </div>
          </fieldset>
        </form>
      </DialogContent>
    </Dialog>
  );
}
