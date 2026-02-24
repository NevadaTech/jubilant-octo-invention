"use client";

import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
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
import { Textarea } from "@/ui/components/textarea";
import {
  createSaleSchema,
  toCreateSaleDto,
  type CreateSaleFormData,
} from "../schemas/sale.schema";
import { useCreateSale } from "../hooks/use-sales";
import { useProducts } from "@/modules/inventory/presentation/hooks/use-products";
import { useWarehouses } from "@/modules/inventory/presentation/hooks/use-warehouses";

export function SaleFormPage() {
  const t = useTranslations("sales");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const createSale = useCreateSale();
  const { data: productsData } = useProducts({ limit: 100, isActive: true });
  const { data: warehousesData } = useWarehouses({
    limit: 100,
    isActive: true,
  });

  const isSubmitting = createSale.isPending;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateSaleFormData>({
    resolver: zodResolver(createSaleSchema),
    defaultValues: {
      warehouseId: "",
      customerReference: "",
      externalReference: "",
      note: "",
      lines: [{ productId: "", quantity: 1, salePrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const onSubmit = async (data: CreateSaleFormData) => {
    try {
      const dto = toCreateSaleDto(data);
      await createSale.mutateAsync(dto);
      router.push("/dashboard/sales");
    } catch {
      // Error is handled by the mutation
    }
  };

  const addLine = () => {
    append({ productId: "", quantity: 1, salePrice: 0 });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/sales">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {t("form.createTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("form.createDescription")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {createSale.isError && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {t("form.error")}
          </div>
        )}

        {/* Sale Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t("form.saleInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField error={errors.customerReference?.message}>
                <Label>{t("fields.customer")}</Label>
                <Input
                  placeholder={t("fields.customerPlaceholder")}
                  {...register("customerReference")}
                />
              </FormField>

              <FormField error={errors.externalReference?.message}>
                <Label>{t("fields.externalReference")}</Label>
                <Input
                  placeholder={t("fields.externalReferencePlaceholder")}
                  {...register("externalReference")}
                />
              </FormField>
            </div>

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

                      <FormField
                        error={errors.lines?.[index]?.salePrice?.message}
                      >
                        <Label>{t("fields.salePrice")} *</Label>
                        <Controller
                          name={`lines.${index}.salePrice`}
                          control={control}
                          render={({ field }) => (
                            <CurrencyInput
                              value={field.value}
                              onChange={field.onChange}
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
            <Link href="/dashboard/sales">{tCommon("cancel")}</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? tCommon("loading") : tCommon("create")}
          </Button>
        </div>
      </form>
    </div>
  );
}
