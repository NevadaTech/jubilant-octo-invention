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
  useCompany,
  useCreateCompany,
  useUpdateCompany,
} from "@/modules/companies/presentation/hooks/use-companies";
import {
  createCompanySchema,
  type CreateCompanyFormData,
} from "@/modules/companies/presentation/schemas/company.schema";

interface CompanyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId: string | null;
}

export function CompanyForm({ open, onOpenChange, editId }: CompanyFormProps) {
  const t = useTranslations("inventory.companies");
  const tCommon = useTranslations("common");
  const isEditing = Boolean(editId);

  const { data: company } = useCompany(editId || "");
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCompanyFormData>({
    resolver: zodResolver(createCompanySchema),
  });

  useEffect(() => {
    if (isEditing && company) {
      reset({
        name: company.name,
        code: company.code,
        description: company.description || undefined,
      });
    } else if (!isEditing) {
      reset({ name: "", code: "", description: "" });
    }
  }, [isEditing, company, reset]);

  const onSubmit = async (data: CreateCompanyFormData) => {
    if (isEditing && editId) {
      await updateCompany.mutateAsync({ id: editId, data });
    } else {
      await createCompany.mutateAsync(data);
    }
    onOpenChange(false);
    reset();
  };

  const isPending = createCompany.isPending || updateCompany.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("form.editTitle") : t("form.createTitle")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("fields.name")}</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder={t("form.namePlaceholder")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">{t("fields.code")}</Label>
            <Input
              id="code"
              {...register("code")}
              placeholder={t("form.codePlaceholder")}
              disabled={isEditing}
            />
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code.message}</p>
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
