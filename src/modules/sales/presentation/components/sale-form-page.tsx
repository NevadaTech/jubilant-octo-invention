"use client";

import { useMemo, useCallback } from "react";
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { PageHeader } from "@/ui/layout/page-header";
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
import { SearchableSelect } from "@/ui/components/searchable-select";
import { ProductSearchSelect } from "@/modules/inventory/presentation/components/shared/product-search-select";
import { ProductScanButton } from "@/modules/inventory/presentation/components/shared/product-scan-button";
import { ContactsSearchSelect } from "@/modules/contacts/presentation/components/shared/contacts-search-select";
import type { Product } from "@/modules/inventory/domain/entities/product.entity";
import { Textarea } from "@/ui/components/textarea";
import {
  createSaleSchema,
  toCreateSaleDto,
  type CreateSaleFormData,
} from "@/modules/sales/presentation/schemas/sale.schema";
import { useCreateSale } from "@/modules/sales/presentation/hooks/use-sales";
import { useCombos } from "@/modules/inventory/presentation/hooks/use-combos";
import { useWarehouses } from "@/modules/inventory/presentation/hooks/use-warehouses";
import { useCompanyStore } from "@/modules/companies/infrastructure/store/company.store";
import { CompanyRequiredGuard } from "@/modules/companies/presentation/components/company-required-guard";

