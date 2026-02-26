import { getTranslations, setRequestLocale } from "next-intl/server";
import { PagePlaceholder } from "@/ui/components/page-placeholder";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function ImportsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.imports");

  return (
    <RequirePermission permission={PERMISSIONS.PRODUCTS_IMPORT}>
      <PagePlaceholder title={t("title")} description={t("description")} />
    </RequirePermission>
  );
}
