"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { FormField } from "@/ui/components/form-field";
import { DatePicker } from "@/ui/components/date-picker";
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
import {
  useCreateIntegration,
  useUpdateIntegration,
  useTriggerSync,
} from "@/modules/integrations/presentation/hooks/use-integrations";
import {
  vtexConnectionSchema,
  updateConnectionSchema,
  toCreateConnectionDto,
  toUpdateConnectionDto,
  type VtexConnectionFormData,
  type UpdateConnectionFormData,
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

  const { data: companiesResult } = useCompanies({ isActive: true });
  const companies = companiesResult?.data ?? [];

  const createIntegration = useCreateIntegration();
  const updateIntegration = useUpdateIntegration();
  const triggerSync = useTriggerSync();

  const isPending = createIntegration.isPending || updateIntegration.isPending;

  if (isEditing) {
    return (
      <VtexEditForm
        open={open}
        onOpenChange={onOpenChange}
        connection={connection!}
        t={t}
        tCommon={tCommon}
        multiCompanyEnabled={multiCompanyEnabled}
        warehouses={warehouses}
        contacts={contacts}
        companies={companies}
        isPending={isPending}
        onSubmit={async (data, syncFromDate) => {
          const dto = toUpdateConnectionDto(data);
          await updateIntegration.mutateAsync({
            id: connection!.id,
            data: dto,
          });
          if (syncFromDate) {
            triggerSync.mutate({
              id: connection!.id,
              fromDate: new Date(syncFromDate + "T00:00:00Z").toISOString(),
            });
          }
          onOpenChange(false);
        }}
      />
    );
  }

  return (
    <VtexCreateForm
      open={open}
      onOpenChange={onOpenChange}
      t={t}
      tCommon={tCommon}
      multiCompanyEnabled={multiCompanyEnabled}
      warehouses={warehouses}
      contacts={contacts}
      companies={companies}
      isPending={isPending}
      onSubmit={async (data, syncFromDate) => {
        const dto = toCreateConnectionDto(data);
        const created = await createIntegration.mutateAsync(dto);
        if (syncFromDate) {
          triggerSync.mutate({
            id: created.id,
            fromDate: new Date(syncFromDate + "T00:00:00Z").toISOString(),
          });
        }
        onOpenChange(false);
      }}
    />
  );
}

interface SharedFormFieldsProps {
  t: ReturnType<typeof useTranslations<"integrations">>;
  isEditing: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  multiCompanyEnabled: boolean;
  warehouses: { id: string; name: string }[];
  contacts: { id: string; name: string }[];
  companies: { id: string; name: string }[];
}

