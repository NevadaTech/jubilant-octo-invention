import { setRequestLocale } from "next-intl/server";
import { WarehouseList } from "@/modules/inventory/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function WarehousesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <RequirePermission permission={PERMISSIONS.WAREHOUSES_READ}>
      <WarehouseList />
    </RequirePermission>
  );
}