export function SaleFormPage() {
  const t = useTranslations("sales");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const createSale = useCreateSale();
  const selectedCompanyId = useCompanyStore((s) => s.selectedCompanyId);
  const { data: combosData } = useCombos({ limit: 100, isActive: true });
  const { data: warehousesData } = useWarehouses({
    limit: 100,
    statuses: ["ACTIVE"],
  });

  const comboOptions = useMemo(() => {
    if (!combosData?.data) return [];
    return combosData.data.map((c) => ({
      value: c.id,
      label: c.name,
      description: `${c.sku} - $${c.price}`,
    }));
  }, [combosData]);

  const comboMap = useMemo(() => {
    if (!combosData?.data) return new Map<string, number>();
    return new Map(combosData.data.map((c) => [c.id, c.price]));
  }, [combosData]);

  const isSubmitting = createSale.isPending;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<CreateSaleFormData>({
    resolver: zodResolver(createSaleSchema),
    defaultValues: {
      warehouseId: "",
      contactId: "",
      customerReference: "",
      externalReference: "",
      note: "",
      lines: [
        {
          lineType: "product",
          productId: "",
          comboId: "",
          quantity: 1,
          salePrice: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const watchedLines = useWatch({ control, name: "lines" });

  const handleComboChange = useCallback(
    (index: number, comboId: string) => {
      setValue(`lines.${index}.comboId`, comboId);
      const price = comboMap.get(comboId);
      if (price !== undefined) {
        setValue(`lines.${index}.salePrice`, price);
      }
    },
    [setValue, comboMap],
  );

  /**
   * When a product is scanned, either bump the quantity of its existing
   * product line, fill the first empty product line, or append a new one.
   * Combo lines are ignored when matching — scanning only touches products.
   */
  const handleProductScanned = useCallback(
    (product: Product) => {
      const currentLines = getValues("lines");

      // 1) Same product already in a product-type line → bump quantity
      const existingIndex = currentLines.findIndex(
        (l) => l.lineType === "product" && l.productId === product.id,
      );
      if (existingIndex >= 0) {
        const current = currentLines[existingIndex].quantity ?? 0;
        setValue(`lines.${existingIndex}.quantity`, current + 1, {
          shouldDirty: true,
          shouldValidate: true,
        });
        return;
      }

      // 2) Empty product-type line → fill it in place
      const emptyIndex = currentLines.findIndex(
        (l) => l.lineType === "product" && !l.productId,
      );
      if (emptyIndex >= 0) {
        setValue(`lines.${emptyIndex}.productId`, product.id, {
          shouldDirty: true,
          shouldValidate: true,
        });
        setValue(`lines.${emptyIndex}.quantity`, 1, {
          shouldDirty: true,
          shouldValidate: true,
        });
        setValue(`lines.${emptyIndex}.salePrice`, product.price, {
          shouldDirty: true,
          shouldValidate: true,
        });
        return;
      }

      // 3) Otherwise → append a new product line with the product's price
      append({
        lineType: "product",
        productId: product.id,
        comboId: "",
        quantity: 1,
        salePrice: product.price,
      });
    },
    [getValues, setValue, append],
  );

  const onSubmit = async (data: CreateSaleFormData) => {
    if (!selectedCompanyId) return;
    try {
      const dto = toCreateSaleDto(data, selectedCompanyId);
      await createSale.mutateAsync(dto);
      router.push("/dashboard/sales");
    } catch {
      // Error is handled by the mutation
    }
  };

  const addLine = () => {
    append({
      lineType: "product",
      productId: "",
      comboId: "",
      quantity: 1,
      salePrice: 0,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <PageHeader
          title={t("form.createTitle")}
          description={t("form.createDescription")}
        />
        <Link
          href="/dashboard/sales"
          className="text-sm font-semibold text-primary"
        >
          {t("detail.backToList")}
        </Link>
      </div>

      <CompanyRequiredGuard>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {createSale.isError && (
          <div className="rounded-lg bg-error-100 px-3 py-3 text-sm text-error-800 dark:bg-error-900/30 dark:text-error-300">
            {t("form.error")}
          </div>
        )}

        {/* Sale Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t("form.saleInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
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

            <FormField error={errors.contactId?.message}>
              <Label>{t("fields.contact")} *</Label>
              <Controller
                name="contactId"
                control={control}
                render={({ field }) => (
                  <ContactsSearchSelect
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    placeholder={t("fields.contactPlaceholder")}
                    searchPlaceholder={tCommon("search")}
                    emptyMessage={tCommon("noResults")}
                    isActive={true}
                  />
                )}
              />
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
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

            <FormField error={errors.note?.message} className="lg:col-span-2">
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
            <div className="flex items-center justify-between gap-2">
              <CardTitle>{t("form.linesSection")}</CardTitle>
              <div className="flex items-center gap-2">
                <ProductScanButton
                  onProductScanned={handleProductScanned}
                  disabled={isSubmitting}
                />
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
                {fields.map((field, index) => {
                  const lineType = watchedLines?.[index]?.lineType ?? "product";
                  const isCombo = lineType === "combo";

                  return (
                    <div
                      key={field.id}
                      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3.5 lg:flex-row lg:items-start"
                    >
                      <div className="flex-1 space-y-4">
                        {/* Line type toggle */}
                        <FormField>
                          <Label>{t("form.lineType")}</Label>
                          <Controller
                            name={`lines.${index}.lineType`}
                            control={control}
                            render={({ field: typeField }) => (
                              <Select
                                value={typeField.value}
                                onValueChange={(val) => {
                                  typeField.onChange(val);
                                  // Reset selection when switching types
                                  setValue(`lines.${index}.productId`, "");
                                  setValue(`lines.${index}.comboId`, "");
                                  setValue(`lines.${index}.salePrice`, 0);
                                }}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="product">
                                    {t("form.lineTypeProduct")}
                                  </SelectItem>
                                  <SelectItem value="combo">
                                    {t("form.lineTypeCombo")}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </FormField>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                          {isCombo ? (
                            /* Combo selector */
                            <FormField
                              error={
                                (
                                  errors.lines?.[index] as
                                    | Record<string, { message?: string }>
                                    | undefined
                                )?.comboId?.message
                              }
                            >
                              <Label>{t("fields.combo")} *</Label>
                              <Controller
                                name={`lines.${index}.comboId`}
                                control={control}
                                render={({ field: selectField }) => (
                                  <SearchableSelect
                                    options={comboOptions}
                                    value={selectField.value ?? ""}
                                    onValueChange={(val) =>
                                      handleComboChange(index, val)
                                    }
                                    placeholder={t("fields.comboPlaceholder")}
                                    searchPlaceholder={tCommon("search")}
                                    emptyMessage={tCommon("noResults")}
                                  />
                                )}
                              />
                            </FormField>
                          ) : (
                            /* Product selector */
                            <FormField
                              error={
                                (
                                  errors.lines?.[index] as
                                    | Record<string, { message?: string }>
                                    | undefined
                                )?.productId?.message
                              }
                            >
                              <Label>{t("fields.product")} *</Label>
                              <Controller
                                name={`lines.${index}.productId`}
                                control={control}
                                render={({ field: selectField }) => (
                                  <ProductSearchSelect
                                    value={selectField.value ?? ""}
                                    onValueChange={selectField.onChange}
                                    placeholder={t("fields.productPlaceholder")}
                                    searchPlaceholder={tCommon("search")}
                                    emptyMessage={tCommon("noResults")}
                                  />
                                )}
                              />
                            </FormField>
                          )}

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

                          {isCombo ? (
                            /* Combo price — readonly, auto-filled */
                            <FormField>
                              <Label>{t("fields.salePrice")}</Label>
                              <Controller
                                name={`lines.${index}.salePrice`}
                                control={control}
                                render={({ field: priceField }) => (
                                  <CurrencyInput
                                    value={priceField.value}
                                    onChange={priceField.onChange}
                                    disabled
                                  />
                                )}
                              />
                            </FormField>
                          ) : (
                            /* Product price — editable */
                            <FormField
                              error={errors.lines?.[index]?.salePrice?.message}
                            >
                              <Label>{t("fields.salePrice")} *</Label>
                              <Controller
                                name={`lines.${index}.salePrice`}
                                control={control}
                                render={({ field: priceField }) => (
                                  <CurrencyInput
                                    value={priceField.value}
                                    onChange={priceField.onChange}
                                  />
                                )}
                              />
                            </FormField>
                          )}
                        </div>
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
                  );
                })}
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
      </CompanyRequiredGuard>
    </div>
  );
}
