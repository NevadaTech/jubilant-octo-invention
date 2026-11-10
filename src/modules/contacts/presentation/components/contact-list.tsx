"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/ui/layout/page-header";
import { Button } from "@/ui/components/button";
import { Skeleton } from "@/ui/components/skeleton";
import { Input } from "@/ui/components/input";
import { TablePagination } from "@/ui/components/table-pagination";
import { SortableHeader } from "@/ui/components/sortable-header";
import { MultiSelect } from "@/ui/components/multi-select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/components/dropdown-menu";
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
  useContacts,
  useDeleteContact,
} from "@/modules/contacts/presentation/hooks/use-contacts";
import { ContactTypeBadge } from "./contact-type-badge";
import type { Contact } from "@/modules/contacts/domain/entities/contact.entity";
import type { ContactFilters } from "@/modules/contacts/application/dto/contact.dto";

export function ContactList() {
  const t = useTranslations("contacts");
  const tCommon = useTranslations("common");

  const [filters, setFilters] = useState<ContactFilters>({
    page: 1,
    limit: 10,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);

  const { data, isLoading, isError } = useContacts(filters);
  const deleteContact = useDeleteContact();

  const patchFilters = (patch: Partial<ContactFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const handleSort = (field: string, order: "asc" | "desc" | undefined) => {
    patchFilters({
      sortBy: order ? (field as ContactFilters["sortBy"]) : undefined,
      sortOrder: order,
      page: 1,
    });
  };

  const handleDelete = async () => {
    if (contactToDelete) {
      await deleteContact.mutateAsync(contactToDelete);
      setDeleteDialogOpen(false);
      setContactToDelete(null);
    }
  };

  const askDelete = (contact: Contact) => {
    setContactToDelete(contact.id);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t("list.title")}
        description={t("description")}
        action={
          <Button asChild className="rounded-lg">
            <Link href="/dashboard/contacts/new">{t("actions.new")}</Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder={t("filters.search")}
          value={filters.search || ""}
          onChange={(event) =>
            patchFilters({ search: event.target.value, page: 1 })
          }
          className="h-11 max-w-sm rounded-lg"
        />
        <MultiSelect
          value={filters.types || []}
          onValueChange={(values) =>
            patchFilters({
              types: values.length
                ? (values as ContactFilters["types"])
                : undefined,
              type:
                values.length === 1
                  ? (values[0] as ContactFilters["type"])
                  : undefined,
              page: 1,
            })
          }
          options={[
            { value: "CUSTOMER", label: t("types.CUSTOMER") },
            { value: "SUPPLIER", label: t("types.SUPPLIER") },
            { value: "EMPLOYEE", label: t("types.EMPLOYEE") },
          ]}
          placeholder={t("filters.type")}
          allLabel={t("filters.allTypes")}
          selectedLabel={t("filters.type")}
          className="w-full sm:w-[180px]"
        />
        <MultiSelect
          value={filters.statuses || []}
          onValueChange={(values) =>
            patchFilters({
              statuses: values.length ? values : undefined,
              isActive:
                values.length === 1 ? values[0] === "ACTIVE" : undefined,
              page: 1,
            })
          }
          options={[
            { value: "ACTIVE", label: t("status.active") },
            { value: "INACTIVE", label: t("status.inactive") },
          ]}
          placeholder={t("filters.status")}
          allLabel={t("filters.allStatuses")}
          selectedLabel={t("filters.status")}
          className="w-full sm:w-[180px]"
        />
      </div>

      {isError ? (
        <p className="rounded-xl border border-border bg-card px-4 py-10 text-center text-destructive">
          {t("error.loading")}
        </p>
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          {["a", "b", "c", "d", "e"].map((id) => (
            <Skeleton key={id} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : !data?.data.length ? (
        <div className="rounded-xl border border-border bg-card px-4 py-10 text-center">
          <h2 className="text-lg font-semibold">{t("empty.title")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("empty.description")}
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted text-xs font-semibold text-muted-foreground">
                  <SortableHeader
                    label={t("fields.name")}
                    field="name"
                    currentSortBy={filters.sortBy}
                    currentSortOrder={filters.sortOrder}
                    onSort={handleSort}
                    className="px-3"
                  />
                  <SortableHeader
                    label={t("fields.type")}
                    field="type"
                    currentSortBy={filters.sortBy}
                    currentSortOrder={filters.sortOrder}
                    onSort={handleSort}
                    className="px-3"
                  />
                  <th className="px-3 pb-3">{tCommon("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((contact) => (
                  <tr key={contact.id} className="border-t border-border">
                    <td className="px-3 py-3">
                      <Link
                        href={`/dashboard/contacts/${contact.id}`}
                        className="font-medium hover:underline"
                      >
                        {contact.name}
                      </Link>
                      <p className="font-mono text-xs text-muted-foreground">
                        {contact.identification}
                      </p>
                      <p>{contact.address || "-"}</p>
                    </td>
                    <td className="px-3 py-3">
                      <ContactTypeBadge type={contact.type} />
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-2">
                        <Link
                          href={`/dashboard/contacts/${contact.id}`}
                          className="text-sm hover:underline"
                        >
                          {t("actions.view")}
                        </Link>
                        <ContactMenu
                          contact={contact}
                          onDelete={() => askDelete(contact)}
                        />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="flex flex-col gap-3 lg:hidden">
            {data.data.map((contact) => (
              <li
                key={contact.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-3.5"
              >
                <Link
                  href={`/dashboard/contacts/${contact.id}`}
                  className="min-w-0"
                >
                  <span className="block text-[15px] font-semibold">
                    {contact.name}
                  </span>
                  <span className="mt-1 flex items-center gap-2">
                    <ContactTypeBadge type={contact.type} />
                    <span className="font-mono text-xs text-muted-foreground">
                      {contact.identification}
                    </span>
                  </span>
                </Link>
                <ContactMenu
                  contact={contact}
                  onDelete={() => askDelete(contact)}
                />
              </li>
            ))}
          </ul>

          <TablePagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            total={data.pagination.total}
            limit={data.pagination.limit}
            onPageChange={(page) => patchFilters({ page })}
            onPageSizeChange={(limit) => patchFilters({ limit, page: 1 })}
            showingLabel={tCommon("pagination.showing", {
              from: (data.pagination.page - 1) * data.pagination.limit + 1,
              to: Math.min(
                data.pagination.page * data.pagination.limit,
                data.pagination.total,
              ),
              total: data.pagination.total,
            })}
            perPageLabel={tCommon("pagination.perPage")}
            allLabel={tCommon("pagination.all")}
          />
        </>
      )}

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

function ContactMenu({
  contact,
  onDelete,
}: {
  contact: Contact;
  onDelete: () => void;
}) {
  const t = useTranslations("contacts");
  const tCommon = useTranslations("common");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("actions.view")}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/contacts/${contact.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            {t("actions.view")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/contacts/${contact.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            {t("actions.edit")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDelete}
          disabled={contact.salesCount > 0}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {tCommon("delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
