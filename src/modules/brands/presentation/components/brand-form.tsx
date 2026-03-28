"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { Textarea } from "@/ui/components/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/ui/components/dialog";
import {
  useBrand,
  useCreateBrand,
  useUpdateBrand,
} from "@/modules/brands/presentation/hooks/use-brands";
import {
  createBrandSchema,
  type CreateBrandFormData,
} from "@/modules/brands/presentation/schemas/brand.schema";

interface BrandFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId: string | null;
}

export function BrandForm({ open, onOpenChange, editId }: BrandFormProps) {
  const t = useTranslations("inventory.brands");
  const tCommon = useTranslations("common");
  const isEditing = Boolean(editId);

  const { data: brand } = useBrand(editId || "");
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateBrandFormData>({
    resolver: zodResolver(createBrandSchema),
  });

  useEffect(() => {
    if (isEditing && brand) {
      reset({
        name: brand.name,
        description: brand.description || undefined,
      });
    } else if (!isEditing) {
      reset({ name: "", description: "" });
    }
  }, [isEditing, brand, reset]);

  const onSubmit = async (data: CreateBrandFormData) => {
    if (isEditing && editId) {
      await updateBrand.mutateAsync({ id: editId, data });
    } else {
      await createBrand.mutateAsync(data);
    }
    onOpenChange(false);
    reset();
  };

  const isPending = createBrand.isPending || updateBrand.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("form.editTitle") : t("form.createTitle")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={isPending} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("fields.name")}</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder={t("form.namePlaceholder")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("fields.description")}</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder={t("form.descriptionPlaceholder")}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? tCommon("loading")
                  : isEditing
                    ? tCommon("save")
                    : tCommon("create")}
              </Button>
            </DialogFooter>
          </fieldset>
        </form>
      </DialogContent>
    </Dialog>
  );
}
