"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { FormField } from "@/ui/components/form-field";
import { Textarea } from "@/ui/components/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Skeleton } from "@/ui/components/skeleton";
import { Switch } from "@/ui/components/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/select";
import {
  useContact,
  useCreateContact,
  useUpdateContact,
} from "@/modules/contacts/presentation/hooks/use-contacts";
import {
  updateContactSchema,
  toCreateContactDto,
  toUpdateContactDto,
  type UpdateContactFormData,
} from "@/modules/contacts/presentation/schemas/contact.schema";

interface ContactFormPageProps {
  mode: "create" | "edit";
  contactId?: string;
}

export function ContactFormPage({ mode, contactId }: ContactFormPageProps) {
  const t = useTranslations("contacts");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const isEditing = mode === "edit";

  const { data: contact, isLoading: isLoadingContact } = useContact(
    contactId || "",
  );
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdateContactFormData>({
    resolver: zodResolver(updateContactSchema),
    defaultValues: {
      name: "",
      identification: "",
      type: "CUSTOMER",
      email: "",
      phone: "",
      address: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (isEditing && contact) {
      reset({
        name: contact.name,
        identification: contact.identification,
        type: contact.type,
        email: contact.email || "",
        phone: contact.phone || "",
        address: contact.address || "",
        notes: contact.notes || "",
        isActive: contact.isActive,
      });
    }
  }, [isEditing, contact, reset]);

  const onSubmit = async (data: UpdateContactFormData) => {
    try {
      if (isEditing && contactId) {
        const dto = toUpdateContactDto(data);
        await updateContact.mutateAsync({ id: contactId, data: dto });
        router.push(`/dashboard/contacts/${contactId}`);
      } else {
        const dto = toCreateContactDto(data);
        await createContact.mutateAsync(dto);
        router.push("/dashboard/contacts");
      }
    } catch {
      // Error is handled by the mutation
    }
  };

  const isPending = createContact.isPending || updateContact.isPending;
  const isError = createContact.isError || updateContact.isError;

  if (isEditing && isLoadingContact) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link
            href={
              isEditing && contactId
                ? `/dashboard/contacts/${contactId}`
                : "/dashboard/contacts"
            }
          >
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {isError && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {t("form.error")}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{t("form.contactInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField error={errors.name?.message}>
              <Label htmlFor="name">{t("fields.name")} *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder={t("form.namePlaceholder")}
              />
            </FormField>

            <FormField error={errors.identification?.message}>
              <Label htmlFor="identification">
                {t("fields.identification")} *
              </Label>
              <Input
                id="identification"
                {...register("identification")}
                placeholder={t("form.identificationPlaceholder")}
              />
            </FormField>

            <FormField error={errors.type?.message}>
              <Label>{t("fields.type")} *</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("form.typePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CUSTOMER">
                        {t("types.CUSTOMER")}
                      </SelectItem>
                      <SelectItem value="SUPPLIER">
                        {t("types.SUPPLIER")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField error={errors.email?.message}>
                <Label htmlFor="email">{t("fields.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder={t("form.emailPlaceholder")}
                />
              </FormField>

              <FormField error={errors.phone?.message}>
                <Label htmlFor="phone">{t("fields.phone")}</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder={t("form.phonePlaceholder")}
                />
              </FormField>
            </div>

            <FormField error={errors.address?.message}>
              <Label htmlFor="address">{t("fields.address")}</Label>
              <Textarea
                id="address"
                {...register("address")}
                placeholder={t("form.addressPlaceholder")}
                rows={2}
              />
            </FormField>

            <FormField error={errors.notes?.message}>
              <Label htmlFor="notes">{t("fields.notes")}</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder={t("form.notesPlaceholder")}
                rows={3}
              />
            </FormField>

            {isEditing && (
              <div className="flex items-center gap-3">
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="isActive"
                      checked={field.value ?? true}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="isActive">{t("fields.isActive")}</Label>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link
              href={
                isEditing && contactId
                  ? `/dashboard/contacts/${contactId}`
                  : "/dashboard/contacts"
              }
            >
              {tCommon("cancel")}
            </Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending
              ? tCommon("loading")
              : isEditing
                ? tCommon("save")
                : tCommon("create")}
          </Button>
        </div>
      </form>
    </div>
  );
}
