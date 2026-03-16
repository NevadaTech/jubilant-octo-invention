"use client";

import { useMemo } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { X, Plus, Trash2 } from "lucide-react";
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
import { SearchableSelect } from "@/ui/components/searchable-select";
import { Textarea } from "@/ui/components/textarea";
import { CurrencyInput } from "@/ui/components/currency-input";
import {
  createMovementSchema,
  toCreateMovementDto,
  type CreateMovementFormData,
} from "@/modules/inventory/presentation/schemas/movement.schema";
import { useCreateMovement } from "@/modules/inventory/presentation/hooks/use-movements";
import { useProducts } from "@/modules/inventory/presentation/hooks/use-products";
import { useWarehouses } from "@/modules/inventory/presentation/hooks/use-warehouses";
import { useCompanyStore } from "@/modules/companies/infrastructure/store/company.store";
import { useContacts } from "@/modules/contacts/presentation/hooks/use-contacts";

interface MovementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MovementForm({ open, onOpenChange }: MovementFormProps) {
  const t = useTranslations("inventory.movements");
  const tCommon = useTranslations("common");
  const createMovement = useCreateMovement();
  const selectedCompanyId = useCompanyStore((s) => s.selectedCompanyId);
  const { data: productsData } = useProducts({
    limit: 100,
    statuses: ["ACTIVE"],
    ...(selectedCompanyId && { companyId: selectedCompanyId }),
  });
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
  } = useForm<CreateMovementFormData>({
    resolver: zodResolver(createMovementSchema),
    defaultValues: {
      warehouseId: "",
      type: "IN",
      contactId: "",
      reference: "",
      reason: "",
      note: "",
      lines: [{ productId: "", quantity: 1, unitCost: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const watchType = watch("type");

  const productOptions = useMemo(() => {
    if (!productsData?.data) return [];
    return productsData.data.map((p) => ({
      value: p.id,
      label: p.name,
      description: p.sku,
    }));
  }, [productsData]);

  const { data: suppliersData } = useContacts({
    type: "SUPPLIER",
    isActive: true,
    limit: 100,
  });

  const onSubmit = async (data: CreateMovementFormData) => {
    try {
      const dto = toCreateMovementDto(data);
      await createMovement.mutateAsync(dto);
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

  const addLine = () => {
    append({ productId: "", quantity: 1, unitCost: undefined });
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
            <fieldset disabled={createMovement.isPending} className="space-y-6">
              {createMovement.isError && (
                <div className="rounded-md bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  {t("form.error")}
                </div>
              )}

              {/* Movement Info Section */}
              <div className="space-y-4">
                <h3 className="font-medium">{t("form.movementInfo")}</h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField error={errors.type?.message}>
                    <Label>{t("fields.type")}</Label>
                    <Controller
                      name="type"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IN">{t("types.in")}</SelectItem>
                            <SelectItem value="OUT">
                              {t("types.out")}
                            </SelectItem>
                            <SelectItem value="ADJUST_IN">
                              {t("types.adjust_in")}
                            </SelectItem>
                            <SelectItem value="ADJUST_OUT">
                              {t("types.adjust_out")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormField>

                  <FormField error={errors.warehouseId?.message}>
                    <Label>{t("fields.warehouse")}</Label>
                    <Controller
                      name="warehouseId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("fields.warehousePlaceholder")}
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

                {watchType === "IN" && (
                  <FormField error={errors.contactId?.message}>
                    <Label>{t("fields.supplier")}</Label>
                    <Controller
                      name="contactId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value || ""}
                          onValueChange={(val) =>
                            field.onChange(val || undefined)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("fields.supplierPlaceholder")}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliersData?.data.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormField>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField error={errors.reference?.message}>
                    <Label>{t("fields.reference")}</Label>
                    <Input
                      placeholder={t("fields.referencePlaceholder")}
                      {...register("reference")}
                    />
                  </FormField>

                  <FormField error={errors.reason?.message}>
                    <Label>{t("fields.reason")}</Label>
                    <Input
                      placeholder={t("fields.reasonPlaceholder")}
                      {...register("reason")}
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
              </div>

              {/* Products Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{t("form.linesSection")}</h3>
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

                {errors.lines?.message && (
                  <p className="text-sm text-destructive">
                    {errors.lines.message}
                  </p>
                )}

                {fields.length === 0 ? (
                  <div className="rounded-md border border-dashed p-4 text-center text-muted-foreground">
                    {t("form.noLines")}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex items-start gap-3 rounded-md border p-3"
                      >
                        <div className="flex-1 grid grid-cols-3 gap-3">
                          <FormField
                            error={errors.lines?.[index]?.productId?.message}
                          >
                            <Label className="text-xs">
                              {t("fields.product")}
                            </Label>
                            <Controller
                              name={`lines.${index}.productId`}
                              control={control}
                              render={({ field: selectField }) => (
                                <SearchableSelect
                                  options={productOptions}
                                  value={selectField.value}
                                  onValueChange={selectField.onChange}
                                  placeholder={t("fields.productPlaceholder")}
                                  searchPlaceholder={tCommon("search")}
                                  emptyMessage={tCommon("noResults")}
                                />
                              )}
                            />
                          </FormField>

                          <FormField
                            error={errors.lines?.[index]?.quantity?.message}
                          >
                            <Label className="text-xs">
                              {t("fields.quantity")}
                            </Label>
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
                            <Label className="text-xs">
                              {t("fields.unitCost")}
                            </Label>
                            <Controller
                              name={`lines.${index}.unitCost`}
                              control={control}
                              render={({ field }) => (
                                <CurrencyInput
                                  value={field.value}
                                  onChange={(val) =>
                                    field.onChange(val === 0 ? undefined : val)
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
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleClose}>
                  {tCommon("cancel")}
                </Button>
                <Button type="submit" disabled={createMovement.isPending}>
                  {createMovement.isPending
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
