"use client";

import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
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
import { Textarea } from "@/ui/components/textarea";
import {
  createReturnSchema,
  toCreateReturnDto,
  type CreateReturnFormData,
} from "../schemas/return.schema";
import { useCreateReturn } from "../hooks/use-returns";
import { useProducts } from "@/modules/inventory/presentation/hooks/use-products";
import { useWarehouses } from "@/modules/inventory/presentation/hooks/use-warehouses";

export function ReturnFormPage() {
  const t = useTranslations("returns");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const createReturn = useCreateReturn();
  const { data: productsData } = useProducts({ limit: 100, isActive: true });
  const { data: warehousesData } = useWarehouses({
    limit: 100,
    isActive: true,
  });

  const isSubmitting = createReturn.isPending;

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CreateReturnFormData>({
    resolver: zodResolver(createReturnSchema),
    defaultValues: {
      type: "RETURN_CUSTOMER",
      warehouseId: "",
      saleId: "",
      reason: "",
      note: "",
      lines: [
        {
          productId: "",
          quantity: 1,
          originalSalePrice: undefined,
          originalUnitCost: undefined,
        },
      ],
    },
  });

  const returnType = watch("type");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const onSubmit = async (data: CreateReturnFormData) => {
    try {
      const dto = toCreateReturnDto(data);
      await createReturn.mutateAsync(dto);
      router.push("/dashboard/returns");
    } catch {
      // Error is handled by the mutation
    }
  };

  const addLine = () => {
    append({
      productId: "",
      quantity: 1,
      originalSalePrice: undefined,
      originalUnitCost: undefined,
    });
  };

  const isCustomerReturn = returnType === "RETURN_CUSTOMER";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/returns">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {t("form.createTitle")}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            {t("form.createDescription")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {createReturn.isError && (
          <div className="rounded-md bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {t("form.error")}
          </div>
        )}

        {/* Return Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t("form.returnInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField error={errors.type?.message}>
                <Label>{t("fields.type")} *</Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RETURN_CUSTOMER">
                          {t("types.customer")}
                        </SelectItem>
                        <SelectItem value="RETURN_SUPPLIER">
                          {t("types.supplier")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>

              <FormField error={errors.warehouseId?.message}>
                <Label>{t("fields.warehouse")} *</Label>
                <Controller
                  name="warehouseId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("fields.warehousePlaceholder")}
                        />
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

            {isCustomerReturn && (
              <FormField error={errors.saleId?.message}>
                <Label>{t("fields.saleReference")}</Label>
                <Input
                  placeholder={t("fields.saleReferencePlaceholder")}
                  {...register("saleId")}
                />
              </FormField>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField error={errors.reason?.message}>
                <Label>{t("fields.reason")}</Label>
                <Input
                  placeholder={t("fields.reasonPlaceholder")}
                  {...register("reason")}
                />
              </FormField>

              <FormField error={errors.note?.message}>
                <Label>{t("fields.note")}</Label>
                <Textarea
                  placeholder={t("fields.notePlaceholder")}
                  rows={1}
                  {...register("note")}
                />
              </FormField>
            </div>
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
                                />
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

                      {isCustomerReturn ? (
                        <FormField
                          error={
                            errors.lines?.[index]?.originalSalePrice?.message
                          }
                        >
                          <Label>{t("fields.originalPrice")}</Label>
                          <Controller
                            name={`lines.${index}.originalSalePrice`}
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
                      ) : (
                        <FormField
                          error={
                            errors.lines?.[index]?.originalUnitCost?.message
                          }
                        >
                          <Label>{t("fields.originalCost")}</Label>
                          <Controller
                            name={`lines.${index}.originalUnitCost`}
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
                      )}
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
            <Link href="/dashboard/returns">{tCommon("cancel")}</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? tCommon("loading") : tCommon("create")}
          </Button>
        </div>
      </form>
    </div>
  );
}
