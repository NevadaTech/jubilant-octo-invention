"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Badge } from "@/ui/components/badge";
import { Skeleton } from "@/ui/components/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/components/alert-dialog";
import {
  useContact,
  useDeleteContact,
} from "@/modules/contacts/presentation/hooks/use-contacts";
import { ContactTypeBadge } from "./contact-type-badge";

interface ContactDetailProps {
  contactId: string;
}

export function ContactDetail({ contactId }: ContactDetailProps) {
  const locale = useLocale();
  const t = useTranslations("contacts");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { data: contact, isLoading, isError } = useContact(contactId);
  const deleteContact = useDeleteContact();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const handleDelete = async () => {
    await deleteContact.mutateAsync(contactId);
    setDeleteDialogOpen(false);
    router.push("/dashboard/contacts");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (isError || !contact) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/contacts">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{t("detail.notFound")}</h1>
        </div>
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-destructive">
              {t("detail.notFoundDescription")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/contacts">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {contact.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {contact.identification}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/dashboard/contacts/${contactId}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              {t("actions.edit")}
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={contact.salesCount > 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {tCommon("delete")}
          </Button>
        </div>
      </div>

      {/* Contact Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t("detail.info")}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t("fields.name")}
              </dt>
              <dd className="mt-1 text-sm">{contact.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t("fields.identification")}
              </dt>
              <dd className="mt-1 text-sm">
                <code className="bg-muted px-2 py-1 rounded">
                  {contact.identification}
                </code>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t("fields.type")}
              </dt>
              <dd className="mt-1">
                <ContactTypeBadge type={contact.type} />
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t("fields.status")}
              </dt>
              <dd className="mt-1">
                <Badge variant={contact.isActive ? "success" : "secondary"}>
                  {contact.isActive ? t("status.active") : t("status.inactive")}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t("fields.address")}
              </dt>
              <dd className="mt-1 text-sm">{contact.address || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t("fields.salesCount")}
              </dt>
              <dd className="mt-1 text-sm">{contact.salesCount}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-muted-foreground">
                {t("fields.notes")}
              </dt>
              <dd className="mt-1 text-sm whitespace-pre-wrap">
                {contact.notes || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t("fields.createdAt")}
              </dt>
              <dd className="mt-1 text-sm">{formatDate(contact.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t("fields.updatedAt")}
              </dt>
              <dd className="mt-1 text-sm">{formatDate(contact.updatedAt)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteContact.isPending ? tCommon("loading") : tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
