import { getTranslations, setRequestLocale } from "next-intl/server";
import { StockTable } from "@/modules/inventory/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function StockPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("inventory.stock");

  return (
    <RequirePermission permission={PERMISSIONS.INVENTORY_READ}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {t("title")}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            {t("description")}
          </p>
        </div>
        <StockTable />
      </div>
    </RequirePermission>
  );
}