function SharedFormFields({
  t,
  isEditing,
  errors,
  register,
  control,
  multiCompanyEnabled,
  warehouses,
  contacts,
  companies,
}: SharedFormFieldsProps) {
  const strategyLabels: Record<string, string> = {
    WEBHOOK: "Webhook",
    POLLING: "Polling",
    BOTH: t("form.syncStrategyBoth"),
  };

  const directionLabels: Record<string, string> = {
    INBOUND: t("syncDirection.inbound"),
    OUTBOUND: t("syncDirection.outbound"),
    BIDIRECTIONAL: t("syncDirection.bidirectional"),
  };

  return (
    <>
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
          render={({
            field,
          }: {
            field: { value: string; onChange: (v: string) => void };
          }) => (
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
          )}
        />
      </FormField>

      <FormField error={errors.syncDirection?.message}>
        <Label>{t("form.syncDirection")} *</Label>
        <Controller
          name="syncDirection"
          control={control}
          render={({
            field,
          }: {
            field: { value: string; onChange: (v: string) => void };
          }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue>{directionLabels[field.value]}</SelectValue>
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
          render={({
            field,
          }: {
            field: { value: string; onChange: (v: string) => void };
          }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder={t("form.warehousePlaceholder")}>
                  {warehouses.find((w) => w.id === field.value)?.name}
                </SelectValue>
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
          render={({
            field,
          }: {
            field: { value: string; onChange: (v: string) => void };
          }) => (
            <Select value={field.value || ""} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder={t("form.defaultContactPlaceholder")}>
                  {contacts.find((c) => c.id === field.value)?.name}
                </SelectValue>
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
            render={({
              field,
            }: {
              field: { value: string; onChange: (v: string) => void };
            }) => (
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t("form.companyPlaceholder")}>
                    {companies.find((c) => c.id === field.value)?.name}
                  </SelectValue>
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
    </>
  );
}

/* ── Create Form ── */

interface VtexCreateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  t: ReturnType<typeof useTranslations<"integrations">>;
  tCommon: ReturnType<typeof useTranslations<"common">>;
  multiCompanyEnabled: boolean;
  warehouses: { id: string; name: string }[];
  contacts: { id: string; name: string }[];
  companies: { id: string; name: string }[];
  isPending: boolean;
  onSubmit: (
    data: VtexConnectionFormData,
    syncFromDate?: string,
  ) => Promise<void>;
}

function VtexCreateForm({
  open,
  onOpenChange,
  t,
  tCommon,
  multiCompanyEnabled,
  warehouses,
  contacts,
  companies,
  isPending,
  onSubmit,
}: VtexCreateFormProps) {
  const today = new Date();
  const [syncFromDate, setSyncFromDate] = useState<Date | undefined>(today);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<VtexConnectionFormData>({
    resolver: zodResolver(vtexConnectionSchema),
    defaultValues: {
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

  const handleFormSubmit = async (data: VtexConnectionFormData) => {
    try {
      const dateStr = syncFromDate
        ? syncFromDate.toISOString().split("T")[0]
        : undefined;
      await onSubmit(data, dateStr);
      reset();
    } catch {
      // handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("form.createTitle")}</DialogTitle>
          <DialogDescription>{t("form.createDescription")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <fieldset disabled={isPending} className="space-y-4 py-4">
            <FormField error={errors.accountName?.message}>
              <Label htmlFor="accountName">{t("form.accountName")} *</Label>
              <Input
                id="accountName"
                {...register("accountName")}
                placeholder={t("form.accountNamePlaceholder")}
              />
            </FormField>

            <SharedFormFields
              t={t}
              isEditing={false}
              errors={errors}
              register={register}
              control={control}
              multiCompanyEnabled={multiCompanyEnabled}
              warehouses={warehouses}
              contacts={contacts}
              companies={companies}
            />

            <FormField>
              <Label>{t("actions.syncFromDate")}</Label>
              <DatePicker
                value={syncFromDate}
                onChange={setSyncFromDate}
                maxDate={today}
                placeholder={t("actions.syncFromDate")}
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                {t("actions.syncDialogDescription")}
              </p>
            </FormField>

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
                {isPending ? tCommon("loading") : t("actions.connect")}
              </Button>
            </DialogFooter>
          </fieldset>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ── Edit Form ── */

interface VtexEditFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection: IntegrationConnection;
  t: ReturnType<typeof useTranslations<"integrations">>;
  tCommon: ReturnType<typeof useTranslations<"common">>;
  multiCompanyEnabled: boolean;
  warehouses: { id: string; name: string }[];
  contacts: { id: string; name: string }[];
  companies: { id: string; name: string }[];
  isPending: boolean;
  onSubmit: (
    data: UpdateConnectionFormData,
    syncFromDate?: string,
  ) => Promise<void>;
}

function VtexEditForm({
  open,
  onOpenChange,
  connection,
  t,
  tCommon,
  multiCompanyEnabled,
  warehouses,
  contacts,
  companies,
  isPending,
  onSubmit,
}: VtexEditFormProps) {
  const today = new Date();
  const [syncFromDate, setSyncFromDate] = useState<Date | undefined>();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdateConnectionFormData>({
    resolver: zodResolver(updateConnectionSchema),
    defaultValues: {
      storeName: connection.storeName,
      appKey: "",
      appToken: "",
      syncStrategy: connection.syncStrategy,
      syncDirection: connection.syncDirection,
      defaultWarehouseId: connection.defaultWarehouseId,
      defaultContactId: connection.defaultContactId || "",
      companyId: connection.companyId || "",
    },
  });

  const handleFormSubmit = async (data: UpdateConnectionFormData) => {
    try {
      const dateStr = syncFromDate
        ? syncFromDate.toISOString().split("T")[0]
        : undefined;
      await onSubmit(data, dateStr);
      reset();
    } catch {
      // handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("form.editTitle")}</DialogTitle>
          <DialogDescription>{t("form.editDescription")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <fieldset disabled={isPending} className="space-y-4 py-4">
            <SharedFormFields
              t={t}
              isEditing={true}
              errors={errors}
              register={register}
              control={control}
              multiCompanyEnabled={multiCompanyEnabled}
              warehouses={warehouses}
              contacts={contacts}
              companies={companies}
            />

            <FormField>
              <Label>{t("actions.syncFromDate")}</Label>
              <DatePicker
                value={syncFromDate}
                onChange={setSyncFromDate}
                maxDate={today}
                placeholder={t("actions.syncFromDate")}
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                {t("actions.syncDialogDescription")}
              </p>
            </FormField>

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
                {isPending ? tCommon("loading") : tCommon("save")}
              </Button>
            </DialogFooter>
          </fieldset>
        </form>
      </DialogContent>
    </Dialog>
  );
}
