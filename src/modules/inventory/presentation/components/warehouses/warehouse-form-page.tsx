"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
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

interface WarehouseFormPageProps {
  warehouseId?: string;
}

export function WarehouseFormPage({ warehouseId }: WarehouseFormPageProps) {
  const t = useTranslations("inventory.warehouses");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const isEditing = Boolean(warehouseId);

  const { data: existingWarehouse, isLoading: isLoadingWarehouse } =
    useWarehouse(warehouseId || "");
  const createWarehouse = useCreateWarehouse();
  const updateWarehouse = useUpdateWarehouse();

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
    }
  }, [isEditing, existingWarehouse, reset]);

  const onSubmit = async (data: CreateWarehouseFormData) => {
    try {
      if (isEditing && warehouseId) {
        const dto = toUpdateWarehouseDto(data);
        await updateWarehouse.mutateAsync({ id: warehouseId, data: dto });
        router.push(`/dashboard/inventory/warehouses/${warehouseId}`);
      } else {
        const dto = toCreateWarehouseDto(data);
        const newWarehouse = await createWarehouse.mutateAsync(dto);
        router.push(`/dashboard/inventory/warehouses/${newWarehouse.id}`);
      }
    } catch {
      // Error is handled by the mutation
    }
  };

  if (isLoadingWarehouse && isEditing) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/inventory/warehouses">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {isEditing ? t("form.editTitle") : t("form.createTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing
              ? t("form.editDescription")
              : t("form.createDescription")}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t("form.warehouseInfo")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {(createWarehouse.isError || updateWarehouse.isError) && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {t("form.error")}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField error={errors.code?.message}>
                <Label htmlFor="code">{t("fields.code")} *</Label>
                <Input
                  id="code"
                  placeholder={t("fields.codePlaceholder")}
                  {...register("code")}
                />
              </FormField>

              <FormField error={errors.name?.message}>
                <Label htmlFor="name">{t("fields.name")} *</Label>
                <Input
                  id="name"
                  placeholder={t("fields.namePlaceholder")}
                  {...register("name")}
                />
              </FormField>
            </div>

            <FormField error={errors.address?.message}>
              <Label htmlFor="address">{t("fields.address")}</Label>
              <Input
                id="address"
                placeholder={t("fields.addressPlaceholder")}
                {...register("address")}
              />
            </FormField>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t pt-6">
              <Button asChild type="button" variant="outline">
                <Link href="/dashboard/inventory/warehouses">
                  {tCommon("cancel")}
                </Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting
                  ? tCommon("loading")
                  : isEditing
                    ? tCommon("save")
                    : tCommon("create")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
