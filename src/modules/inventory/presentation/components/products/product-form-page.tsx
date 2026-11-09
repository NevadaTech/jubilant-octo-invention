"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { ArrowLeft, Loader2, ScanBarcode } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { CurrencyInput } from "@/ui/components/currency-input";
import { Label } from "@/ui/components/label";
import { FormField } from "@/ui/components/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
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
import { CategoryMultiSelector } from "@/modules/inventory/presentation/components/categories/category-multi-selector";
import { CompanySelector } from "@/modules/companies/presentation/components/company-selector";
import { BrandSelector } from "@/modules/brands/presentation/components/brand-selector";
import { ProductReferencePhoto } from "./product-reference-photo";
import { useOrgSettings } from "@/shared/presentation/hooks/use-org-settings";

interface ProductFormPageProps {
  productId?: string;
}

export function ProductFormPage({ productId }: ProductFormPageProps) {
  const t = useTranslations("inventory.products");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { multiCompanyEnabled } = useOrgSettings();
  const isEditing = Boolean(productId);

  const { data: existingProduct, isLoading: isLoadingProduct } = useProduct(
    productId || "",
  );
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

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
      unitOfMeasure: "unit",
      price: 0,
      categoryIds: [],
      companyId: undefined,
      brandId: "",
      barcode: "",
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
        unitOfMeasure: existingProduct.unitOfMeasure,
        price: existingProduct.price,
        categoryIds: existingProduct.categories.map((c) => c.id),
        companyId: existingProduct.companyId || undefined,
        brandId: existingProduct.brandId || "",
        barcode: existingProduct.barcode || "",
      });
    }
  }, [isEditing, existingProduct, reset]);

  const onSubmit = async (data: CreateProductFormData) => {
    try {
      if (isEditing && productId) {
        const dto = toUpdateProductDto(data);
        await updateProduct.mutateAsync({ id: productId, data: dto });
        router.push(`/dashboard/inventory/products/${productId}`);
      } else {
        const dto = toCreateProductDto(data);
        const newProduct = await createProduct.mutateAsync(dto);
        router.push(`/dashboard/inventory/products/${newProduct.id}`);
      }
    } catch {
      // Error is handled by the mutation
    }
  };

  if (isLoadingProduct && isEditing) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/inventory/products">
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

      {isEditing && productId && existingProduct ? (
        <Card>
          <CardContent className="p-6">
            <ProductReferencePhoto
              productId={productId}
              productName={existingProduct.name}
              imageUrl={existingProduct.imageUrl}
            />
          </CardContent>
        </Card>
      ) : null}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t("form.productInfo")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {mutationError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {(
                  mutationError as Error & {
                    response?: { data?: { message?: string } };
                  }
                )?.response?.data?.message || t("form.error")}
              </div>
            )}

            {/* Basic Info */}
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

            <FormField error={errors.barcode?.message}>
              <Label htmlFor="barcode">{t("fields.barcode")}</Label>
              <div className="relative">
                <ScanBarcode
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="barcode"
                  inputMode="numeric"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder={t("fields.barcodePlaceholder")}
                  aria-describedby="barcode-helper"
                  className="pl-9 font-mono tracking-wider"
                  {...register("barcode")}
                />
              </div>
              {!errors.barcode?.message && (
                <p
                  id="barcode-helper"
                  className="text-xs text-muted-foreground"
                >
                  {t("fields.barcodeHelper")}
                </p>
              )}
            </FormField>

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

            <FormField>
              <Label>{t("fields.brand")}</Label>
              <BrandSelector
                value={watch("brandId")}
                onChange={(v) => setValue("brandId", v ?? "")}
                allowClear
              />
            </FormField>

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
                <CurrencyInput
                  id="price"
                  value={watch("price")}
                  onChange={(val) => setValue("price", val)}
                />
              </FormField>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t pt-6">
              <Button asChild type="button" variant="outline">
                <Link href="/dashboard/inventory/products">
                  {tCommon("cancel")}
                </Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting
                  ? tCommon("loading")
                  : isEditing
                    ? tCommon("save")
                    : tCommon("create")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
