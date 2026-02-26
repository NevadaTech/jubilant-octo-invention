import { getTranslations, setRequestLocale } from "next-intl/server";
import { ReturnList } from "@/modules/returns/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function ReturnsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("returns");

  return (
    <RequirePermission permission={PERMISSIONS.RETURNS_READ}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {t("title")}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            {t("description")}
          </p>
        </div>
        <ReturnList />
      </div>
    </RequirePermission>
  );
}
