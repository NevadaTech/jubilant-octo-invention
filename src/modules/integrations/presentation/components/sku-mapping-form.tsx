"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { FormField } from "@/ui/components/form-field";
import { useCreateSkuMapping } from "@/modules/integrations/presentation/hooks/use-integrations";
import {
  skuMappingSchema,
  type SkuMappingFormData,
} from "@/modules/integrations/presentation/schemas/integration-connection.schema";

interface SkuMappingFormProps {
  connectionId: string;
  defaultExternalSku?: string;
}

export function SkuMappingForm({
  connectionId,
  defaultExternalSku,
}: SkuMappingFormProps) {
  const t = useTranslations("integrations.skuMapping");
  const createMapping = useCreateSkuMapping(connectionId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SkuMappingFormData>({
    resolver: zodResolver(skuMappingSchema),
    defaultValues: {
      externalSku: defaultExternalSku || "",
      productId: "",
    },
  });

  const onSubmit = async (data: SkuMappingFormData) => {
    try {
      await createMapping.mutateAsync(data);
      reset({ externalSku: "", productId: "" });
    } catch {
      // handled by mutation
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-3">
      <FormField error={errors.externalSku?.message} className="flex-1">
        <Input
          {...register("externalSku")}
          placeholder={t("externalSkuPlaceholder")}
        />
      </FormField>
      <FormField error={errors.productId?.message} className="flex-1">
        <Input
          {...register("productId")}
          placeholder={t("productIdPlaceholder")}
        />
      </FormField>
      <Button type="submit" size="sm" disabled={createMapping.isPending}>
        {createMapping.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        {t("add")}
      </Button>
    </form>
  );
}
