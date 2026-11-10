import { setRequestLocale } from "next-intl/server";
import { SaleList } from "@/modules/sales/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function SalesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <RequirePermission permission={PERMISSIONS.SALES_READ}>
      <SaleList />
    </RequirePermission>
  );
}
