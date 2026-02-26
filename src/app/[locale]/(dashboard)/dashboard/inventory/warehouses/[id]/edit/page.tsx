import { setRequestLocale } from "next-intl/server";
import { WarehouseFormPage } from "@/modules/inventory/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditWarehousePage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return (
    <RequirePermission permission={PERMISSIONS.WAREHOUSES_UPDATE}>
      <WarehouseFormPage warehouseId={id} />
    </RequirePermission>
  );
}
