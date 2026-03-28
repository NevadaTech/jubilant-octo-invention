import { getTranslations } from "next-intl/server";
import { BrandList } from "@/modules/brands/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function BrandsPage({ params }: Props) {
  const { locale: _locale } = await params;
  const t = await getTranslations(`inventory.brands`);

  return (
    <RequirePermission permission={PERMISSIONS.BRANDS_READ}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("list.title")}
          </h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <BrandList />
      </div>
    </RequirePermission>
  );
}
