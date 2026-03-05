"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { FormField } from "@/ui/components/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { CategoryMultiSelector } from "@/modules/inventory/presentation/components/categories/category-multi-selector";
import { CompanySelector } from "@/modules/companies/presentation/components/company-selector";
import { useOrgSettings } from "@/shared/presentation/hooks/use-org-settings";
import {
  createProductSchema,
  toCreateProductDto,
  toUpdateProductDto,
  type CreateProductFormData,
} from "@/modules/inventory/presentation/schemas/product.schema";
import {
  useCreateProduct,
  useUpdateProduct,
  useProduct,
} from "@/modules/inventory/presentation/hooks/use-products";
import { useProductFormState } from "@/modules/inventory/presentation/hooks/use-inventory-store";

export function ProductForm() {
  const t = useTranslations("inventory.products");
  const tCommon = useTranslations("common");
  const { multiCompanyEnabled } = useOrgSettings();
  const { isOpen, editingId, close } = useProductFormState();
  const { data: existingProduct, isLoading: isLoadingProduct } = useProduct(
    editingId || "",
  );
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const isEditing = Boolean(editingId);
  const isSubmitting = createProduct.isPending || updateProduct.isPending;
  const mutationError = createProduct.error || updateProduct.error;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      sku: "",
      name: "",
      description: "",
      categoryIds: [],
      unitOfMeasure: "unit",
      price: 0,
      companyId: undefined,
    },
  });

  const selectedCategoryIds = watch("categoryIds");

  // Populate form when editing
  useEffect(() => {
    if (isEditing && existingProduct) {
      reset({
        sku: existingProduct.sku,
        name: existingProduct.name,
        description: existingProduct.description || "",
        categoryIds: existingProduct.categories.map((c) => c.id),
        unitOfMeasure: existingProduct.unitOfMeasure,
        price: existingProduct.price,
        companyId: existingProduct.companyId || undefined,
      });
    } else if (!isEditing) {
      reset({
        sku: "",
        name: "",
        description: "",
        categoryIds: [],
        unitOfMeasure: "unit",
        price: 0,
        companyId: undefined,
      });
    }
  }, [isEditing, existingProduct, reset]);

  const onSubmit = async (data: CreateProductFormData) => {
    try {
      if (isEditing && editingId) {
        const dto = toUpdateProductDto(data);
        await updateProduct.mutateAsync({ id: editingId, data: dto });
      } else {
        const dto = toCreateProductDto(data);
        await createProduct.mutateAsync(dto);
      }
      close();
      reset();
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleClose = () => {
    close();
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {isEditing ? t("form.editTitle") : t("form.createTitle")}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingProduct && isEditing ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {mutationError && (
                <div className="rounded-md bg-error-100 p-3 text-sm text-error-700 dark:bg-error-900/20 dark:text-error-400">
                  {(
                    mutationError as Error & {
                      response?: { data?: { message?: string } };
                    }
                  )?.response?.data?.message || t("form.error")}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField error={errors.sku?.message}>
                  <Label htmlFor="sku">{t("fields.sku")} *</Label>
                  <Input
                    id="sku"
                    placeholder={t("fields.skuPlaceholder")}
                    disabled={isEditing}
                    {...register("sku")}
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

              <FormField error={errors.description?.message}>
                <Label htmlFor="description">{t("fields.description")}</Label>
                <Input
                  id="description"
                  placeholder={t("fields.descriptionPlaceholder")}
                  {...register("description")}
                />
              </FormField>

              <FormField>
                <Label>{t("fields.category")}</Label>
                <CategoryMultiSelector
                  value={selectedCategoryIds || []}
                  onChange={(ids) => setValue("categoryIds", ids)}
                />
              </FormField>

              {multiCompanyEnabled && (
                <FormField>
                  <Label>{t("fields.company")}</Label>
                  <CompanySelector
                    value={watch("companyId")}
                    onChange={(v) => setValue("companyId", v)}
                    allowClear
                  />
                </FormField>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField error={errors.unitOfMeasure?.message}>
                  <Label htmlFor="unitOfMeasure">
                    {t("fields.unitOfMeasure")} *
                  </Label>
                  <Input
                    id="unitOfMeasure"
                    placeholder={t("fields.unitOfMeasurePlaceholder")}
                    {...register("unitOfMeasure")}
                  />
                </FormField>

                <FormField error={errors.price?.message}>
                  <Label htmlFor="price">{t("fields.price")}</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...register("price", { valueAsNumber: true })}
                  />
                </FormField>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  {tCommon("cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? tCommon("loading")
                    : isEditing
                      ? tCommon("save")
                      : tCommon("create")}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
