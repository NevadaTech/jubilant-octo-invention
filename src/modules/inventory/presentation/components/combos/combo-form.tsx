"use client";

import { useEffect } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Lock } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { Textarea } from "@/ui/components/textarea";
import { FormField } from "@/ui/components/form-field";
import { CurrencyInput } from "@/ui/components/currency-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/select";
import {
  useCombo,
  useCreateCombo,
  useUpdateCombo,
} from "@/modules/inventory/presentation/hooks/use-combos";
import {
  createComboSchema,
  updateComboSchema,
  toCreateComboDto,
  toUpdateComboDto,
  type CreateComboFormData,
  type UpdateComboFormData,
} from "@/modules/inventory/presentation/schemas/combo.schema";
import { ComboItemSelector } from "./combo-item-selector";

interface ComboFormProps {
  comboId?: string;
}

export function ComboForm({ comboId }: ComboFormProps) {
  const t = useTranslations("inventory.combos");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const isEditing = Boolean(comboId);
  const { data: existingCombo, isLoading: isLoadingCombo } = useCombo(
    comboId || "",
  );
  const createCombo = useCreateCombo();
  const updateCombo = useUpdateCombo();

  const isSubmitting = createCombo.isPending || updateCombo.isPending;
  const mutationError = createCombo.error || updateCombo.error;

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateComboFormData>({
    resolver: zodResolver(
      isEditing ? updateComboSchema : createComboSchema,
    ) as Resolver<CreateComboFormData>,
    defaultValues: {
      sku: "",
      name: "",
      description: "",
      price: 0,
      currency: "COP",
      items: [{ productId: "", quantity: 1 }],
    },
  });

  const comboItems = watch("items");

  // Populate form when editing
  useEffect(() => {
    if (isEditing && existingCombo) {
      reset({
        sku: existingCombo.sku,
        name: existingCombo.name,
        description: existingCombo.description || "",
        price: existingCombo.price,
        currency: existingCombo.currency,
        items: existingCombo.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
    }
  }, [isEditing, existingCombo, reset]);

  const onSubmit = async (data: CreateComboFormData) => {
    try {
      if (isEditing && comboId) {
        const dto = toUpdateComboDto(data as UpdateComboFormData);
        await updateCombo.mutateAsync({ id: comboId, data: dto });
      } else {
        const dto = toCreateComboDto(data);
        await createCombo.mutateAsync(dto);
      }
      router.push("/dashboard/inventory/combos");
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/inventory/combos");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEditing ? t("form.editTitle") : t("form.createTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingCombo && isEditing ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset disabled={isSubmitting} className="space-y-4">
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
                  <div className="relative">
                    <Input
                      id="sku"
                      placeholder={t("form.skuPlaceholder")}
                      disabled={isEditing}
                      {...register("sku")}
                    />
                    {isEditing && (
                      <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    )}
                  </div>
                </FormField>

                <FormField error={errors.name?.message}>
                  <Label htmlFor="name">{t("fields.name")} *</Label>
                  <Input
                    id="name"
                    placeholder={t("form.namePlaceholder")}
                    {...register("name")}
                  />
                </FormField>
              </div>

              <FormField error={errors.description?.message}>
                <Label htmlFor="description">{t("fields.description")}</Label>
                <Textarea
                  id="description"
                  placeholder={t("form.descriptionPlaceholder")}
                  {...register("description")}
                />
              </FormField>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField error={errors.price?.message}>
                  <Label htmlFor="price">{t("fields.price")} *</Label>
                  <Controller
                    name="price"
                    control={control}
                    render={({ field }) => (
                      <CurrencyInput
                        id="price"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="0"
                      />
                    )}
                  />
                </FormField>

                <FormField error={errors.currency?.message}>
                  <Label htmlFor="currency">{t("fields.currency")}</Label>
                  <Controller
                    name="currency"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || "COP"}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="COP">COP</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
              </div>

              <ComboItemSelector
                items={comboItems}
                onChange={(newItems) => setValue("items", newItems)}
                disabled={isSubmitting}
                error={errors.items?.message || errors.items?.root?.message}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCancel}>
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
            </fieldset>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
