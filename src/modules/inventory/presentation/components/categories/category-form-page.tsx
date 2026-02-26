"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
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
  createCategorySchema,
  toCreateCategoryDto,
  toUpdateCategoryDto,
  type CreateCategoryFormData,
} from "@/modules/inventory/presentation/schemas/category.schema";
import {
  useCreateCategory,
  useUpdateCategory,
  useCategory,
  useCategories,
} from "@/modules/inventory/presentation/hooks/use-categories";

interface CategoryFormPageProps {
  categoryId?: string;
}

export function CategoryFormPage({ categoryId }: CategoryFormPageProps) {
  const t = useTranslations("inventory.categories");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const isEditing = Boolean(categoryId);

  const { data: existingCategory, isLoading: isLoadingCategory } = useCategory(
    categoryId || "",
  );
  const { data: categoriesData } = useCategories({ limit: 100 });
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const isSubmitting = createCategory.isPending || updateCategory.isPending;

  // Filter out the current category from parent options
  const parentOptions =
    categoriesData?.data.filter((cat) => cat.id !== categoryId) || [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateCategoryFormData>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      description: "",
      parentId: "",
    },
  });

  const selectedParentId = watch("parentId");
  const selectedParentName = parentOptions.find(
    (c) => c.id === selectedParentId,
  )?.name;

  // Populate form when editing
  useEffect(() => {
    if (isEditing && existingCategory) {
      reset({
        name: existingCategory.name,
        description: existingCategory.description || "",
        parentId: existingCategory.parentId || "",
      });
    }
  }, [isEditing, existingCategory, reset]);

  const onSubmit = async (data: CreateCategoryFormData) => {
    try {
      if (isEditing && categoryId) {
        const dto = toUpdateCategoryDto(data);
        await updateCategory.mutateAsync({ id: categoryId, data: dto });
        router.push("/dashboard/inventory/categories");
      } else {
        const dto = toCreateCategoryDto(data);
        await createCategory.mutateAsync(dto);
        router.push("/dashboard/inventory/categories");
      }
    } catch {
      // Error is handled by the mutation
    }
  };

  if (isLoadingCategory && isEditing) {
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
          <Link href="/dashboard/inventory/categories">
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

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t("form.categoryInfo")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {(createCategory.isError || updateCategory.isError) && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {t("form.error")}
              </div>
            )}

            <FormField error={errors.name?.message}>
              <Label htmlFor="name">{t("fields.name")} *</Label>
              <Input
                id="name"
                placeholder={t("fields.namePlaceholder")}
                {...register("name")}
              />
            </FormField>

            <FormField error={errors.description?.message}>
              <Label htmlFor="description">{t("fields.description")}</Label>
              <Input
                id="description"
                placeholder={t("fields.descriptionPlaceholder")}
                {...register("description")}
              />
            </FormField>

            <FormField error={errors.parentId?.message}>
              <Label htmlFor="parentId">{t("fields.parent")}</Label>
              <Select
                value={selectedParentId || ""}
                onValueChange={(value) => setValue("parentId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("fields.parentPlaceholder")}>
                    {selectedParentId
                      ? selectedParentName || selectedParentId
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t("fields.noParent")}</SelectItem>
                  {parentOptions.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t pt-6">
              <Button asChild type="button" variant="outline">
                <Link href="/dashboard/inventory/categories">
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
