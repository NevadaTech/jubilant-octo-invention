"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/ui/components/card";
import { FormField } from "@/ui/components/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/select";
import { Skeleton } from "@/ui/components/skeleton";
import { UserAvatar } from "@/ui/components/user-avatar";
import { useProfile, useUpdateProfile } from "../hooks";
import { profileSchema, type ProfileFormValues } from "../schemas";

const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern (US)" },
  { value: "America/Chicago", label: "Central (US)" },
  { value: "America/Denver", label: "Mountain (US)" },
  { value: "America/Los_Angeles", label: "Pacific (US)" },
  { value: "America/Mexico_City", label: "Mexico City" },
  { value: "America/Bogota", label: "Bogota" },
  { value: "America/Lima", label: "Lima" },
  { value: "America/Santiago", label: "Santiago" },
  { value: "America/Buenos_Aires", label: "Buenos Aires" },
  { value: "America/Sao_Paulo", label: "Sao Paulo" },
  { value: "America/Caracas", label: "Caracas" },
  { value: "America/Guatemala", label: "Guatemala" },
  { value: "America/Costa_Rica", label: "Costa Rica" },
  { value: "America/Panama", label: "Panama" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Madrid", label: "Madrid" },
  { value: "Europe/Paris", label: "Paris" },
];

export function ProfileForm() {
  const t = useTranslations("settings.profile");
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      timezone: "UTC",
      language: "en",
      jobTitle: "",
      department: "",
    },
  });

  const timezone = watch("timezone");
  const language = watch("language");

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone ?? "",
        timezone: profile.timezone ?? "UTC",
        language: (profile.language as "en" | "es") ?? "en",
        jobTitle: profile.jobTitle ?? "",
        department: profile.department ?? "",
      });
    }
  }, [profile, reset]);

  const onSubmit = (data: ProfileFormValues) => {
    updateProfile.mutate({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || undefined,
      timezone: data.timezone,
      language: data.language,
      jobTitle: data.jobTitle || undefined,
      department: data.department || undefined,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar + read-only info */}
          <div className="flex items-center gap-4">
            <UserAvatar name={profile?.email ?? ""} size={64} />
            <div>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                {profile?.email}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                @{profile?.username}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* First Name */}
            <FormField error={errors.firstName?.message}>
              <Label htmlFor="firstName">{t("firstName")}</Label>
              <Input
                id="firstName"
                {...register("firstName")}
                placeholder={t("firstName")}
              />
            </FormField>

            {/* Last Name */}
            <FormField error={errors.lastName?.message}>
              <Label htmlFor="lastName">{t("lastName")}</Label>
              <Input
                id="lastName"
                {...register("lastName")}
                placeholder={t("lastName")}
              />
            </FormField>

            {/* Phone */}
            <FormField error={errors.phone?.message}>
              <Label htmlFor="phone">{t("phone")}</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder={t("phone")}
              />
            </FormField>

            {/* Job Title */}
            <FormField error={errors.jobTitle?.message}>
              <Label htmlFor="jobTitle">{t("jobTitle")}</Label>
              <Input
                id="jobTitle"
                {...register("jobTitle")}
                placeholder={t("jobTitle")}
              />
            </FormField>

            {/* Department */}
            <FormField error={errors.department?.message}>
              <Label htmlFor="department">{t("department")}</Label>
              <Input
                id="department"
                {...register("department")}
                placeholder={t("department")}
              />
            </FormField>

            {/* Timezone */}
            <FormField error={errors.timezone?.message}>
              <Label>{t("timezone")}</Label>
              <Select
                value={timezone}
                onValueChange={(val) =>
                  setValue("timezone", val, { shouldDirty: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("timezone")} />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {/* Language */}
            <FormField error={errors.language?.message}>
              <Label>{t("language")}</Label>
              <Select
                value={language}
                onValueChange={(val) =>
                  setValue("language", val as "en" | "es", {
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("language")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!isDirty || updateProfile.isPending}
            >
              {updateProfile.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("saveChanges")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
