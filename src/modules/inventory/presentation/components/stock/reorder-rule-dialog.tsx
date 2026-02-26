"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/ui/components/dialog";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { FormField } from "@/ui/components/form-field";
import {
  reorderRuleSchema,
  type ReorderRuleFormData,
} from "@/modules/inventory/presentation/schemas/reorder-rule.schema";
import {
  useReorderRules,
  useCreateReorderRule,
  useUpdateReorderRule,
  useDeleteReorderRule,
} from "@/modules/inventory/presentation/hooks/use-reorder-rules";
import type { ReorderRuleApiDto } from "@/modules/inventory/application/dto/reorder-rule.dto";

interface ReorderRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  warehouseId: string;
  productName: string;
  warehouseName: string;
}

export function ReorderRuleDialog({
  open,
  onOpenChange,
  productId,
  warehouseId,
  productName,
  warehouseName,
}: ReorderRuleDialogProps) {
  const t = useTranslations("inventory.stock.reorderRule");
  const { data: rules } = useReorderRules();
  const createMutation = useCreateReorderRule();
  const updateMutation = useUpdateReorderRule();
  const deleteMutation = useDeleteReorderRule();
  const [existingRule, setExistingRule] = useState<ReorderRuleApiDto | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReorderRuleFormData>({
    resolver: zodResolver(reorderRuleSchema),
    defaultValues: { minQty: 0, maxQty: 50, safetyQty: 0 },
  });

  // Find existing rule for this product+warehouse
  useEffect(() => {
    if (rules && open) {
      const found = rules.find(
        (r) => r.productId === productId && r.warehouseId === warehouseId,
      );
      setExistingRule(found ?? null);
      if (found) {
        reset({
          minQty: found.minQty,
          maxQty: found.maxQty,
          safetyQty: found.safetyQty,
        });
      } else {
        reset({ minQty: 0, maxQty: 50, safetyQty: 0 });
      }
    }
  }, [rules, productId, warehouseId, open, reset]);

  const onSubmit = async (data: ReorderRuleFormData) => {
    if (existingRule) {
      await updateMutation.mutateAsync({
        id: existingRule.id,
        dto: {
          minQty: data.minQty,
          maxQty: data.maxQty,
          safetyQty: data.safetyQty,
        },
      });
    } else {
      await createMutation.mutateAsync({
        productId,
        warehouseId,
        minQty: data.minQty,
        maxQty: data.maxQty,
        safetyQty: data.safetyQty,
      });
    }
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (existingRule) {
      await deleteMutation.mutateAsync(existingRule.id);
      onOpenChange(false);
    }
  };

  const isBusy =
    isSubmitting ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {existingRule ? t("editTitle") : t("createTitle")}
          </DialogTitle>
          <DialogDescription>
            {productName} &mdash; {warehouseName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField error={errors.minQty?.message}>
            <Label htmlFor="minQty">{t("fields.minQty")}</Label>
            <Input
              id="minQty"
              type="number"
              step="any"
              {...register("minQty", { valueAsNumber: true })}
            />
          </FormField>

          <FormField error={errors.maxQty?.message}>
            <Label htmlFor="maxQty">{t("fields.maxQty")}</Label>
            <Input
              id="maxQty"
              type="number"
              step="any"
              {...register("maxQty", { valueAsNumber: true })}
            />
          </FormField>

          <FormField error={errors.safetyQty?.message}>
            <Label htmlFor="safetyQty">{t("fields.safetyQty")}</Label>
            <Input
              id="safetyQty"
              type="number"
              step="any"
              {...register("safetyQty", { valueAsNumber: true })}
            />
          </FormField>

          <DialogFooter className="flex justify-between gap-2">
            {existingRule && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isBusy}
              >
                {t("delete")}
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isBusy}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isBusy}>
                {existingRule ? t("update") : t("create")}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
