"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { CurrencyInput } from "@/ui/components/currency-input";
import { Label } from "@/ui/components/label";
import { FormField } from "@/ui/components/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/select";
import { Skeleton } from "@/ui/components/skeleton";
import { Textarea } from "@/ui/components/textarea";
import {
  createMovementSchema,
  toCreateMovementDto,
  type CreateMovementFormData,
} from "@/modules/inventory/presentation/schemas/movement.schema";
import {
  useCreateMovement,
  useUpdateMovement,
  useMovement,
} from "@/modules/inventory/presentation/hooks/use-movements";
import { useProducts } from "@/modules/inventory/presentation/hooks/use-products";
import { useWarehouses } from "@/modules/inventory/presentation/hooks/use-warehouses";
import type { UpdateStockMovementDto } from "@/modules/inventory/application/dto/stock-movement.dto";

interface MovementFormPageProps {
  movementId?: string;
}

export function MovementFormPage({ movementId }: MovementFormPageProps) {
  const isEditing = Boolean(movementId);
  const t = useTranslations("inventory.movements");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo =
    searchParams.get("returnTo") ?? "/dashboard/inventory/movements";

  const createMovement = useCreateMovement();
  const updateMovement = useUpdateMovement();
  const { data: existingMovement, isLoading: isLoadingMovement } = useMovement(
    movementId ?? "",
  );
  const { data: productsData } = useProducts({ limit: 100, isActive: true });
  const { data: warehousesData } = useWarehouses({
    limit: 100,
    isActive: true,
  });

  const isSubmitting = isEditing
    ? updateMovement.isPending
    : createMovement.isPending;
  const isError = isEditing ? updateMovement.isError : createMovement.isError;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateMovementFormData>({
    resolver: zodResolver(createMovementSchema),
    defaultValues: {
      warehouseId: "",
      type: "IN",
      reference: "",
      reason: "",
      note: "",
      lines: [{ productId: "", quantity: 1, unitCost: undefined }],
    },
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (isEditing && existingMovement) {
      reset({
        warehouseId: existingMovement.warehouseId,
        type: existingMovement.type as import("../../schemas/movement.schema").ManualMovementType,
        reference: existingMovement.reference ?? "",
        reason: existingMovement.reason ?? "",
        note: existingMovement.note ?? "",
        lines: existingMovement.lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          unitCost: l.unitCost ?? undefined,
        })),
      });
    }
  }, [isEditing, existingMovement, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const onSubmit = async (data: CreateMovementFormData) => {
    try {
      if (isEditing && movementId) {
        const dto: UpdateStockMovementDto = {
          reference: data.reference || undefined,
          reason: data.reason || undefined,
          note: data.note || undefined,
          lines: data.lines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
            unitCost: line.unitCost,
          })),
        };
        await updateMovement.mutateAsync({ id: movementId, data: dto });
      } else {
        const dto = toCreateMovementDto(data);
        await createMovement.mutateAsync(dto);
      }
      router.push(returnTo);
    } catch {
      // Error is handled by the mutation
    }
  };

  const addLine = () => {
    append({ productId: "", quantity: 1, unitCost: undefined });
  };

  if (isEditing && isLoadingMovement) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href={returnTo}>
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {isError && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {isEditing ? t("form.updateError") : t("form.error")}
          </div>
        )}

        {/* Movement Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t("form.movementInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Movement Type */}
              <FormField error={errors.type?.message}>
                <Label>{t("fields.type")} *</Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger disabled={isEditing}>
                        <SelectValue>
                          {field.value
                            ? t(`types.${field.value.toLowerCase()}`)
                            : undefined}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IN">{t("types.in")}</SelectItem>
                        <SelectItem value="OUT">{t("types.out")}</SelectItem>
                        <SelectItem value="ADJUST_IN">
                          {t("types.adjust_in")}
                        </SelectItem>
                        <SelectItem value="ADJUST_OUT">
                          {t("types.adjust_out")}
                        </SelectItem>
                        <SelectItem value="TRANSFER_IN">
                          {t("types.transfer_in")}
                        </SelectItem>
                        <SelectItem value="TRANSFER_OUT">
                          {t("types.transfer_out")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>

              {/* Warehouse Selection */}
              <FormField error={errors.warehouseId?.message}>
                <Label>{t("fields.warehouse")} *</Label>
                <Controller
                  name="warehouseId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger disabled={isEditing}>
                        <SelectValue
                          placeholder={t("fields.warehousePlaceholder")}
                        >
                          {field.value
                            ? (() => {
                                const w = warehousesData?.data.find(
                                  (wh) => wh.id === field.value,
                                );
                                return w ? `${w.name} (${w.code})` : undefined;
                              })()
                            : undefined}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {warehousesData?.data.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name} ({warehouse.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Reference */}
              <FormField error={errors.reference?.message}>
                <Label>{t("fields.reference")}</Label>
                <Input
                  placeholder={t("fields.referencePlaceholder")}
                  {...register("reference")}
                />
              </FormField>

              {/* Reason */}
              <FormField error={errors.reason?.message}>
                <Label>{t("fields.reason")}</Label>
                <Input
                  placeholder={t("fields.reasonPlaceholder")}
                  {...register("reason")}
                />
              </FormField>
            </div>

            {/* Note */}
            <FormField error={errors.note?.message}>
              <Label>{t("fields.note")}</Label>
              <Textarea
                placeholder={t("fields.notePlaceholder")}
                rows={2}
                {...register("note")}
              />
            </FormField>
          </CardContent>
        </Card>

        {/* Products Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t("form.linesSection")}</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLine}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("actions.addLine")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {errors.lines?.message && (
              <p className="mb-4 text-sm text-destructive">
                {errors.lines.message}
              </p>
            )}

            {fields.length === 0 ? (
              <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
                {t("form.noLines")}
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-start gap-4 rounded-lg border p-4"
                  >
                    <div className="flex-1 grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <FormField
                        error={errors.lines?.[index]?.productId?.message}
                      >
                        <Label>{t("fields.product")} *</Label>
                        <Controller
                          name={`lines.${index}.productId`}
                          control={control}
                          render={({ field: selectField }) => (
                            <Select
                              value={selectField.value}
                              onValueChange={selectField.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={t("fields.productPlaceholder")}
                                >
                                  {selectField.value
                                    ? (() => {
                                        const p = productsData?.data.find(
                                          (pr) => pr.id === selectField.value,
                                        );
                                        return p
                                          ? `${p.name} (${p.sku})`
                                          : undefined;
                                      })()
                                    : undefined}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {productsData?.data.map((product) => (
                                  <SelectItem
                                    key={product.id}
                                    value={product.id}
                                  >
                                    {product.name} ({product.sku})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </FormField>

                      <FormField
                        error={errors.lines?.[index]?.quantity?.message}
                      >
                        <Label>{t("fields.quantity")} *</Label>
                        <Input
                          type="number"
                          min="1"
                          {...register(`lines.${index}.quantity`, {
                            valueAsNumber: true,
                          })}
                        />
                      </FormField>

                      <FormField
                        error={errors.lines?.[index]?.unitCost?.message}
                      >
                        <Label>{t("fields.unitCost")}</Label>
                        <Controller
                          name={`lines.${index}.unitCost`}
                          control={control}
                          render={({ field }) => (
                            <CurrencyInput
                              value={field.value}
                              onChange={(val) =>
                                field.onChange(val || undefined)
                              }
                            />
                          )}
                        />
                      </FormField>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-6"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button asChild type="button" variant="outline">
            <Link href={returnTo}>{tCommon("cancel")}</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting
              ? tCommon("loading")
              : isEditing
                ? tCommon("save")
                : tCommon("create")}
          </Button>
        </div>
      </form>
    </div>
  );
}
