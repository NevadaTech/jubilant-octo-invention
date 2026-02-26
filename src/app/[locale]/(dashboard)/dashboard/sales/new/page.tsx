import { setRequestLocale } from "next-intl/server";
import { SaleFormPage } from "@/modules/sales/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function NewSalePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <RequirePermission permission={PERMISSIONS.SALES_CREATE}>
      <SaleFormPage />
    </RequirePermission>
  );
}
