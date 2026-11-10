import { setRequestLocale } from "next-intl/server";
import { BrandList } from "@/modules/brands/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function BrandsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <RequirePermission permission={PERMISSIONS.BRANDS_READ}>
      <BrandList />
    </RequirePermission>
  );
}
