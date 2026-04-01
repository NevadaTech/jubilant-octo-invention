"use client";

import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { X, ArrowRight, Plus, Trash2 } from "lucide-react";
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
import { ProductSearchSelect } from "@/modules/inventory/presentation/components/shared/product-search-select";
import {
  createTransferSchema,
  toCreateTransferDto,
  type CreateTransferFormData,
} from "@/modules/inventory/presentation/schemas/transfer.schema";
import { useCreateTransfer } from "@/modules/inventory/presentation/hooks/use-transfers";
import { useWarehouses } from "@/modules/inventory/presentation/hooks/use-warehouses";
import { useCompanyStore } from "@/modules/companies/infrastructure/store/company.store";

interface TransferFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransferForm({ open, onOpenChange }: TransferFormProps) {
  const t = useTranslations("inventory.transfers");
  const tCommon = useTranslations("common");
  const createTransfer = useCreateTransfer();
  const selectedCompanyId = useCompanyStore((s) => s.selectedCompanyId);
  const { data: warehousesData } = useWarehouses({
    limit: 100,
    statuses: ["ACTIVE"],
  });

  const {
    register,
    handleSubmit,
    reset,
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

  // Filter out the source warehouse from destination options
  const toWarehouseOptions =
    warehousesData?.data.filter((w) => w.id !== selectedFromWarehouse) || [];

  const onSubmit = async (data: CreateTransferFormData) => {
    try {
      const dto = toCreateTransferDto(data);
      await createTransfer.mutateAsync(dto);
      onOpenChange(false);
      reset();
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  const handleAddLine = () => {
    append({ productId: "", quantity: 1 });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("form.createTitle")}</CardTitle>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset disabled={createTransfer.isPending} className="space-y-4">
              {createTransfer.isError && (
                <div className="rounded-md bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  {t("form.error")}
                </div>
              )}

              {/* Warehouses Selection */}
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <FormField error={errors.fromWarehouseId?.message}>
                    <Label>{t("fields.from")}</Label>
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
                              <SelectItem
                                key={warehouse.id}
                                value={warehouse.id}
                              >
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
                    <Label>{t("fields.to")}</Label>
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
                              <SelectItem
                                key={warehouse.id}
                                value={warehouse.id}
                              >
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
                  <Label>{t("fields.products")}</Label>
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

                <div className="space-y-3 rounded-md border p-3">
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
                              <ProductSearchSelect
                                value={selectField.value}
                                onValueChange={selectField.onChange}
                                companyId={selectedCompanyId ?? undefined}
                                placeholder={t("fields.productPlaceholder")}
                                searchPlaceholder={t("fields.searchProduct")}
                                emptyMessage={t("fields.noProducts")}
                              />
                            )}
                          />
                        </FormField>
                      </div>
                      <div className="w-24">
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

              <FormField error={errors.note?.message}>
                <Label>{t("fields.notes")}</Label>
                <Input
                  placeholder={t("fields.notesPlaceholder")}
                  {...register("note")}
                />
              </FormField>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  {tCommon("cancel")}
                </Button>
                <Button type="submit" disabled={createTransfer.isPending}>
                  {createTransfer.isPending
                    ? tCommon("loading")
                    : tCommon("create")}
                </Button>
              </div>
            </fieldset>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
