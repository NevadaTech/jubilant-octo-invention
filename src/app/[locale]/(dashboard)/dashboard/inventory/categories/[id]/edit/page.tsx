import { setRequestLocale } from "next-intl/server";
import { CategoryFormPage } from "@/modules/inventory/presentation/components/categories";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditCategoryPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return (
    <RequirePermission permission={PERMISSIONS.PRODUCTS_UPDATE}>
      <CategoryFormPage categoryId={id} />
    </RequirePermission>
  );
}
