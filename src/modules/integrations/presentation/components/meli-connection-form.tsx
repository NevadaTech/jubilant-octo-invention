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
import { useCompanies } from "@/modules/companies/presentation/hooks/use-companies";
import { useOrgSettings } from "@/shared/presentation/hooks/use-org-settings";
import { useCreateIntegration } from "@/modules/integrations/presentation/hooks/use-integrations";
import {
  meliConnectionSchema,
  toMeliCreateConnectionDto,
  type MeliConnectionFormData,
} from "@/modules/integrations/presentation/schemas/integration-connection.schema";

interface MeliConnectionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MeliConnectionForm({
  open,
  onOpenChange,
}: MeliConnectionFormProps) {
  const t = useTranslations("integrations");
  const tCommon = useTranslations("common");
  const { multiCompanyEnabled } = useOrgSettings();

  const { data: warehousesResult } = useWarehouses();
  const warehouses = warehousesResult?.data ?? [];

  const { data: contactsResult } = useContacts({ limit: 100 });
  const contacts = contactsResult?.data ?? [];

  const { data: companiesResult } = useCompanies({ isActive: true });
  const companies = companiesResult?.data ?? [];

  const createIntegration = useCreateIntegration();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<MeliConnectionFormData>({
    resolver: zodResolver(meliConnectionSchema),
    defaultValues: {
      storeName: "",
      clientId: "",
      clientSecret: "",
      syncStrategy: "BOTH",
      syncDirection: "INBOUND",
      defaultWarehouseId: "",
      defaultContactId: "",
      companyId: "",
    },
  });

  const onSubmit = async (data: MeliConnectionFormData) => {
    try {
      const dto = toMeliCreateConnectionDto(data);
      await createIntegration.mutateAsync(dto);
      reset();
      onOpenChange(false);
    } catch {
      // handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("providers.mercadolibre.addConnection")}</DialogTitle>
          <DialogDescription>
            {t("providers.mercadolibre.formDescription")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <FormField error={errors.storeName?.message}>
            <Label htmlFor="meliStoreName">{t("form.storeName")} *</Label>
            <Input
              id="meliStoreName"
              {...register("storeName")}
              placeholder={t("form.storeNamePlaceholder")}
            />
          </FormField>

          <FormField error={errors.clientId?.message}>
            <Label htmlFor="meliClientId">
              {t("providers.mercadolibre.form.clientId")} *
            </Label>
            <Input
              id="meliClientId"
              {...register("clientId")}
              placeholder={t("providers.mercadolibre.form.clientIdPlaceholder")}
            />
          </FormField>

          <FormField error={errors.clientSecret?.message}>
            <Label htmlFor="meliClientSecret">
              {t("providers.mercadolibre.form.clientSecret")} *
            </Label>
            <Input
              id="meliClientSecret"
              type="password"
              {...register("clientSecret")}
              placeholder={t(
                "providers.mercadolibre.form.clientSecretPlaceholder",
              )}
            />
          </FormField>

          <FormField error={errors.syncStrategy?.message}>
            <Label>{t("form.syncStrategy")} *</Label>
            <Controller
              name="syncStrategy"
              control={control}
              render={({ field }) => {
                const strategyLabels: Record<string, string> = {
                  WEBHOOK: "Webhook",
                  POLLING: "Polling",
                  BOTH: t("form.syncStrategyBoth"),
                };
                return (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue>{strategyLabels[field.value]}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WEBHOOK">Webhook</SelectItem>
                      <SelectItem value="POLLING">Polling</SelectItem>
                      <SelectItem value="BOTH">
                        {t("form.syncStrategyBoth")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                );
              }}
            />
          </FormField>

          <FormField>
            <Label>{t("form.syncDirection")}</Label>
            <Input
              value={t("syncDirection.inbound")}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              {t("providers.mercadolibre.inboundOnly")}
            </p>
          </FormField>

          <FormField error={errors.defaultWarehouseId?.message}>
            <Label>{t("form.warehouse")} *</Label>
            <Controller
              name="defaultWarehouseId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.warehousePlaceholder")} />
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
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("form.companyPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
            <Button type="submit" disabled={createIntegration.isPending}>
              {createIntegration.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {createIntegration.isPending
                ? tCommon("loading")
                : tCommon("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
