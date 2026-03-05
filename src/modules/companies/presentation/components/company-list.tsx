"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, MoreHorizontal, Pencil, Trash2, Building2 } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Badge } from "@/ui/components/badge";
import { Skeleton } from "@/ui/components/skeleton";
import { Input } from "@/ui/components/input";
import { TablePagination } from "@/ui/components/table-pagination";
import { SortableHeader } from "@/ui/components/sortable-header";
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
  useCompanies,
  useDeleteCompany,
} from "@/modules/companies/presentation/hooks/use-companies";
import type { CompanyFilters } from "@/modules/companies/application/dto/company.dto";
import { CompanyForm } from "./company-form";

export function CompanyList() {
  const t = useTranslations("inventory.companies");
  const tCommon = useTranslations("common");

  const [filters, setFiltersState] = useState<CompanyFilters>({
    page: 1,
    limit: 10,
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);

  const { data, isLoading, isError } = useCompanies(filters);
  const deleteCompany = useDeleteCompany();

  const setFilters = (patch: Partial<CompanyFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...patch }));
  };

  const handleSort = (field: string, order: "asc" | "desc" | undefined) => {
    setFilters({
      sortBy: order ? (field as CompanyFilters["sortBy"]) : undefined,
      sortOrder: order,
      page: 1,
    });
  };

  const handleDelete = async () => {
    if (companyToDelete) {
      await deleteCompany.mutateAsync(companyToDelete);
      setDeleteDialogOpen(false);
      setCompanyToDelete(null);
    }
  };

  const openEdit = (id: string) => {
    setEditId(id);
    setFormOpen(true);
  };

  const openCreate = () => {
    setEditId(null);
    setFormOpen(true);
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
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              {t("actions.new")}
            </Button>
          </div>
          <div className="mt-2">
            <Input
              placeholder={t("filters.search")}
              value={filters.search || ""}
              onChange={(e) => setFilters({ search: e.target.value, page: 1 })}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={`skel-${i}`} className="h-16 w-full" />
              ))}
            </div>
          ) : !data?.data.length ? (
            <div className="py-10 text-center">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">{t("empty.title")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("empty.description")}
              </p>
              <Button className="mt-4" onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                {t("actions.new")}
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
                        label={t("fields.code")}
                        field="code"
                        currentSortBy={filters.sortBy}
                        currentSortOrder={filters.sortOrder}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label={t("fields.products")}
                        field="productCount"
                        currentSortBy={filters.sortBy}
                        currentSortOrder={filters.sortOrder}
                        onSort={handleSort}
                      />
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
                    {data.data.map((company) => (
                      <tr key={company.id} className="border-b">
                        <td className="py-4 pr-4">
                          <div>
                            <p className="font-medium">{company.name}</p>
                            {company.description && (
                              <p className="text-sm text-muted-foreground truncate max-w-xs">
                                {company.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {company.code}
                          </code>
                        </td>
                        <td className="py-4 pr-4">{company.productCount}</td>
                        <td className="py-4 pr-4">
                          <Badge
                            variant={company.isActive ? "success" : "secondary"}
                          >
                            {company.isActive
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
                              <DropdownMenuItem
                                onClick={() => openEdit(company.id)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                {t("actions.edit")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setCompanyToDelete(company.id);
                                  setDeleteDialogOpen(true);
                                }}
                                disabled={company.productCount > 0}
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
                onPageChange={(p) => setFilters({ page: p })}
                onPageSizeChange={(size) =>
                  setFilters({ limit: size, page: 1 })
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

      <CompanyForm open={formOpen} onOpenChange={setFormOpen} editId={editId} />

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
              {deleteCompany.isPending ? tCommon("loading") : tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
