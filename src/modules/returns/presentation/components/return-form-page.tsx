"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { ArrowLeft, Loader2, Package, Plus, Trash2 } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { CurrencyInput } from "@/ui/components/currency-input";
import { Label } from "@/ui/components/label";
import { FormField } from "@/ui/components/form-field";
import { Badge } from "@/ui/components/badge";
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
  createReturnSchema,
  toCreateReturnDto,
  type CreateReturnFormData,
} from "@/modules/returns/presentation/schemas/return.schema";
import { SearchableSelect } from "@/ui/components/searchable-select";
import { useCreateReturn } from "@/modules/returns/presentation/hooks/use-returns";
import { useProducts } from "@/modules/inventory/presentation/hooks/use-products";
import { useWarehouses } from "@/modules/inventory/presentation/hooks/use-warehouses";
import { useCompanyStore } from "@/modules/companies/infrastructure/store/company.store";
import {
  useSales,
  useSale,
  useSaleReturns,
} from "@/modules/sales/presentation/hooks/use-sales";
import {
  useMovements,
  useMovement,
} from "@/modules/inventory/presentation/hooks/use-movements";
import { useCombos } from "@/modules/inventory/presentation/hooks/use-combos";

export function ReturnFormPage() {
  const t = useTranslations("returns");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const createReturn = useCreateReturn();
  const selectedCompanyId = useCompanyStore((s) => s.selectedCompanyId);
  const { data: productsData, isLoading: productsLoading } = useProducts({
    limit: 100,
    statuses: ["ACTIVE"],
    ...(selectedCompanyId && { companyId: selectedCompanyId }),
  });
  const { data: warehousesData, isLoading: warehousesLoading } = useWarehouses({
    limit: 100,
    statuses: ["ACTIVE"],
  });
  const { data: salesData, isLoading: salesLoading } = useSales({ limit: 100 });
  const { data: combosData } = useCombos({ limit: 100, isActive: true });
  const { data: movementsData, isLoading: movementsLoading } = useMovements({
    types: ["IN"],
    status: ["POSTED"],
    limit: 100,
  });

  const dataLoading =
    productsLoading || warehousesLoading || salesLoading || movementsLoading;

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

  const movementOptions = useMemo(
    () =>
      (movementsData?.data ?? []).map((mov) => ({
        value: mov.id,
        label: mov.reference || mov.id.slice(0, 8),
        description: `${mov.warehouseName} — ${mov.totalQuantity} ${t("fields.items")}`,
      })),
    [movementsData, t],
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
      sourceMovementId: "",
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
  const selectedMovementId = watch("sourceMovementId");

  // Fetch sale detail when a sale is selected
  const { data: selectedSale } = useSale(selectedSaleId || "");

  // Fetch existing returns for this sale to calculate remaining returnable quantities
  const { data: saleReturns } = useSaleReturns(
    selectedSaleId || "",
    !!selectedSaleId,
  );

  // Build a map of productId → total quantity already returned (only CONFIRMED returns)
  const alreadyReturnedMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!saleReturns?.length) return map;
    for (const ret of saleReturns) {
      if (ret.status !== "CONFIRMED") continue;
      for (const line of ret.lines) {
        map.set(line.productId, (map.get(line.productId) ?? 0) + line.quantity);
      }
    }
    return map;
  }, [saleReturns]);

  // Fetch movement detail when a movement is selected
  const { data: selectedMovement } = useMovement(selectedMovementId || "");

  // Build a comboId → name map for quick lookup
  const comboNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const combo of combosData?.data ?? []) {
      map.set(combo.id, combo.name);
    }
    return map;
  }, [combosData]);

  // Build product options from the selected sale's lines, adjusted for already-returned quantities
  const saleLineProducts = useMemo(() => {
    if (!selectedSale?.lines?.length) return [];
    return selectedSale.lines
      .map((line) => {
        const alreadyReturned = alreadyReturnedMap.get(line.productId) ?? 0;
        const remainingQuantity = line.quantity - alreadyReturned;
        return {
          productId: line.productId,
          productName: line.productName,
          productSku: line.productSku,
          quantity: remainingQuantity,
          salePrice: line.salePrice,
          currency: line.currency,
          comboId: line.comboId ?? undefined,
          comboName: line.comboId ? comboNameMap.get(line.comboId) : undefined,
        };
      })
      .filter((line) => line.quantity > 0);
  }, [selectedSale, comboNameMap, alreadyReturnedMap]);

  // Build product options from the selected movement's lines
  const movementLineProducts = useMemo(() => {
    if (!selectedMovement?.lines?.length) return [];
    return selectedMovement.lines.map((line) => ({
      productId: line.productId,
      productName: line.productName,
      productSku: line.productSku,
      quantity: line.quantity,
      unitCost: line.unitCost,
      currency: line.currency,
    }));
  }, [selectedMovement]);

  // Map productId → movement line info for quick lookup
  const movementLineMap = useMemo(() => {
    const map = new Map<
      string,
      { quantity: number; unitCost: number | null; currency: string | null }
    >();
    for (const line of movementLineProducts) {
      map.set(line.productId, {
        quantity: line.quantity,
        unitCost: line.unitCost,
        currency: line.currency,
      });
    }
    return map;
  }, [movementLineProducts]);

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

  // Get max quantity for a line (from sale or movement)
  const getMaxQuantity = useCallback(
    (productId: string) =>
      saleLineMap.get(productId)?.quantity ??
      movementLineMap.get(productId)?.quantity,
    [saleLineMap, movementLineMap],
  );

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "lines",
  });

  // When customer return sale changes, its lines load, or returns data loads, reset form lines
  const prevSaleIdRef = useRef(selectedSaleId);
  const prevSaleLineCountRef = useRef(0);
  const prevReturnedMapSizeRef = useRef(0);
  useEffect(() => {
    if (returnType !== "RETURN_CUSTOMER") return;
    // Wait until the sale detail has loaded (selectedSale exists) before replacing lines
    if (!selectedSale) return;

    const saleChanged = prevSaleIdRef.current !== selectedSaleId;
    const linesCountChanged =
      prevSaleLineCountRef.current !== saleLineProducts.length;
    const returnsJustLoaded =
      prevReturnedMapSizeRef.current === 0 && alreadyReturnedMap.size > 0;

    prevSaleIdRef.current = selectedSaleId;
    prevSaleLineCountRef.current = saleLineProducts.length;
    prevReturnedMapSizeRef.current = alreadyReturnedMap.size;

    if (!saleChanged && !linesCountChanged && !returnsJustLoaded) return;

    replace(
      saleLineProducts.map((line) => ({
        productId: line.productId,
        comboId: line.comboId,
        quantity: line.quantity,
        maxQuantity: line.quantity,
        originalSalePrice: line.salePrice,
        originalUnitCost: undefined,
      })),
    );
  }, [
    selectedSaleId,
    selectedSale,
    returnType,
    saleLineProducts,
    alreadyReturnedMap,
    replace,
  ]);

  // When supplier return movement changes and its lines load, reset form lines to match movement products
  const prevMovementIdRef = useRef(selectedMovementId);
  const prevMovementLineCountRef = useRef(0);
  useEffect(() => {
    if (returnType !== "RETURN_SUPPLIER") return;
    if (!movementLineProducts.length) return;

    const movementChanged = prevMovementIdRef.current !== selectedMovementId;
    const linesJustLoaded =
      prevMovementLineCountRef.current === 0 && movementLineProducts.length > 0;

    prevMovementIdRef.current = selectedMovementId;
    prevMovementLineCountRef.current = movementLineProducts.length;

    if (!movementChanged && !linesJustLoaded) return;

    replace(
      movementLineProducts.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
        maxQuantity: line.quantity,
        originalSalePrice: undefined,
        originalUnitCost: line.unitCost ?? undefined,
      })),
    );
  }, [selectedMovementId, returnType, movementLineProducts, replace]);

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
        setValue(`lines.${index}.quantity`, saleLine.quantity);
      }
    },
    [saleLineMap, setValue],
  );

  // When a product is picked from the movement lines, auto-fill cost & max
  const handleMovementProductChange = useCallback(
    (index: number, productId: string) => {
      setValue(`lines.${index}.productId`, productId);
      const movementLine = movementLineMap.get(productId);
      if (movementLine) {
        setValue(
          `lines.${index}.originalUnitCost`,
          movementLine.unitCost ?? undefined,
        );
        setValue(`lines.${index}.maxQuantity`, movementLine.quantity);
        setValue(`lines.${index}.quantity`, movementLine.quantity);
      }
    },
    [movementLineMap, setValue],
  );

  const isCustomerReturn = returnType === "RETURN_CUSTOMER";
  const isSupplierReturn = returnType === "RETURN_SUPPLIER";
  const hasSaleLines = isCustomerReturn && saleLineProducts.length > 0;
  const hasMovementLines = isSupplierReturn && movementLineProducts.length > 0;
  const hasSourceLines = hasSaleLines || hasMovementLines;

  // Group field indices by comboId for visual grouping
  const comboGroups = useMemo(() => {
    if (!hasSaleLines) return null;
    const groups: {
      comboId: string | null;
      comboName: string | null;
      indices: number[];
    }[] = [];
    const groupMap = new Map<string, number>(); // comboId → group index

    fields.forEach((field, index) => {
      const saleLine = saleLineProducts.find(
        (l) => l.productId === field.productId,
      );
      const comboId = saleLine?.comboId ?? null;
      const comboName = saleLine?.comboName ?? null;
      const key = comboId ?? "__standalone__";

      if (groupMap.has(key)) {
        groups[groupMap.get(key)!].indices.push(index);
      } else {
        groupMap.set(key, groups.length);
        groups.push({ comboId, comboName, indices: [index] });
      }
    });

    // Sort: combos first, standalone last
    groups.sort((a, b) => {
      if (a.comboId && !b.comboId) return -1;
      if (!a.comboId && b.comboId) return 1;
      return 0;
    });

    return groups;
  }, [fields, saleLineProducts, hasSaleLines]);

  // Loading skeleton for the form
  if (dataLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-28" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <p className="text-sm text-muted-foreground">
            {t("form.createDescription")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {createReturn.isError && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
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
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("fields.type")}>
                          {field.value === "RETURN_CUSTOMER"
                            ? t("types.customer")
                            : field.value === "RETURN_SUPPLIER"
                              ? t("types.supplier")
                              : undefined}
                        </SelectValue>
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
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("fields.warehousePlaceholder")}
                        >
                          {(() => {
                            const warehouse = warehousesData?.data.find(
                              (w) => w.id === field.value,
                            );
                            return warehouse
                              ? `${warehouse.name} (${warehouse.code})`
                              : undefined;
                          })()}
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
                      disabled={isSubmitting}
                    />
                  )}
                />
              </FormField>
            )}

            {isSupplierReturn && (
              <FormField error={errors.sourceMovementId?.message}>
                <Label>{t("fields.movementReference")}</Label>
                <Controller
                  name="sourceMovementId"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={movementOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder={t("fields.movementReferencePlaceholder")}
                      searchPlaceholder={t("fields.movementSearchPlaceholder")}
                      emptyMessage={t("fields.movementNotFound")}
                      disabled={isSubmitting}
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
                  disabled={isSubmitting}
                  {...register("reason")}
                />
              </FormField>

              <FormField error={errors.note?.message}>
                <Label>{t("fields.note")}</Label>
                <Textarea
                  placeholder={t("fields.notePlaceholder")}
                  rows={1}
                  disabled={isSubmitting}
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
              {!hasSourceLines && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLine}
                  disabled={isSubmitting}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t("actions.addLine")}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {hasSaleLines && (
              <div className="mb-4 rounded-md bg-primary-50 p-3 text-sm text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
                {t("form.saleProductsHint")}
              </div>
            )}
            {hasMovementLines && (
              <div className="mb-4 rounded-md bg-primary-50 p-3 text-sm text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
                {t("form.movementProductsHint")}
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
            ) : comboGroups && comboGroups.some((g) => g.comboId) ? (
              /* Combo-grouped rendering */
              <div className="space-y-6">
                {comboGroups.map((group) => (
                  <div
                    key={group.comboId ?? "__standalone__"}
                    className={
                      group.comboId
                        ? "rounded-lg border border-primary/20 bg-primary-50/30 p-4 dark:bg-primary-900/10"
                        : ""
                    }
                  >
                    {group.comboId ? (
                      <div className="mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">
                          {t("form.comboGroup", {
                            name: group.comboName ?? group.comboId,
                          })}
                        </span>
                      </div>
                    ) : (
                      <div className="mb-3">
                        <span className="text-sm font-semibold text-muted-foreground">
                          {t("form.standaloneProducts")}
                        </span>
                      </div>
                    )}
                    <div className="space-y-4">
                      {group.indices.map((index) => {
                        const field = fields[index];
                        return (
                          <div
                            key={field.id}
                            className="flex items-start gap-4 rounded-lg border bg-background p-4"
                          >
                            <div className="flex-1 grid grid-cols-1 gap-4 sm:grid-cols-3">
                              <FormField
                                error={
                                  errors.lines?.[index]?.productId?.message
                                }
                              >
                                <Label className="flex items-center gap-2">
                                  {t("fields.product")} *
                                  {group.comboId && (
                                    <Badge
                                      variant="info"
                                      className="text-[10px] px-1.5 py-0"
                                    >
                                      {t("form.fromCombo")}
                                    </Badge>
                                  )}
                                </Label>
                                <Controller
                                  name={`lines.${index}.productId`}
                                  control={control}
                                  render={({ field: selectField }) => (
                                    <Select
                                      value={selectField.value}
                                      onValueChange={(val) =>
                                        handleProductChange(index, val)
                                      }
                                      disabled={isSubmitting}
                                    >
                                      <SelectTrigger>
                                        <SelectValue
                                          placeholder={t(
                                            "fields.productPlaceholder",
                                          )}
                                        >
                                          {(() => {
                                            const line = saleLineProducts.find(
                                              (l) =>
                                                l.productId ===
                                                selectField.value,
                                            );
                                            return line
                                              ? `${line.productName} (${line.productSku})`
                                              : undefined;
                                          })()}
                                        </SelectValue>
                                      </SelectTrigger>
                                      <SelectContent>
                                        {saleLineProducts.map((line) => (
                                          <SelectItem
                                            key={line.productId}
                                            value={line.productId}
                                          >
                                            {line.productName} (
                                            {line.productSku})
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
                                <Label>
                                  {t("fields.quantity")} *
                                  {getMaxQuantity(field.productId) !==
                                    undefined && (
                                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                                      (max: {getMaxQuantity(field.productId)})
                                    </span>
                                  )}
                                </Label>
                                <Input
                                  type="number"
                                  min="1"
                                  max={getMaxQuantity(field.productId)}
                                  disabled={isSubmitting}
                                  {...register(`lines.${index}.quantity`, {
                                    valueAsNumber: true,
                                  })}
                                />
                              </FormField>

                              <FormField
                                error={
                                  errors.lines?.[index]?.originalSalePrice
                                    ?.message
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
                                      disabled={hasSourceLines || isSubmitting}
                                    />
                                  )}
                                />
                              </FormField>
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="mt-6 shrink-0"
                              onClick={() => remove(index)}
                              disabled={fields.length === 1 || isSubmitting}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Flat rendering (no combos, or movement/manual lines) */
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
                                disabled={isSubmitting}
                              >
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={t("fields.productPlaceholder")}
                                  >
                                    {(() => {
                                      const line = saleLineProducts.find(
                                        (l) =>
                                          l.productId === selectField.value,
                                      );
                                      return line
                                        ? `${line.productName} (${line.productSku})`
                                        : undefined;
                                    })()}
                                  </SelectValue>
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
                            ) : hasMovementLines ? (
                              <Select
                                value={selectField.value}
                                onValueChange={(val) =>
                                  handleMovementProductChange(index, val)
                                }
                                disabled={isSubmitting}
                              >
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={t("fields.productPlaceholder")}
                                  >
                                    {(() => {
                                      const line = movementLineProducts.find(
                                        (l) =>
                                          l.productId === selectField.value,
                                      );
                                      return line
                                        ? `${line.productName} (${line.productSku})`
                                        : undefined;
                                    })()}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {movementLineProducts.map((line) => (
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
                                disabled={isSubmitting}
                              >
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={t("fields.productPlaceholder")}
                                  >
                                    {(() => {
                                      const product = productsData?.data.find(
                                        (p) => p.id === selectField.value,
                                      );
                                      return product
                                        ? `${product.name} (${product.sku})`
                                        : undefined;
                                    })()}
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
                            )
                          }
                        />
                      </FormField>

                      <FormField
                        error={errors.lines?.[index]?.quantity?.message}
                      >
                        <Label>
                          {t("fields.quantity")} *
                          {hasSourceLines &&
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
                            hasSourceLines
                              ? getMaxQuantity(field.productId)
                              : undefined
                          }
                          disabled={isSubmitting}
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
                                disabled={hasSourceLines || isSubmitting}
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
                                disabled={hasMovementLines || isSubmitting}
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
                      className="mt-6 shrink-0"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1 || isSubmitting}
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
        <div className="flex items-center justify-end gap-3 border-t pt-4">
          <Button
            asChild
            type="button"
            variant="outline"
            disabled={isSubmitting}
          >
            <Link href="/dashboard/returns">{tCommon("cancel")}</Link>
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
