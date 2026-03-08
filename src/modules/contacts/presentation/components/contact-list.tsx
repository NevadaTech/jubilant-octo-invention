"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, MoreHorizontal, Pencil, Trash2, Users, Eye } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Badge } from "@/ui/components/badge";
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

  if (isError) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-destructive">{t("error.loading")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{t("list.title")}</CardTitle>
            <Button asChild>
              <Link href="/dashboard/contacts/new">
                <Plus className="mr-2 h-4 w-4" />
                {t("actions.new")}
              </Link>
            </Button>
          </div>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder={t("filters.search")}
              value={filters.search || ""}
              onChange={(e) =>
                patchFilters({ search: e.target.value, page: 1 })
              }
              className="max-w-sm"
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
              ]}
              placeholder={t("filters.type")}
              allLabel={t("filters.allTypes")}
              selectedLabel={t("filters.type")}
              className="w-[180px]"
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
              className="w-[180px]"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {["s1", "s2", "s3", "s4", "s5"].map((id) => (
                <Skeleton key={id} className="h-16 w-full" />
              ))}
            </div>
          ) : !data?.data.length ? (
            <div className="py-10 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">{t("empty.title")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("empty.description")}
              </p>
              <Button className="mt-4" asChild>
                <Link href="/dashboard/contacts/new">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("actions.new")}
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                      <SortableHeader
                        label={t("fields.name")}
                        field="name"
                        currentSortBy={filters.sortBy}
                        currentSortOrder={filters.sortOrder}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label={t("fields.identification")}
                        field="identification"
                        currentSortBy={filters.sortBy}
                        currentSortOrder={filters.sortOrder}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label={t("fields.type")}
                        field="type"
                        currentSortBy={filters.sortBy}
                        currentSortOrder={filters.sortOrder}
                        onSort={handleSort}
                      />
                      <th className="pb-3 pr-4">{t("fields.address")}</th>
                      <th className="pb-3 pr-4">{t("fields.salesCount")}</th>
                      <SortableHeader
                        label={t("fields.status")}
                        field="isActive"
                        currentSortBy={filters.sortBy}
                        currentSortOrder={filters.sortOrder}
                        onSort={handleSort}
                      />
                      <th className="pb-3 text-right">{tCommon("actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((contact) => (
                      <tr key={contact.id} className="border-b">
                        <td className="py-4 pr-4">
                          <Link
                            href={`/dashboard/contacts/${contact.id}`}
                            className="font-medium hover:underline"
                          >
                            {contact.name}
                          </Link>
                        </td>
                        <td className="py-4 pr-4">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {contact.identification}
                          </code>
                        </td>
                        <td className="py-4 pr-4">
                          <ContactTypeBadge type={contact.type} />
                        </td>
                        <td className="py-4 pr-4">
                          <span className="text-sm text-muted-foreground truncate max-w-xs block">
                            {contact.address || "-"}
                          </span>
                        </td>
                        <td className="py-4 pr-4">{contact.salesCount}</td>
                        <td className="py-4 pr-4">
                          <Badge
                            variant={contact.isActive ? "success" : "secondary"}
                          >
                            {contact.isActive
                              ? t("status.active")
                              : t("status.inactive")}
                          </Badge>
                        </td>
                        <td className="py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/dashboard/contacts/${contact.id}`}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  {t("actions.view")}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/dashboard/contacts/${contact.id}/edit`}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  {t("actions.edit")}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setContactToDelete(contact.id);
                                  setDeleteDialogOpen(true);
                                }}
                                disabled={contact.salesCount > 0}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {tCommon("delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <TablePagination
                page={data.pagination.page}
                totalPages={data.pagination.totalPages}
                total={data.pagination.total}
                limit={data.pagination.limit}
                onPageChange={(p) => patchFilters({ page: p })}
                onPageSizeChange={(size) =>
                  patchFilters({ limit: size, page: 1 })
                }
                showingLabel={tCommon("pagination.showing", {
                  from: (data.pagination.page - 1) * data.pagination.limit + 1,
                  to: Math.min(
                    data.pagination.page * data.pagination.limit,
                    data.pagination.total,
                  ),
                  total: data.pagination.total,
                })}
                perPageLabel={tCommon("pagination.perPage")}
              />
            </>
          )}
        </CardContent>
      </Card>

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
    </>
  );
}
