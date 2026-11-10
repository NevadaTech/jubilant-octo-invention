"use client";

import { useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatDateTimeMedium } from "@/lib/date";
import { Link, useRouter } from "@/i18n/navigation";
import { PageHeader } from "@/ui/layout/page-header";
import { Button } from "@/ui/components/button";
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

  const handleDelete = async () => {
    await deleteContact.mutateAsync(contactId);
    setDeleteDialogOpen(false);
    router.push("/dashboard/contacts");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full max-w-[480px] rounded-xl" />
      </div>
    );
  }

  if (isError || !contact) {
    return (
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard/contacts"
          className="text-sm font-semibold text-primary"
        >
          {t("detail.backToList")}
        </Link>
        <div>
          <h1 className="text-[26px] font-semibold">{t("detail.notFound")}</h1>
          <p className="mt-2 text-sm text-destructive">
            {t("detail.notFoundDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={contact.name}
        action={
          <Button asChild className="rounded-lg">
            <Link href={`/dashboard/contacts/${contactId}/edit`}>
              {t("actions.edit")}
            </Link>
          </Button>
        }
      />
      <ContactTypeBadge type={contact.type} />

      <div className="flex max-w-[480px] flex-col gap-2">
        <Fact label={t("fields.email")}>{contact.email || "—"}</Fact>
        <Fact label={t("fields.phone")}>{contact.phone || "—"}</Fact>
        <Fact label={t("fields.identification")}>
          <span className="font-mono">{contact.identification}</span>
        </Fact>
        <Fact label={t("fields.address")}>{contact.address || "—"}</Fact>
        <Fact label={t("fields.salesCount")}>{contact.salesCount}</Fact>
        <Fact label={t("fields.notes")}>{contact.notes || "—"}</Fact>
        <Fact label={t("fields.status")}>
          {contact.isActive ? t("status.active") : t("status.inactive")}
        </Fact>
        <Fact label={t("fields.createdAt")}>
          {formatDateTimeMedium(contact.createdAt, locale)}
        </Fact>
        <Fact label={t("fields.updatedAt")}>
          {formatDateTimeMedium(contact.updatedAt, locale)}
        </Fact>
      </div>

      <Button
        variant="outline"
        className="w-fit rounded-lg border-destructive text-destructive hover:bg-destructive/10"
        onClick={() => setDeleteDialogOpen(true)}
        disabled={contact.salesCount > 0}
      >
        {tCommon("delete")}
      </Button>

      <Link
        href="/dashboard/contacts"
        className="text-sm font-semibold text-primary"
      >
        {t("detail.backToList")}
      </Link>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl sm:max-w-[500px]">
          <AlertDialogHeader>
            <p className="text-xs font-semibold text-primary">{t("title")}</p>
            <AlertDialogTitle>{t("delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-start">
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

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-border bg-card px-3.5 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{children}</span>
    </div>
  );
}
