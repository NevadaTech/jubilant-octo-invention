"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { FormField } from "@/ui/components/form-field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/select";
import { useWarehouses } from "@/modules/inventory/presentation/hooks/use-warehouses";
import { useContacts } from "@/modules/contacts/presentation/hooks/use-contacts";
import { useOrgSettings } from "@/shared/presentation/hooks/use-org-settings";
import {
  useCreateIntegration,
  useUpdateIntegration,
} from "@/modules/integrations/presentation/hooks/use-integrations";
import {
  vtexConnectionSchema,
  toCreateConnectionDto,
  toUpdateConnectionDto,
  type VtexConnectionFormData,
} from "@/modules/integrations/presentation/schemas/integration-connection.schema";
import type { IntegrationConnection } from "@/modules/integrations/domain/entities/integration-connection.entity";

interface VtexConnectionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  connection?: IntegrationConnection | null;
}

export function VtexConnectionForm({
  open,
  onOpenChange,
  mode,
  connection,
}: VtexConnectionFormProps) {
  const t = useTranslations("integrations");
  const tCommon = useTranslations("common");
  const isEditing = mode === "edit";
  const { multiCompanyEnabled } = useOrgSettings();

  const { data: warehousesResult } = useWarehouses();
  const warehouses = warehousesResult?.data ?? [];

  const { data: contactsResult } = useContacts({ limit: 100 });
  const contacts = contactsResult?.data ?? [];

  const createIntegration = useCreateIntegration();
  const updateIntegration = useUpdateIntegration();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<VtexConnectionFormData>({
    resolver: zodResolver(vtexConnectionSchema),
    defaultValues:
      isEditing && connection
        ? {
            accountName: connection.accountName,
            storeName: connection.storeName,
            appKey: "placeholder-key",
            appToken: "placeholder-token",
            syncStrategy: connection.syncStrategy,
            syncDirection: connection.syncDirection,
            defaultWarehouseId: connection.defaultWarehouseId,
            defaultContactId: connection.defaultContactId || "",
            companyId: connection.companyId || "",
          }
        : {
            accountName: "",
            storeName: "",
            appKey: "",
            appToken: "",
            syncStrategy: "BOTH",
            syncDirection: "BIDIRECTIONAL",
            defaultWarehouseId: "",
            defaultContactId: "",
            companyId: "",
          },
  });

  const onSubmit = async (data: VtexConnectionFormData) => {
    try {
      if (isEditing && connection) {
        const dto = toUpdateConnectionDto(data);
        await updateIntegration.mutateAsync({ id: connection.id, data: dto });
      } else {
        const dto = toCreateConnectionDto(data);
        await createIntegration.mutateAsync(dto);
      }
      reset();
      onOpenChange(false);
    } catch {
      // handled by mutation
    }
  };

  const isPending = createIntegration.isPending || updateIntegration.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("form.editTitle") : t("form.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t("form.editDescription")
              : t("form.createDescription")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {!isEditing && (
            <FormField error={errors.accountName?.message}>
              <Label htmlFor="accountName">{t("form.accountName")} *</Label>
              <Input
                id="accountName"
                {...register("accountName")}
                placeholder={t("form.accountNamePlaceholder")}
              />
            </FormField>
          )}

          <FormField error={errors.storeName?.message}>
            <Label htmlFor="storeName">{t("form.storeName")} *</Label>
            <Input
              id="storeName"
              {...register("storeName")}
              placeholder={t("form.storeNamePlaceholder")}
            />
          </FormField>

          <FormField error={errors.appKey?.message}>
            <Label htmlFor="appKey">
              {t("form.appKey")} {!isEditing && "*"}
            </Label>
            <Input
              id="appKey"
              type="password"
              {...register("appKey")}
              placeholder={
                isEditing
                  ? t("form.appKeyUpdatePlaceholder")
                  : t("form.appKeyPlaceholder")
              }
            />
          </FormField>

          <FormField error={errors.appToken?.message}>
            <Label htmlFor="appToken">
              {t("form.appToken")} {!isEditing && "*"}
            </Label>
            <Input
              id="appToken"
              type="password"
              {...register("appToken")}
              placeholder={
                isEditing
                  ? t("form.appTokenUpdatePlaceholder")
                  : t("form.appTokenPlaceholder")
              }
            />
          </FormField>

          <FormField error={errors.syncStrategy?.message}>
            <Label>{t("form.syncStrategy")} *</Label>
            <Controller
              name="syncStrategy"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEBHOOK">Webhook</SelectItem>
                    <SelectItem value="POLLING">Polling</SelectItem>
                    <SelectItem value="BOTH">
                      {t("form.syncStrategyBoth")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField error={errors.syncDirection?.message}>
            <Label>{t("form.syncDirection")} *</Label>
            <Controller
              name="syncDirection"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INBOUND">
                      {t("syncDirection.inbound")}
                    </SelectItem>
                    <SelectItem value="OUTBOUND">
                      {t("syncDirection.outbound")}
                    </SelectItem>
                    <SelectItem value="BIDIRECTIONAL">
                      {t("syncDirection.bidirectional")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField error={errors.defaultWarehouseId?.message}>
            <Label>{t("form.warehouse")} *</Label>
            <Controller
              name="defaultWarehouseId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("form.warehousePlaceholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField>
            <Label>{t("form.defaultContact")}</Label>
            <Controller
              name="defaultContactId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("form.defaultContactPlaceholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          {multiCompanyEnabled && (
            <FormField>
              <Label>{t("form.company")}</Label>
              <Controller
                name="companyId"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder={t("form.companyPlaceholder")}
                  />
                )}
              />
            </FormField>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending
                ? tCommon("loading")
                : isEditing
                  ? tCommon("save")
                  : t("actions.connect")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
