"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { FormField } from "@/ui/components/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import {
  createWarehouseSchema,
  toCreateWarehouseDto,
  toUpdateWarehouseDto,
  type CreateWarehouseFormData,
} from "@/modules/inventory/presentation/schemas/warehouse.schema";
import {
  useCreateWarehouse,
  useUpdateWarehouse,
  useWarehouse,
} from "@/modules/inventory/presentation/hooks/use-warehouses";
import { useWarehouseFormState } from "@/modules/inventory/presentation/hooks/use-inventory-store";

export function WarehouseForm() {
  const t = useTranslations("inventory.warehouses");
  const tCommon = useTranslations("common");
  const { isOpen, editingId, close } = useWarehouseFormState();
  const { data: existingWarehouse, isLoading: isLoadingWarehouse } =
    useWarehouse(editingId || "");
  const createWarehouse = useCreateWarehouse();
  const updateWarehouse = useUpdateWarehouse();

  const isEditing = Boolean(editingId);
  const isSubmitting = createWarehouse.isPending || updateWarehouse.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWarehouseFormData>({
    resolver: zodResolver(createWarehouseSchema),
    defaultValues: {
      code: "",
      name: "",
      address: "",
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (isEditing && existingWarehouse) {
      reset({
        code: existingWarehouse.code,
        name: existingWarehouse.name,
        address: existingWarehouse.address || "",
      });
    } else if (!isEditing) {
      reset({
        code: "",
        name: "",
        address: "",
      });
    }
  }, [isEditing, existingWarehouse, reset]);

  const onSubmit = async (data: CreateWarehouseFormData) => {
    try {
      if (isEditing && editingId) {
        const dto = toUpdateWarehouseDto(data);
        await updateWarehouse.mutateAsync({ id: editingId, data: dto });
      } else {
        const dto = toCreateWarehouseDto(data);
        await createWarehouse.mutateAsync(dto);
      }
      close();
      reset();
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleClose = () => {
    close();
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-lg mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {isEditing ? t("form.editTitle") : t("form.createTitle")}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingWarehouse && isEditing ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <fieldset disabled={isSubmitting} className="space-y-4">
                {(createWarehouse.isError || updateWarehouse.isError) && (
                  <div className="rounded-md bg-error-100 p-3 text-sm text-error-700 dark:bg-error-900/20 dark:text-error-400">
                    {t("form.error")}
                  </div>
                )}

                <FormField error={errors.code?.message}>
                  <Label htmlFor="code">{t("fields.code")}</Label>
                  <Input
                    id="code"
                    placeholder={t("fields.codePlaceholder")}
                    {...register("code")}
                  />
                </FormField>

                <FormField error={errors.name?.message}>
                  <Label htmlFor="name">{t("fields.name")}</Label>
                  <Input
                    id="name"
                    placeholder={t("fields.namePlaceholder")}
                    {...register("name")}
                  />
                </FormField>

                <FormField error={errors.address?.message}>
                  <Label htmlFor="address">{t("fields.address")}</Label>
                  <Input
                    id="address"
                    placeholder={t("fields.addressPlaceholder")}
                    {...register("address")}
                  />
                </FormField>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    {tCommon("cancel")}
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? tCommon("loading")
                      : isEditing
                        ? tCommon("save")
                        : tCommon("create")}
                  </Button>
                </div>
              </fieldset>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
