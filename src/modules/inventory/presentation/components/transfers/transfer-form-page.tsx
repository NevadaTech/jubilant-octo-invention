"use client";

import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
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
import {
  createTransferSchema,
  toCreateTransferDto,
  type CreateTransferFormData,
} from "../../schemas/transfer.schema";
import { useCreateTransfer } from "../../hooks/use-transfers";
import { useProducts } from "../../hooks/use-products";
import { useWarehouses } from "../../hooks/use-warehouses";

export function TransferFormPage() {
  const t = useTranslations("inventory.transfers");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const createTransfer = useCreateTransfer();
  const { data: productsData } = useProducts({ limit: 100, isActive: true });
  const { data: warehousesData } = useWarehouses({
    limit: 100,
    isActive: true,
  });

  const isSubmitting = createTransfer.isPending;

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CreateTransferFormData>({
    resolver: zodResolver(createTransferSchema),
    defaultValues: {
      fromWarehouseId: "",
      toWarehouseId: "",
      lines: [{ productId: "", quantity: 1 }],
      note: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const selectedFromWarehouse = watch("fromWarehouseId");
  const selectedProducts = watch("lines").map((line) => line.productId);

  // Filter out the source warehouse from destination options
  const toWarehouseOptions =
    warehousesData?.data.filter((w) => w.id !== selectedFromWarehouse) || [];

  // Filter out already selected products for each line
  const getAvailableProducts = (currentIndex: number) => {
    const selectedInOtherLines = selectedProducts.filter(
      (_, i) => i !== currentIndex,
    );
    return (
      productsData?.data.filter(
        (product) => !selectedInOtherLines.includes(product.id),
      ) || []
    );
  };

  const onSubmit = async (data: CreateTransferFormData) => {
    try {
      const dto = toCreateTransferDto(data);
      const newTransfer = await createTransfer.mutateAsync(dto);
      router.push(`/dashboard/inventory/transfers/${newTransfer.id}`);
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleAddLine = () => {
    append({ productId: "", quantity: 1 });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/inventory/transfers">
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

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t("form.transferInfo")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {createTransfer.isError && (
              <div className="rounded-md bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                {t("form.error")}
              </div>
            )}

            {/* Warehouse Selection */}
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <FormField error={errors.fromWarehouseId?.message}>
                  <Label>{t("fields.from")} *</Label>
                  <Controller
                    name="fromWarehouseId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("fields.fromPlaceholder")}
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

              <ArrowRight className="mb-3 h-5 w-5 text-muted-foreground" />

              <div className="flex-1">
                <FormField error={errors.toWarehouseId?.message}>
                  <Label>{t("fields.to")} *</Label>
                  <Controller
                    name="toWarehouseId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger disabled={!selectedFromWarehouse}>
                          <SelectValue
                            placeholder={t("fields.toPlaceholder")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {toWarehouseOptions.map((warehouse) => (
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
            </div>

            {/* Products Lines */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{t("fields.products")} *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddLine}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  {t("actions.addProduct")}
                </Button>
              </div>

              {errors.lines?.message && (
                <p className="text-sm text-destructive">
                  {errors.lines.message}
                </p>
              )}

              <div className="space-y-3 rounded-md border p-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-3">
                    <div className="flex-1">
                      <FormField
                        error={errors.lines?.[index]?.productId?.message}
                      >
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
                                {getAvailableProducts(index).map((product) => (
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
                    </div>
                    <div className="w-32">
                      <FormField
                        error={errors.lines?.[index]?.quantity?.message}
                      >
                        <Input
                          type="number"
                          min="1"
                          placeholder={t("fields.qty")}
                          {...register(`lines.${index}.quantity`, {
                            valueAsNumber: true,
                          })}
                        />
                      </FormField>
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mt-1"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <FormField error={errors.note?.message}>
              <Label>{t("fields.notes")}</Label>
              <Input
                placeholder={t("fields.notesPlaceholder")}
                {...register("note")}
              />
            </FormField>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t pt-6">
              <Button asChild type="button" variant="outline">
                <Link href="/dashboard/inventory/transfers">
                  {tCommon("cancel")}
                </Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? tCommon("loading") : tCommon("create")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
