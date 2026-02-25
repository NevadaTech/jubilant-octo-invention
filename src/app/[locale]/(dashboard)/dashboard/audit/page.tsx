import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuditLogList } from "@/modules/audit/presentation/components";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AuditPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.audit");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <AuditLogList />
    </div>
  );
}
