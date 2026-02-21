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
} from "../../schemas/category.schema";
import {
  useCreateCategory,
  useUpdateCategory,
  useCategory,
  useCategories,
} from "../../hooks/use-categories";
import { useCategoryFormState } from "../../hooks/use-inventory-store";

export function CategoryForm() {
  const t = useTranslations("inventory.categories");
  const tCommon = useTranslations("common");
  const { isOpen, editingId, close } = useCategoryFormState();
  const { data: existingCategory, isLoading: isLoadingCategory } = useCategory(
    editingId || "",
  );
  const { data: categoriesData } = useCategories({ limit: 100 });
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const isEditing = Boolean(editingId);
  const isSubmitting = createCategory.isPending || updateCategory.isPending;

  // Filter out the current category and its children from parent options
  const parentOptions =
    categoriesData?.data.filter((cat) => cat.id !== editingId) || [];

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
    } else if (!isEditing) {
      reset({
        name: "",
        description: "",
        parentId: "",
      });
    }
  }, [isEditing, existingCategory, reset]);

  const onSubmit = async (data: CreateCategoryFormData) => {
    try {
      if (isEditing && editingId) {
        const dto = toUpdateCategoryDto(data);
        await updateCategory.mutateAsync({ id: editingId, data: dto });
      } else {
        const dto = toCreateCategoryDto(data);
        await createCategory.mutateAsync(dto);
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
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {isEditing ? t("form.editTitle") : t("form.createTitle")}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingCategory && isEditing ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {(createCategory.isError || updateCategory.isError) && (
                <div className="rounded-md bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  {t("form.error")}
                </div>
              )}

              <FormField error={errors.name?.message}>
                <Label htmlFor="name">{t("fields.name")}</Label>
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
