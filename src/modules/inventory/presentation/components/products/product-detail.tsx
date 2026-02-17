"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Package,
  Edit,
  ArrowLeft,
  Tag,
  DollarSign,
  BarChart3,
  Calendar,
  Layers,
  TrendingUp,
  ShieldCheck,
  Warehouse,
} from "lucide-react";
import { Button } from "@/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Badge } from "@/ui/components/badge";
import { useProduct } from "../../hooks/use-products";

interface ProductDetailProps {
  productId: string;
}

function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
        <Icon className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
      </div>
      <div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
        <p className="font-medium text-neutral-900 dark:text-neutral-100">
          {value}
        </p>
      </div>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
        <div className="space-y-2">
          <div className="h-6 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-4 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="h-10 w-10 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
              <div className="h-5 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductDetail({ productId }: ProductDetailProps) {
  const t = useTranslations("inventory.products");
  const tCommon = useTranslations("common");
  const { data: product, isLoading, isError, error } = useProduct(productId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <ProductDetailSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (isError || !product) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
            <p className="text-destructive">
              {error?.message || t("detail.notFound")}
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/dashboard/inventory/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("detail.backToList")}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const margin = product.margin ?? 0;
  const averageCost = product.averageCost ?? 0;
  const profit = product.profit ?? 0;
  const totalStock = product.totalStock ?? 0;
  const minStock = product.minStock ?? 0;
  const maxStock = product.maxStock ?? 0;
  const safetyStock = product.safetyStock ?? 0;

  const marginColor =
    margin > 0
      ? "text-success-600 dark:text-success-400"
      : margin < 0
        ? "text-destructive"
        : "text-neutral-600 dark:text-neutral-300";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/inventory/products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
            <Package className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {product.name}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              {product.sku}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={product.isActive ? "success" : "secondary"}>
            {product.isActive ? t("status.active") : t("status.inactive")}
          </Badge>
          <Button asChild>
            <Link href={`/dashboard/inventory/products/${productId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              {tCommon("edit")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("detail.description")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600 dark:text-neutral-300">
              {product.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("detail.pricing")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem
              icon={DollarSign}
              label={t("fields.price")}
              value={formatCurrency(product.price)}
            />
            <DetailItem
              icon={DollarSign}
              label={t("fields.cost")}
              value={formatCurrency(averageCost)}
            />
            <DetailItem
              icon={TrendingUp}
              label={t("detail.margin")}
              value={
                <span className={marginColor}>
                  {margin > 0 ? "+" : ""}
                  {margin}%
                </span>
              }
            />
            <DetailItem
              icon={BarChart3}
              label={t("detail.profit")}
              value={formatCurrency(profit)}
            />
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("detail.inventory")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem
              icon={Layers}
              label={t("fields.unitOfMeasure")}
              value={product.unitOfMeasure}
            />
            <DetailItem
              icon={Warehouse}
              label={t("detail.totalStock")}
              value={totalStock.toLocaleString()}
            />
            <DetailItem
              icon={BarChart3}
              label={t("fields.minStock")}
              value={minStock > 0 ? minStock.toString() : "-"}
            />
            <DetailItem
              icon={BarChart3}
              label={t("fields.maxStock")}
              value={maxStock > 0 ? maxStock.toString() : "-"}
            />
            <DetailItem
              icon={ShieldCheck}
              label={t("detail.safetyStock")}
              value={safetyStock > 0 ? safetyStock.toString() : "-"}
            />
          </CardContent>
        </Card>

        {/* Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("detail.classification")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem
              icon={Tag}
              label={t("fields.category")}
              value={product.categoryName || "-"}
            />
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("detail.dates")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem
              icon={Calendar}
              label={t("detail.createdAt")}
              value={formatDate(product.createdAt)}
            />
            <DetailItem
              icon={Calendar}
              label={t("detail.updatedAt")}
              value={formatDate(product.updatedAt)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
