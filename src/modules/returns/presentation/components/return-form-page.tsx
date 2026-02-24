"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
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
import { SearchableSelect } from "@/ui/components/searchable-select";
import { useCreateReturn } from "../hooks/use-returns";
import { useProducts } from "@/modules/inventory/presentation/hooks/use-products";
import { useWarehouses } from "@/modules/inventory/presentation/hooks/use-warehouses";
import {
  useSales,
  useSale,
} from "@/modules/sales/presentation/hooks/use-sales";

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
  const { data: salesData } = useSales({ limit: 100 });

  const salesOptions = useMemo(
    () =>
      (salesData?.data ?? [])
        .filter((s) => s.status !== "DRAFT" && s.status !== "CANCELLED")
        .map((sale) => ({
          value: sale.id,
          label: sale.saleNumber,
          description: `${sale.warehouseName} — ${sale.currency} ${sale.totalAmount.toLocaleString()}`,
        })),
    [salesData],
  );

  const isSubmitting = createReturn.isPending;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
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
  const selectedSaleId = watch("saleId");

  // Fetch sale detail when a sale is selected
  const { data: selectedSale } = useSale(selectedSaleId || "");

  // Build product options from the selected sale's lines
  const saleLineProducts = useMemo(() => {
    if (!selectedSale?.lines?.length) return [];
    return selectedSale.lines.map((line) => ({
      productId: line.productId,
      productName: line.productName,
      productSku: line.productSku,
      quantity: line.quantity,
      salePrice: line.salePrice,
      currency: line.currency,
    }));
  }, [selectedSale]);

  // Map productId → sale line info for quick lookup
  const saleLineMap = useMemo(() => {
    const map = new Map<
      string,
      { quantity: number; salePrice: number; currency: string }
    >();
    for (const line of saleLineProducts) {
      map.set(line.productId, {
        quantity: line.quantity,
        salePrice: line.salePrice,
        currency: line.currency,
      });
    }
    return map;
  }, [saleLineProducts]);

  // Get max quantity for a line (from sale)
  const getMaxQuantity = useCallback(
    (productId: string) => saleLineMap.get(productId)?.quantity,
    [saleLineMap],
  );

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "lines",
  });

  // When customer return sale changes, reset lines to match sale products
  const prevSaleIdRef = useRef(selectedSaleId);
  useEffect(() => {
    if (prevSaleIdRef.current === selectedSaleId) return;
    prevSaleIdRef.current = selectedSaleId;

    if (returnType !== "RETURN_CUSTOMER" || !saleLineProducts.length) return;

    replace(
      saleLineProducts.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
        maxQuantity: line.quantity,
        originalSalePrice: line.salePrice,
        originalUnitCost: undefined,
      })),
    );
  }, [selectedSaleId, returnType, saleLineProducts, replace]);

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

  // When a product is picked from the sale lines, auto-fill price & max
  const handleProductChange = useCallback(
    (index: number, productId: string) => {
      setValue(`lines.${index}.productId`, productId);
      const saleLine = saleLineMap.get(productId);
      if (saleLine) {
        setValue(`lines.${index}.originalSalePrice`, saleLine.salePrice);
        setValue(`lines.${index}.maxQuantity`, saleLine.quantity);
      }
    },
    [saleLineMap, setValue],
  );

  const isCustomerReturn = returnType === "RETURN_CUSTOMER";
  const hasSaleLines = isCustomerReturn && saleLineProducts.length > 0;

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
                <Label>{t("fields.saleReference")} *</Label>
                <Controller
                  name="saleId"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={salesOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder={t("fields.saleReferencePlaceholder")}
                      searchPlaceholder={t("fields.saleSearchPlaceholder")}
                      emptyMessage={t("fields.saleNotFound")}
                    />
                  )}
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
              {!hasSaleLines && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLine}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t("actions.addLine")}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {hasSaleLines && (
              <div className="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                {t("form.saleProductsHint")}
              </div>
            )}

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
                          render={({ field: selectField }) =>
                            hasSaleLines ? (
                              <Select
                                value={selectField.value}
                                onValueChange={(val) =>
                                  handleProductChange(index, val)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={t("fields.productPlaceholder")}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {saleLineProducts.map((line) => (
                                    <SelectItem
                                      key={line.productId}
                                      value={line.productId}
                                    >
                                      {line.productName} ({line.productSku})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
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
                            )
                          }
                        />
                      </FormField>

                      <FormField
                        error={errors.lines?.[index]?.quantity?.message}
                      >
                        <Label>
                          {t("fields.quantity")} *
                          {hasSaleLines &&
                            getMaxQuantity(field.productId) !== undefined && (
                              <span className="ml-1 text-xs font-normal text-muted-foreground">
                                (max: {getMaxQuantity(field.productId)})
                              </span>
                            )}
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          max={
                            hasSaleLines
                              ? getMaxQuantity(field.productId)
                              : undefined
                          }
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
                                disabled={hasSaleLines}
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
